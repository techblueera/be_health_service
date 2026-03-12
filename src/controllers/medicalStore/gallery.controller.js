import galleryModel from '../../models/medicalModels/gallery.model.js';
import logger from '../utils/appLogger.js';

// Create a new gallery entry with multiple photos
export const createGalleryPhoto = async (req, res) => {
  const businessId = req.user?.business_id || req.user.business;
  const { imageUrls, title } = req.body;

  try {
    const newGalleryEntry = new galleryModel({
      businessId,
      imageUrls,
      title,
    });
    await newGalleryEntry.save();
    res.status(201).json({ success: true, message: 'Gallery entry created successfully.', data: newGalleryEntry });
  } catch (error) {
    logger.error('Error creating gallery entry', 'createGalleryPhoto', error);
    res.status(500).json({ success: false, message: 'Failed to create gallery entry.', error: error.message });
  }
};

// Get all gallery photos for the authenticated user's business
export const getGalleryPhotos = async (req, res) => {
  const businessId = req.user.business_id || req.user.business;

  try {
    const photos = await galleryModel.find({ businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: photos.length, data: photos });
  } catch (error) {
    logger.error('Error fetching gallery photos', 'getGalleryPhotos', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gallery photos.', error: error.message });
  }
};

// Get a single gallery photo by its ID
export const getGalleryPhotoById = async (req, res) => {
  const { id } = req.params;
  const businessId = req.user.business_id || req.user.business;

  try {
    const photo = await Gallery.findOne({ _id: id, businessId });
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found.' });
    }
    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    logger.error(`Error fetching gallery photo ${id}`, 'getGalleryPhotoById', error);
    res.status(500).json({ success: false, message: 'Failed to fetch photo.', error: error.message });
  }
};

// Update a gallery entry's details

export const updateGalleryPhoto = async (req, res) => {

  const { id } = req.params;

  const businessId = req.user.business_id || req.user.business;



  try {

    const galleryEntry = await galleryModel.findOne({ _id: id, businessId });

    if (!galleryEntry) {

      return res.status(404).json({ success: false, message: 'Gallery entry not found.' });

    }



    // Update fields if they are provided in the request body

    galleryEntry.title = req.body.title ?? galleryEntry.title;

    galleryEntry.imageUrls = req.body.imageUrls ?? galleryEntry.imageUrls;



    await galleryEntry.save();

    res.status(200).json({ success: true, message: 'Gallery entry updated successfully.', data: galleryEntry });

  } catch (error) {

    logger.error(`Error updating gallery entry ${id}`, 'updateGalleryPhoto', error);

    res.status(500).json({ success: false, message: 'Failed to update gallery entry.', error: error.message });

  }

};

// Delete a single image from a gallery entry
export const deleteGalleryImage = async (req, res) => {
  const { id } = req.params;
  const businessId = req.user.business_id || req.user.business;
  const { imageUrl } = req.body;

  try {
    const updatedGallery = await galleryModel.findOneAndUpdate(
      { _id: id, businessId },
      { $pull: { imageUrls: imageUrl } },
      { new: true }
    );

    if (!updatedGallery) {
      return res.status(404).json({ success: false, message: 'Gallery entry not found or image URL does not exist in this entry.' });
    }

    res.status(200).json({ success: true, message: 'Image deleted from gallery entry successfully.', data: updatedGallery });
  } catch (error) {
    logger.error(`Error deleting image from gallery entry ${id}`, 'deleteGalleryImage', error);
    res.status(500).json({ success: false, message: 'Failed to delete image from gallery entry.', error: error.message });
  }
};

// Delete a gallery photo
export const deleteGalleryPhoto = async (req, res) => {
  const { id } = req.params;
  const businessId = req.user.business_id || req.user.business;

  try {
    const photo = await galleryModel.findOneAndDelete({ _id: id, businessId });
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found.' });
    }
    res.status(200).json({ success: true, message: 'Photo deleted successfully.' });
  } catch (error) {
    logger.error(`Error deleting gallery photo ${id}`, 'deleteGalleryPhoto', error);
    res.status(500).json({ success: false, message: 'Failed to delete photo.', error: error.message });
  }
};
