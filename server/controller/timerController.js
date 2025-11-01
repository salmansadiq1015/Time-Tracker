import timerModel from "../models/timerModel.js";

// Start Timer
export const startTimer = async (req, res) => {
  try {
    const { user, start, description } = req.body;

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
// export const fetchTimers = async (req, res) => {
//   try {
//     const page = Math.max(parseInt(req.query.page) || 1, 1);
//     const limit = Math.min(parseInt(req.query.limit) || 20, 100);
//     const { user, start, end } = req.query;

//     const query = {};
//     if (user) query.user = user;

//     // 🗓️ Apply date filters (based on createdAt)
//     if (start || end) {
//       query.createdAt = {};
//       if (start) {
//         const startDate = new Date(start);
//         startDate.setHours(0, 0, 0, 0);
//         query.createdAt.$gte = startDate;
//       }
//       if (end) {
//         const endDate = new Date(end);
//         endDate.setHours(23, 59, 59, 999);
//         query.createdAt.$lte = endDate;
//       }
//     }

//     // 📦 Fetch paginated timers and total count
//     const [timers, totalCount, allTimersForLeaveCalc] = await Promise.all([
//       timerModel
//         .find(query)
//         .populate("user", "name email")
//         .sort({ "start.startTime": -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),
//       timerModel.countDocuments(query),
//       // Fetch ALL timers (just dates) for accurate leave calculation
//       timerModel.find(query).select("start.startTime").lean(),
//     ]);

//     // ⏱️ Compute duration for each timer dynamically
//     let totalDuration = 0;

//     const timersWithDuration = timers.map((t) => {
//       let duration = 0;

//       if (t.start?.startTime && t.end?.endTime) {
//         const start = new Date(t.start.startTime);
//         const end = new Date(t.end.endTime);
//         duration = Math.max(0, (end - start) / 1000 / 60);
//         totalDuration += duration;
//       }

//       return {
//         ...t,
//         duration, // add duration to each timer
//       };
//     });

//     // 📅 Compute total leaves (days with no work)
//     let totalLeaves = 0;
//     if (allTimersForLeaveCalc.length > 0) {
//       // Find the earliest timer date from ALL timers
//       const firstEntryDate = allTimersForLeaveCalc.reduce((earliest, t) => {
//         if (!t.start?.startTime) return earliest;
//         const timerDate = new Date(t.start.startTime);
//         timerDate.setHours(0, 0, 0, 0);
//         return !earliest || timerDate < earliest ? timerDate : earliest;
//       }, null);

//       if (firstEntryDate) {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // Get all worked days from ALL timers (normalize dates to YYYY-MM-DD)
//         const workedDays = new Set();
//         allTimersForLeaveCalc.forEach((t) => {
//           if (t.start?.startTime) {
//             const workDate = new Date(t.start.startTime);
//             // Normalize to local date string
//             const dateKey = new Date(
//               workDate.getFullYear(),
//               workDate.getMonth(),
//               workDate.getDate()
//             )
//               .toISOString()
//               .split("T")[0];
//             workedDays.add(dateKey);
//           }
//         });

//         const lastDayToCheck = new Date(today);
//         lastDayToCheck.setDate(lastDayToCheck.getDate() - 1);

//         for (
//           let d = new Date(firstEntryDate);
//           d <= lastDayToCheck;
//           d.setDate(d.getDate() + 1)
//         ) {
//           const dateKey = d.toISOString().split("T")[0];
//           if (!workedDays.has(dateKey)) {
//             totalLeaves++;
//           }
//         }
//       }
//     }

//     const totalPages = Math.ceil(totalCount / limit);

//     // 📤 Send response
//     res.status(200).json({
//       success: true,
//       message: "Timers fetched successfully",
//       data: {
//         timers: timersWithDuration,
//         summary: {
//           totalDuration: totalDuration.toFixed(2),
//           totalLeaves,
//           totalCount,
//         },
//         pagination: {
//           total: totalCount,
//           totalPages,
//           currentPage: page,
//           limit,
//           hasNextPage: page < totalPages,
//           hasPrevPage: page > 1,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching timers:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

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
        .populate("user", "name email")
        .sort({ "start.startTime": -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      timerModel.countDocuments(query),
      // Fetch ALL timers (just dates) for accurate leave calculation
      timerModel.find(query).select("start.startTime").lean(),
    ]);

    // ⏱️ Compute duration for each timer dynamically
    let totalDuration = 0;

    const timersWithDuration = timers.map((t) => {
      let duration = 0;

      if (t.start?.startTime && t.end?.endTime) {
        const start = new Date(t.start.startTime);
        const end = new Date(t.end.endTime);
        duration = Math.max(0, (end - start) / 1000 / 60);
        totalDuration += duration;
      }

      return {
        ...t,
        duration, // add duration to each timer
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
              .split("T")[0];
            workedDays.add(dateKey);
          }
        });

        // Count leaves from first entry up to yesterday
        // (Don't count today as a leave since the day isn't over yet)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        for (
          let d = new Date(firstEntryDate);
          d <= yesterday;
          d.setDate(d.getDate() + 1)
        ) {
          const dateKey = d.toISOString().split("T")[0];
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
      message: "Timers fetched successfully",
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
    console.error("Error fetching timers:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// export const fetchTimers = async (req, res) => {
//   try {
//     // Parse query params with defaults
//     const page = Math.max(parseInt(req.query.page) || 1, 1);
//     const limit = Math.min(parseInt(req.query.limit) || 20, 100);
//     const { user, start, end } = req.query;

//     // Build dynamic query efficiently
//     const query = {};
//     if (user) query.user = user;

//     if (start || end) {
//       query.createdAt = {};
//       if (start) {
//         const startDate = new Date(start);
//         startDate.setHours(0, 0, 0, 0);
//         query.createdAt.$gte = startDate;
//       }
//       if (end) {
//         const endDate = new Date(end);
//         endDate.setHours(23, 59, 59, 999);
//         query.createdAt.$lte = endDate;
//       }
//     }

//     // Count total documents for pagination metadata
//     const [timers, totalCount] = await Promise.all([
//       timerModel
//         .find(query)
//         .populate("user", "name email")
//         .sort({ start: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),
//       timerModel.countDocuments(query),
//     ]);

//     const totalPages = Math.ceil(totalCount / limit);

//     res.status(200).json({
//       success: true,
//       message: "Timers fetched successfully",
//       data: {
//         timers,
//         pagination: {
//           total: totalCount,
//           totalPages,
//           currentPage: page,
//           limit,
//           hasNextPage: page < totalPages,
//           hasPrevPage: page > 1,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching timers:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

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
