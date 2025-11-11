import projectModel from '../models/projectModel.js';

// Create Project
export const createProject = async (req, res) => {
  try {
    const { name, employees = [], address, city, description = '', startDate, endDate } = req.body;

    // --- 1️⃣ Input validation ---
    const requiredFields = { name, address, startDate, endDate };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // --- 2️⃣ Validate date consistency ---
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be greater than start date',
      });
    }

    // --- 3️⃣ Create project ---
    const project = await projectModel.create({
      name: name.trim(),
      employees,
      address: address.trim(),
      city,
      description: description.trim(),
      startDate,
      endDate,
      createdBy: req.user._id,
    });

    // --- 4️⃣ Return success response ---
    return res.status(201).json({
      success: true,
      message: '✅ Project created successfully',
      project,
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);

    // --- 5️⃣ Centralized error response ---
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update project

export const updateProject = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const updates = req.body;

    // --- 2️⃣ Fetch project & validate existence ---
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // --- 3️⃣ Authorization check (optional but recommended) ---
    // Uncomment this if only creator can update
    // if (project.createdBy?.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You are not authorized to update this project.",
    //   });
    // }

    // --- 4️⃣ Sanitize input (remove immutable or restricted fields) ---
    const disallowedFields = ['_id', 'createdBy', 'createdAt', 'updatedAt', 'client', 'tags'];
    disallowedFields.forEach((field) => delete updates[field]);

    // Trim all string fields (for data consistency)
    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] === 'string') {
        updates[key] = updates[key].trim();
      }
    });

    // --- 5️⃣ Update project with validation ---
    const updatedProject = await projectModel
      .findByIdAndUpdate(
        projectId,
        { $set: updates },
        { new: true, runValidators: true, lean: true }
      )
      .populate('createdBy', 'name email')
      .populate('employees', 'name email');

    return res.status(200).json({
      success: true,
      message: '✅ Project updated successfully.',
      data: updatedProject,
    });
  } catch (error) {
    console.error('❌ Error updating project:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Fetch ALl  Projects

export const fetchAllProjects = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const { client, search, startDate, endDate, employeeId } = req.query;

    // Filters
    const filter = {};

    if (client) filter.client = client;

    // Search by project name
    if (search) filter.name = { $regex: search.trim(), $options: 'i' };

    if (startDate || endDate) {
      const dateFilter = {};

      if (startDate && endDate) {
        filter.$and = [
          { startDate: { $lte: new Date(endDate) } },
          { endDate: { $gte: new Date(startDate) } },
        ];
      } else if (startDate) {
        // Projects that end on or after the start date
        filter.endDate = { $gte: new Date(startDate) };
      } else if (endDate) {
        // Projects that start on or before the end date
        filter.startDate = { $lte: new Date(endDate) };
      }
    }

    if (employeeId) filter.employees = { $in: [employeeId] };

    const total = await projectModel.countDocuments(filter);

    // Fetch paginated projects
    const projects = await projectModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('employees', 'name email')
      .lean();
    // .populate('client', 'name email')

    return res.status(200).json({
      success: true,
      message: '✅ Projects fetched successfully',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      projects: projects,
    });
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Fetch single project by id
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel
      .findById(id)
      .populate('createdBy', 'name email')
      .populate('employees', 'name email')
      .lean();

    if (!project) {
      return res.status(404).send({ success: false, message: 'Project not found' });
    }

    return res.status(200).send({ success: true, project });
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return res.status(500).send({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete project (soft delete by default, hard delete if ?force=true)
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const force = String(req.query.force || '').toLowerCase() === 'true';

    const project = await projectModel.findById(id);
    if (!project) return res.status(404).send({ success: false, message: 'Project not found' });

    // if (force) {  }
    await projectModel.findByIdAndDelete(id);
    return res.status(200).send({ success: true, message: 'Project permanently deleted' });

    // project.isActive = false;
    // await project.save();
    // return res
    //   .status(200)
    //   .send({ success: true, message: "Project archived (isActive=false)" });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    return res.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// Add an employee to a project
export const addEmployeeToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;
    if (!employeeId)
      return res.status(400).send({ success: false, message: 'employeeId is required' });

    const updated = await projectModel
      .findByIdAndUpdate(id, { $addToSet: { employees: employeeId } }, { new: true })
      .populate('employees', 'name email');

    if (!updated) return res.status(404).send({ success: false, message: 'Project not found' });

    return res.status(200).send({ success: true, message: 'Employee added', project: updated });
  } catch (error) {
    console.error('Error in addEmployeeToProject:', error);
    return res.status(500).send({ success: false, message: 'Internal server error' });
  }
};

// Remove an employee from a project
export const removeEmployeeFromProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;
    if (!employeeId)
      return res.status(400).send({ success: false, message: 'employeeId is required' });

    const updated = await projectModel
      .findByIdAndUpdate(id, { $pull: { employees: employeeId } }, { new: true })
      .populate('employees', 'name email');

    if (!updated) return res.status(404).send({ success: false, message: 'Project not found' });

    return res.status(200).send({ success: true, message: 'Employee removed', project: updated });
  } catch (error) {
    console.error('Error in removeEmployeeFromProject:', error);
    return res.status(500).send({ success: false, message: 'Internal server error' });
  }
};
