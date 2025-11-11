import taskModel from '../models/taskModel.js';
import userModel from '../models/userModel.js';
import projectModel from '../models/projectModel.js';

const populateTask = () => [
  {
    path: 'project',
    select: 'name',
    // populate: { path: 'client', select: 'name email phone' },
  },
  { path: 'assignedTo', select: 'name email role status phone' },
  { path: 'createdBy', select: 'name email role phone' },
];

const buildQuery = (role, userId, filters = {}) => {
  const query = {};

  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }

  if (filters.priority && filters.priority !== 'all') {
    query.priority = filters.priority;
  }

  if (filters.project && filters.project !== 'all') {
    query.project = filters.project;
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (role === 'user') {
    query.$and = [{ $or: [{ assignedTo: userId }, { createdBy: userId }] }, ...(query.$and || [])];
  } else if (filters.assignedTo) {
    query.assignedTo = filters.assignedTo;
  }

  return query;
};

export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;
    const trimmedTitle = title?.trim();
    const trimmedDescription = description?.trim();

    if (!trimmedTitle || !trimmedDescription || !project || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, project and due date are required.',
      });
    }

    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    let assignee = null;
    if (assignedTo) {
      assignee = await userModel.findById(assignedTo);
      if (!assignee) {
        return res.status(404).json({ success: false, message: 'Assigned user not found.' });
      }
    }

    const task = await taskModel.create({
      title: trimmedTitle,
      description: trimmedDescription,
      project,
      assignedTo: assignee?._id || null,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      createdBy: req.user._id,
    });

    const fullTask = await taskModel.findById(task._id).populate(populateTask());

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: fullTask,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task.',
      error: error.message,
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, project, search, assignedTo } = req.query;
    const filters = {
      status,
      priority,
      project,
      search,
      assignedTo,
    };

    const query = buildQuery(req.user.role, req.user._id, filters);

    const numericLimit = Math.min(Number(limit) || 10, 100);
    const numericPage = Math.max(Number(page) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const [tasks, total] = await Promise.all([
      taskModel
        .find(query)
        .sort({ dueDate: 1, priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(numericLimit)
        .populate(populateTask()),
      taskModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Tasks fetched successfully.',
      data: tasks,
      pagination: {
        total,
        page: numericPage,
        limit: numericLimit,
        hasNextPage: numericPage * numericLimit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks.',
      error: error.message,
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await taskModel.findById(req.params.id).populate(populateTask());
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (
      req.user.role === 'user' &&
      ![task.assignedTo?.toString(), task.createdBy?.toString()].includes(req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task.',
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await taskModel.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
    const isCreator = task.createdBy?.toString() === req.user._id.toString();
    const isUserRole = req.user.role === 'user';

    if (isUserRole && !isAssignee && !isCreator) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const allowedFields = isUserRole
      ? ['status', 'priority', 'description']
      : ['title', 'description', 'project', 'assignedTo', 'status', 'priority', 'dueDate'];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updates[field] = req.body[field];
      }
    }

    if (!Object.keys(updates).length) {
      return res
        .status(400)
        .json({ success: false, message: 'No valid fields provided to update.' });
    }

    if (updates.assignedTo) {
      const assignee = await userModel.findById(updates.assignedTo);
      if (!assignee) {
        return res.status(404).json({ success: false, message: 'Assigned user not found.' });
      }
    }

    if (updates.project) {
      const projectExists = await projectModel.findById(updates.project);
      if (!projectExists) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }
    }

    const updatedTask = await taskModel
      .findByIdAndUpdate(task._id, updates, { new: true })
      .populate(populateTask());

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task.',
      error: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.user.role === 'user') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const task = await taskModel.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await taskModel.findByIdAndDelete(task._id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task.',
      error: error.message,
    });
  }
};
