import assignmentModel from '../models/assignmentModel.js';

// Create Assignment
export const createAssignment = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    const assignment = await assignmentModel.create({
      description: description.trim(),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message,
    });
  }
};

// Fetch All Assignments
export const fetchAllAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const assignments = await assignmentModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email role');

    const total = await assignmentModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      assignments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message,
    });
  }
};

// Get Assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await assignmentModel.findById(id).populate('createdBy', 'name email role');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment',
      error: error.message,
    });
  }
};

// Update Assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    const assignment = await assignmentModel
      .findByIdAndUpdate(
        id,
        { description: description.trim() },
        { new: true, runValidators: true }
      )
      .populate('createdBy', 'name email role');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment,
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message,
    });
  }
};

// Delete Assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await assignmentModel.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message,
    });
  }
};
