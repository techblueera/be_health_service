// controllers/hospitalControllers/contactController.js
import Contact from '../../models/hospitalModels/contact.model.js';

// Create Contact
export const createContact = async (req, res) => {
  try {
    const contact = new Contact({
      businessId: req.user._id,
      ...req.body
    });
    await contact.save();
    res.status(201).json({
      success: true,
      message: "Contact created succesfully.",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create contact.",
      error: error.message,
    });
  }
};

// Get Contact
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ businessId: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(200).json({
      success: true,
      message: "Contact fetched succesfully.",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get contact by ID.",
      error: error.message,
    });
  }
};

// Update Contact
export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { businessId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Contact updated successfully.',
      data: contact
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update contact.",
      error: error.message,
    });
  }
};

// Delete Contact
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ businessId: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete contact.",
      error: error.message,
    });
  }
};