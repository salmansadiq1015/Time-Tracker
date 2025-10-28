import timerModel from "../models/timerModel.js";

// Start Timer
export const startTimer = async (req, res) => {
  try {
    const { user, start, description } = req.body;

    console.log(req.user._id);
    if (!start) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
        error: "Please provide all the required fields",
      });
    }

    const timer = await timerModel.create({
      user: user ? user : req.user._id,
      start,
      description,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Timer started successfully",
      timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Stop Timer
export const stopTimer = async (req, res) => {
  try {
    const timerId = req.params.id;
    const { end, description } = req.body;

    if (!end) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
        error: "Please provide all the required fields",
      });
    }

    const timer = await timerModel.findByIdAndUpdate(
      timerId,
      {
        end,
        description,
        isActive: false,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Timer stopped successfully",
      timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
        message: "Timer not found",
        error: "Timer not found",
      });
    }

    const updateTimer = await timerModel
      .findByIdAndUpdate(
        timerId,
        {
          user: data.user ? data.user : timer.user,
          start: data.start ? data.start : timer.start,
          end: data.end ? data.end : timer.end,
          description: data.description ? data.description : timer.description,
        },
        {
          new: true,
        }
      )
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      message: "Timer updated successfully",
      timer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Fetch Timer
export const fetchTimers = async (req, res) => {
  try {
    // Parse query params with defaults
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { user, start, end } = req.query;

    // Build dynamic query efficiently
    const query = {};
    if (user) query.user = user;

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

    // Count total documents for pagination metadata
    const [timers, totalCount] = await Promise.all([
      timerModel
        .find(query)
        .populate("user", "name email")
        .sort({ start: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      timerModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Timers fetched successfully",
      data: {
        timers,
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
    console.error("Error fetching timers:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
        message: "Timer not found",
        error: "Timer not found",
      });
    }

    const deletedTimer = await timerModel.findByIdAndDelete(timerId);

    res.status(200).json({
      success: true,
      message: "Timer deleted successfully",
      timer: deletedTimer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
