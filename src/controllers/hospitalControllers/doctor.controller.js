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

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get All Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ businessId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully',
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get Doctors By Department
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      businessId: req.user._id,
      departmentId: req.params.departmentId
    });

    res.status(200).json({
      success: true,
      message: 'Doctors fetched by department successfully',
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
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
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor fetched successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
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
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
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
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
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
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor leave set successfully',
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
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
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor leave removed successfully',
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
