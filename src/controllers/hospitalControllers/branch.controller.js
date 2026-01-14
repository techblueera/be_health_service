// controllers/hospitalControllers/branchController.js
import Branch from '../../models/hospitalModels/branch.model.js';

// Create Branch
export const createBranch = async (req, res) => {
  try {
    const branch = new Branch({
      businessId: req.user._id,
      ...req.body
    });
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Branches
export const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ businessId: req.user._id });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Branch By ID
export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Branch
export const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Branch
export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};