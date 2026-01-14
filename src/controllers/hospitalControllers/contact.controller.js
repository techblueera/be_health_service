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
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Contact
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ businessId: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Contact
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ businessId: req.user._id });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};