// controllers/hospitalControllers/emergencyNumber.controller.js
import Contact from '../../models/hospitalModels/contact.model.js';

// Add or update emergency number
export const upsertEmergencyNumber = async (req, res) => {
  try {
    const { emergencyNumber } = req.body;

    const contact = await Contact.findOneAndUpdate(
      { businessId: req.user._id },
      { emergencyNumber },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Emergency number updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Get emergency number
export const getEmergencyNumber = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      businessId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency number fetched successfully',
      data: contact.emergencyNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Delete emergency number
export const deleteEmergencyNumber = async (req, res) => {
    try {
      const contact = await Contact.findOneAndUpdate(
        { businessId: req.user._id },
        { $unset: { emergencyNumber: 1 } },
        { new: true }
      );
  
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found',
          data: null
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Emergency number deleted successfully',
        data: contact
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  };
  