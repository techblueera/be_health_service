// controllers/aboutUsController.js
import AboutUs from '../../models/hospitalModels/aboutUs.model.js';

// Create About Us
export const createAboutUs = async (req, res) => {
  try {
    const aboutUs = new AboutUs({
      businessId: req.user._id,
      ...req.body
    });
    await aboutUs.save();
    res.status(201).json(aboutUs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get About Us
export const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne({ businessId: req.user._id });
    if (!aboutUs) {
      return res.status(404).json({ message: 'About Us not found' });
    }
    res.json(aboutUs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update About Us
export const updateAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(aboutUs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete About Us
export const deleteAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOneAndDelete({ businessId: req.user._id });
    if (!aboutUs) {
      return res.status(404).json({ message: 'About Us not found' });
    }
    res.json({ message: 'About Us deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};