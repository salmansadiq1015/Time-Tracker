import timerModel from '../models/timerModel.js';

// Start Timer
export const startTimer = async (req, res) => {
  try {
    const { user, start, description, photos, project, assignment } = req.body;

    if (!start) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all the required fields',
        error: 'Please provide all the required fields',
      });
    }

    const userId = user ? user : req.user._id;

    // Check if there's already an active timer (not paused) for this user
    const existingActiveTimer = await timerModel.findOne({
      user: userId,
      isActive: true,
      $or: [{ paused: { $ne: true } }, { paused: false }, { status: { $ne: 'paused' } }],
    });

    if (existingActiveTimer) {
      return res.status(400).json({
        success: false,
        message:
          'You already have an active timer running. Please pause or stop it before starting a new one.',
        error: 'Active timer already exists',
      });
    }

    const startPhotos = Array.isArray(photos) ? photos : [];

    const timer = await timerModel.create({
      user: userId,
      project: project || undefined,
      assignment: assignment || undefined,
      start: {
        ...start,
        photos: startPhotos,
      },
      description,
      photos: startPhotos,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Timer started successfully',
      timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Stop Timer
export const stopTimer = async (req, res) => {
  try {
    const timerId = req.params.id;
    const { end, description, photos } = req.body;

    if (!end) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all the required fields',
        error: 'Please provide all the required fields',
      });
    }

    const timer = await timerModel.findById(timerId);

    const newEndPhotos = Array.isArray(photos) ? photos : [];
    const existingEndPhotos = timer.end?.photos || [];

    let updatedPhotos = timer.photos ? [...timer.photos] : [];
    if (newEndPhotos.length > 0) {
      updatedPhotos = [...updatedPhotos, ...newEndPhotos];
    }

    const endPayload = {
      ...(timer.end?.toObject ? timer.end.toObject() : timer.end),
      ...end,
      photos: newEndPhotos.length > 0 ? [...existingEndPhotos, ...newEndPhotos] : existingEndPhotos,
    };

    const updatedTimer = await timerModel.findByIdAndUpdate(
      timerId,
      {
        end: endPayload,
        description: description || timer.description,
        photos: updatedPhotos,
        isActive: false,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Timer stopped successfully',
      timer: updatedTimer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Update Timer
export const updateTimer = async (req, res) => {
  try {
    const timerId = req.params.id;
    const data = req.body;

    const timer = await timerModel.findById(timerId);

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'Timer not found',
        error: 'Timer not found',
      });
    }

    const startPayload =
      data.start !== undefined
        ? {
            ...(timer.start?.toObject ? timer.start.toObject() : timer.start),
            ...data.start,
            photos:
              data.start?.photos !== undefined ? data.start.photos : timer.start?.photos || [],
          }
        : timer.start;

    const endPayload =
      data.end !== undefined
        ? {
            ...(timer.end?.toObject ? timer.end.toObject() : timer.end),
            ...data.end,
            photos: data.end?.photos !== undefined ? data.end.photos : timer.end?.photos || [],
          }
        : timer.end;

    const updateTimer = await timerModel
      .findByIdAndUpdate(
        timerId,
        {
          user: data.user ? data.user : timer.user,
          project: data.project !== undefined ? data.project : timer.project,
          assignment: data.assignment !== undefined ? data.assignment : timer.assignment,
          start: startPayload,
          end: endPayload,
          description: data.description ? data.description : timer.description,
          photos: data.photos !== undefined ? data.photos : timer.photos,
          status: data.status !== undefined ? data.status : timer.status,
          verifiedByClient:
            data.verifiedByClient !== undefined ? data.verifiedByClient : timer.verifiedByClient,
          client: data.client !== undefined ? data.client : timer.client,
        },
        {
          new: true,
        }
      )
      .populate({
        path: 'user',
        select: 'name email phone role status createdby',
        populate: { path: 'createdby', select: 'name email role phone' },
      })
      .populate('project', 'name')
      .populate('assignment', 'description')
      .populate('client', 'name email');

    res.status(200).json({
      success: true,
      message: 'Timer updated successfully',
      timer: updateTimer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

export const fetchTimers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { user, start, end } = req.query;

    const query = {};
    if (user) query.user = user;

    // 🗓️ Apply date filters (based on createdAt)
    if (start || end) {
      query.createdAt = {};
      if (start) {
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = startDate;
      }
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // 📦 Fetch paginated timers and total count
    const [timers, totalCount, allTimersForLeaveCalc] = await Promise.all([
      timerModel
        .find(query)
        .populate({
          path: 'user',
          select: 'name email phone role status createdby',
          populate: { path: 'createdby', select: 'name email role phone' },
        })
        .populate('project', 'name')
        .populate('assignment', 'description')
        .sort({ 'start.startTime': -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      timerModel.countDocuments(query),
      // Fetch ALL timers (just dates) for accurate leave calculation
      timerModel.find(query).select('start.startTime').lean(),
    ]);

    // ⏱️ Compute duration for each timer dynamically
    let totalDuration = 0;

    const timersWithDuration = timers.map((t) => {
      let duration = 0;

      if (t.start?.startTime) {
        const start = new Date(t.start.startTime);
        const end = t.end?.endTime ? new Date(t.end.endTime) : new Date();

        // Calculate total time
        const totalTime = (end - start) / 1000 / 60;

        // Subtract paused duration
        const pausedDuration = t.pausedDuration || 0;
        duration = Math.max(0, totalTime - pausedDuration);

        // Only add to total if timer is stopped
        if (t.end?.endTime) {
          totalDuration += duration;
        }
      }

      return {
        ...t,
        duration, // add duration to each timer (excluding paused time)
      };
    });

    // 📅 Compute total leaves (days with no work)
    let totalLeaves = 0;
    if (allTimersForLeaveCalc.length > 0) {
      // Find the earliest timer date from ALL timers
      let firstEntryDate = null;

      allTimersForLeaveCalc.forEach((t) => {
        if (t.start?.startTime) {
          const timerDate = new Date(t.start.startTime);
          timerDate.setHours(0, 0, 0, 0);

          if (!firstEntryDate || timerDate < firstEntryDate) {
            firstEntryDate = timerDate;
          }
        }
      });

      if (firstEntryDate) {
        // Get all worked days from ALL timers (normalize dates to YYYY-MM-DD)
        const workedDays = new Set();
        allTimersForLeaveCalc.forEach((t) => {
          if (t.start?.startTime) {
            const workDate = new Date(t.start.startTime);
            // Normalize to local date string
            const dateKey = new Date(
              workDate.getFullYear(),
              workDate.getMonth(),
              workDate.getDate()
            )
              .toISOString()
              .split('T')[0];
            workedDays.add(dateKey);
          }
        });

        // Count leaves from first entry up to yesterday
        // (Don't count today as a leave since the day isn't over yet)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        for (let d = new Date(firstEntryDate); d <= yesterday; d.setDate(d.getDate() + 1)) {
          const dateKey = d.toISOString().split('T')[0];
          if (!workedDays.has(dateKey)) {
            totalLeaves++;
          }
        }
      }
    }

    const totalPages = Math.ceil(totalCount / limit);

    // 📤 Send response
    res.status(200).json({
      success: true,
      message: 'Timers fetched successfully',
      data: {
        timers: timersWithDuration,
        summary: {
          totalDuration: totalDuration.toFixed(2),
          totalLeaves,
          totalCount,
        },
        pagination: {
          total: totalCount,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching timers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Pause Timer
export const pauseTimer = async (req, res) => {
  try {
    const timerId = req.params.id;

    const timer = await timerModel.findById(timerId);

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'Timer not found',
        error: 'Timer not found',
      });
    }

    // Check if timer is active and not already paused
    // Allow pause if timer is active (isActive=true) and not already paused
    if (!timer.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Timer is not active',
        error: 'Timer is not active',
      });
    }

    if (timer.paused || timer.status === 'paused') {
      return res.status(200).json({
        success: false,
        message: 'Timer is already paused',
        error: 'Timer is already paused',
      });
    }

    const pausedAt = new Date();
    const updatedTimer = await timerModel
      .findByIdAndUpdate(
        timerId,
        {
          paused: true,
          pausedAt: pausedAt,
          status: 'paused',
          $push: {
            pausePeriods: {
              pausedAt: pausedAt,
            },
          },
        },
        { new: true }
      )
      .populate({
        path: 'user',
        select: 'name email phone role status createdby',
        populate: { path: 'createdby', select: 'name email role phone' },
      })
      .populate('project', 'name')
      .populate('assignment', 'description')
      .populate('client', 'name email');

    res.status(200).json({
      success: true,
      message: 'Timer paused successfully',
      timer: updatedTimer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Resume Timer
export const resumeTimer = async (req, res) => {
  try {
    const timerId = req.params.id;

    const timer = await timerModel.findById(timerId);

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'Timer not found',
        error: 'Timer not found',
      });
    }

    // Check if timer is paused
    if (!timer.paused && timer.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Timer is not paused',
        error: 'Timer is not paused',
      });
    }

    if (!timer.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Timer is not active',
        error: 'Timer is not active',
      });
    }

    // Check if there's already an active timer (not paused) for this user
    const existingActiveTimer = await timerModel.findOne({
      user: timer.user,
      isActive: true,
      _id: { $ne: timerId }, // Exclude the current timer being resumed
      $or: [{ paused: { $ne: true } }, { paused: false }, { status: { $ne: 'paused' } }],
    });

    if (existingActiveTimer) {
      return res.status(400).json({
        success: false,
        message:
          'You already have an active timer running. Please pause or stop it before resuming another timer.',
        error: 'Active timer already exists',
      });
    }

    const resumedAt = new Date();
    const pauseDuration = timer.pausedAt
      ? Math.round((resumedAt - new Date(timer.pausedAt)) / (60 * 1000))
      : 0;

    // Update the last pause period
    const pausePeriods = Array.isArray(timer.pausePeriods) ? [...timer.pausePeriods] : [];
    if (pausePeriods.length > 0) {
      const lastPause = pausePeriods[pausePeriods.length - 1];
      if (!lastPause.resumedAt) {
        lastPause.resumedAt = resumedAt;
        lastPause.duration = pauseDuration;
      }
    }

    const totalPausedDuration = (timer.pausedDuration || 0) + pauseDuration;

    const updatedTimer = await timerModel
      .findByIdAndUpdate(
        timerId,
        {
          paused: false,
          pausedAt: null,
          status: 'active',
          pausedDuration: totalPausedDuration,
          pausePeriods: pausePeriods,
        },
        { new: true }
      )
      .populate({
        path: 'user',
        select: 'name email phone role status createdby',
        populate: { path: 'createdby', select: 'name email role phone' },
      })
      .populate('project', 'name')
      .populate('assignment', 'description')
      .populate('client', 'name email');

    res.status(200).json({
      success: true,
      message: 'Timer resumed successfully',
      timer: updatedTimer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Delete Timer
export const deleteTimer = async (req, res) => {
  try {
    const timerId = req.params.id;

    const timer = await timerModel.findById(timerId);

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'Timer not found',
        error: 'Timer not found',
      });
    }

    const deletedTimer = await timerModel.findByIdAndDelete(timerId);

    res.status(200).json({
      success: true,
      message: 'Timer deleted successfully',
      timer: deletedTimer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
