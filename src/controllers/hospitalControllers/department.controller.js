// controllers/hospitalControllers/departmentController.js
import Department from '../../models/hospitalModels/department.model.js';
import { seedDefaultDepartments } from '../../seeders/departmentSeeder.js';

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const department = new Department({
      businessId: req.user._id,
      ...req.body
    });
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ businessId: req.user._id });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Department By ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Department
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Main Departments (for Update Tab)
export const getMainDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ 
      businessId: req.user._id,
      parentId: null  // Only main departments
    }).sort({ order: 1 });

    // If no departments exist, seed default ones
    if (!departments.length) {
      await seedDefaultDepartments(req.user._id);
    }
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Sub Departments by Parent
export const getSubDepartments = async (req, res) => {
  try {
    const subDepartments = await Department.find({
      businessId: req.user._id,
      parentId: req.params.parentId
    }).sort({ order: 1 });
    // If no departments exist, seed default ones
    if (!subDepartments.length) {
      await seedDefaultDepartments(req.user._id);
    }
    res.json(subDepartments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Department with Children - AUTO SEED IF EMPTY
export const getDepartmentWithChildren = async (req, res) => {
  try {
    // Check if departments exist for this business
    const existingDepts = await Department.findOne({ businessId: req.user._id });
    
    // If no departments exist, seed default ones
    if (!existingDepts) {
      await seedDefaultDepartments(req.user._id);
    }
    
    // Get main department
    const mainDept = await Department.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    
    if (!mainDept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get sub departments
    const subDepartments = await Department.find({
      businessId: req.user._id,
      parentId: req.params.id
    }).sort({ order: 1 });

    res.json({
      department: mainDept,
      subDepartments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};