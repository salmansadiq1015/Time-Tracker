import equipmentModel from '../models/equipmentModel.js';
// Create Equipment

export const createEquipment = async (req, res) => {
  try {
    const { name, serial, project, status, assignedTo, assignDate } = req.body;

    if (!name || !serial) {
      return res.status(400).json({
        success: false,
        message: 'Name and serial number are required.',
      });
    }

    const existing = await equipmentModel.findOne({ serial });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Equipment with this serial number already exists.',
      });
    }

    const equipment = await equipmentModel.create({
      name: name.trim(),
      serial: serial.trim(),
      project,
      status,
      assignedTo,
      assignDate,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: '✅ Equipment created successfully.',
      data: equipment,
    });
  } catch (error) {
    console.error('❌ Error creating equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Fetch All
export const fetchAllEquipment = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const { status, name, project, assignedTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (name) filter.name = { $regex: name.trim(), $options: 'i' };

    const total = await equipmentModel.countDocuments(filter);

    const equipment = await equipmentModel
      .find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: '✅ Equipment fetched successfully.',
      pagination: {
        total,
      },
      equipments: equipment,
    });
  } catch (error) {
    console.error('❌ Error fetching equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get Equipments By Id
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await equipmentModel
      .findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    return res.status(200).json({ success: true, data: equipment });
  } catch (error) {
    console.error('❌ Error fetching equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Update Equipment
export const updateEquipment = async (req, res) => {
  try {
    const updates = req.body;
    const { id } = req.params;

    if (updates.assignedTo === '') {
      updates.assignedTo = null;
    }

    const disallowed = ['_id', 'createdBy', 'createdAt'];
    disallowed.forEach((field) => delete updates[field]);

    const updated = await equipmentModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    return res.status(200).json({
      success: true,
      message: '✅ Equipment updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error updating equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Delete Equipment
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await equipmentModel.findByIdAndDelete(id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    return res.status(200).json({
      success: true,
      message: '🗑️ Equipment deleted successfully.',
    });
  } catch (error) {
    console.error('❌ Error deleting equipment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Update Equipment State
export const updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'assigned', 'maintenance'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updated = await Equipment.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    return res.status(200).json({
      success: true,
      message: '✅ Equipment status updated.',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error updating equipment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Fetch By Project
export const fetchEquipmentByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const equipment = await equipmentModel
      .find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: '✅ Equipment fetched for project.',
      data: equipment,
    });
  } catch (error) {
    console.error('❌ Error fetching equipment by project:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};
