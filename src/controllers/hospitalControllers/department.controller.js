// controllers/hospitalControllers/departmentController.js
import Department from "../../models/hospitalModels/department.model.js";
import { seedDefaultDepartments } from "../../seeders/departmentSeeder.js";

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const department = new Department({
      businessId: req.user._id,
      ...req.body,
    });
    await department.save();
    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create department",
      error: error.message,
    });
  }
};

// Get All Departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ businessId: req.user._id });
    res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

// Get Department By ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      businessId: req.user._id,
    });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      success: true,
      message: "Department fetched successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch department",
      error: error.message,
    });
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
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update department.",
      error: error.message,
    });
  }
};

// Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id,
    });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({
      success: true,
      message: "Department deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete department.",
      message: error.message,
    });
  }
};

// Get Main Departments (for Update Tab)
export const getMainDepartments = async (req, res) => {
  try {
    let departments = await Department.find({
      businessId: req.user._id,
      parentId: null,
    }).sort({ order: 1 });

    // If no departments exist, seed default ones and fetch again
    if (!departments.length) {
      await seedDefaultDepartments(req.user._id);
      departments = await Department.find({
        businessId: req.user._id,
        parentId: null,
      }).sort({ order: 1 });
    }

    res.status(200).json({
      success: true,
      message: "Fetched the main departments.",
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch main departments.",
      error: error.message,
    });
  }
};

// Get Sub Departments by Parent
export const getSubDepartments = async (req, res) => {
  try {
    const anyDepts = await Department.findOne({
      businessId: req.user._id,
    });

    if (!anyDepts) {
      await seedDefaultDepartments(req.user._id);
    }

    const subDepartments = await Department.find({
      businessId: req.user._id,
      parentId: req.params.parentId,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Fetched sub departments.",
      data: subDepartments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get sub departments.",
      error: error.message,
    });
  }
};

// Get Department with Children - AUTO SEED IF EMPTY
export const getDepartmentWithChildren = async (req, res) => {
  try {
    // Check if departments exist for this business
    const existingDepts = await Department.findOne({
      businessId: req.user._id,
    });

    // If no departments exist, seed default ones
    if (!existingDepts) {
      await seedDefaultDepartments(req.user._id);
    }

    const mainDept = await Department.findOne({
      _id: req.params.id,
      businessId: req.user._id,
    });

    if (!mainDept) {
      return res.status(404).json({ 
        success: false,
        message: "Department not found" 
      });
    }

    const subDepartments = await Department.find({
      businessId: req.user._id,
      parentId: req.params.id,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Fetched department with childrens.",
      data: {
        department: mainDept,
        subDepartments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get the department with childrens.",
      error: error.message,
    });
  }
};
