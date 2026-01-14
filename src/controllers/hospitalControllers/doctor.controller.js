// controllers/hospitalControllers/doctorController.js
import Doctor from '../../models/hospitalModels/doctor.model.js';

// Create Doctor
export const createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor({
      businessId: req.user._id,
      ...req.body
    });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ businessId: req.user._id });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Doctors By Department
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      businessId: req.user._id,
      departmentId: req.params.departmentId
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Doctor By ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Doctor
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set Doctor Leave
export const setDoctorLeave = async (req, res) => {
  try {
    const { leaveFrom, leaveTo } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      {
        isOnLeave: true,
        leaveFrom,
        leaveTo
      },
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove Doctor Leave
export const removeDoctorLeave = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user._id },
      {
        isOnLeave: false,
        leaveFrom: null,
        leaveTo: null
      },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};