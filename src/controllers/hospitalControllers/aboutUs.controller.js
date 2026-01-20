// controllers/aboutUsController.js
import AboutUs from "../../models/hospitalModels/aboutUs.model.js";
import Doctor from "../../models/hospitalModels/doctor.model.js";
import Department from "../../models/hospitalModels/department.model.js";
import Ward from "../../models/hospitalModels/ward.model.js";
import Bed from "../../models/hospitalModels/bed.model.js";
import EmergencyService from "../../models/hospitalModels/emergencyService.model.js";
import Contact from "../../models/hospitalModels/contact.model.js";
import Facility from '../../models/hospitalModels/facility.model.js';

// Create About Us
export const createAboutUs = async (req, res) => {
  try {
    const aboutUs = new AboutUs({
      businessId: req.user._id,
      ...req.body,
    });
    await aboutUs.save();
    res.status(201).json({
      success: true,
      message: "About Us created successfully.",
      data: aboutUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create about us.",
      error: error.message,
    });
  }
};

// Get About Us
export const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne({ businessId: req.user._id });
    if (!aboutUs) {
      return res.status(404).json({ message: "About Us not found" });
    }
    res.status(200).json({
      success: true,
      message: "Fetched about us successfully.",
      data: aboutUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch about us.",
      error: error.message,
    });
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

    res.status(200).json({
      success: true,
      message: "About us updated successfully.",
      data: aboutUs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update about us.",
      error: error.message,
    });
  }
};

// Delete About Us
export const deleteAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOneAndDelete({
      businessId: req.user._id,
    });
    if (!aboutUs) {
      return res.status(404).json({ message: "About Us not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "About Us deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete about us.",
      error: error.message,
    });
  }
};

// Get Home Page Details
export const getHomePageDetails = async (req, res) => {
  try {
    const businessId = req.user._id;

    // 1. HOSPITAL INFO (Top section with cover page)
    const contact = await Contact.findOne({ businessId }).lean();
    const aboutUs = await AboutUs.findOne({ businessId }).lean();

    const hospitalInfo = {
      name: contact?.hospitalName || 'The Mission Hospital',
      tagline: 'Quality Healthcare for All',
      coverImage: aboutUs?.coverPage || '', // Cover page from AboutUs
      logo: aboutUs?.image || '' // Hospital logo from AboutUs
    };

    // 2. STATISTICS (Number cards - OPD, IPD, Emergency)
    const opdCount = await Department.countDocuments({ 
      businessId, 
      type: 'OPD', 
      parentId: { $ne: null }, // Only sub-departments
      isActive: true 
    });
    
    const ipdCount = await Ward.countDocuments({ businessId, isActive: true });
    
    const emergencyCount = await EmergencyService.countDocuments({ 
      businessId, 
      isActive: true 
    });

    // 3. DOCTORS (Show active doctors with departments)
    const activeDoctors = await Doctor.find({ 
      businessId,
      isOnLeave: false // Not on leave
    }).limit(4).lean();

    const doctorDeptIds = [...new Set(activeDoctors.map(d => d.departmentId))];
    const doctorDepartments = await Department.find({ 
      '_id': { $in: doctorDeptIds } 
    }).lean();
    
    const deptMap = doctorDepartments.reduce((acc, dept) => {
      acc[dept._id] = dept.name;
      return acc;
    }, {});

    const doctors = activeDoctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.name,
      photo: doctor.photo,
      specialization: doctor.specialization,
      departmentName: deptMap[doctor.departmentId] || 'General',
      availability: doctor.availability,
      fees: doctor.fees
    }));

    // 4. IPD (Active wards with bed availability)
    const activeWards = await Ward.find({ 
      businessId, 
      isActive: true 
    }).limit(4).lean();

    const ipd = await Promise.all(
      activeWards.map(async (ward) => {
        const totalBeds = await Bed.countDocuments({ 
          wardId: ward._id, 
          businessId 
        });
        const occupiedBeds = await Bed.countDocuments({ 
          wardId: ward._id, 
          businessId,
          isOccupied: true 
        });
        
        return {
          _id: ward._id,
          name: ward.name,
          type: ward.type,
          totalBeds: totalBeds,
          availableBeds: totalBeds - occupiedBeds,
          fees: ward.fees
        };
      })
    );

    // 5. EMERGENCY & CRITICAL CARE (Active services only)
    const emergencyServices = await EmergencyService.find({ 
      businessId, 
      isActive: true 
    }).limit(6).lean();

    const emergency = emergencyServices.map(service => ({
      _id: service._id,
      name: service.name,
      type: service.type,
      icon: service.type.toLowerCase() // For UI icons
    }));

    // 6. OTHER SERVICES (Active facilities)
    const otherFacilities = await Facility.find({ 
      businessId, 
      isActive: true 
    }).limit(4).lean();

    const otherServices = otherFacilities.map(facility => ({
      _id: facility._id,
      name: facility.name,
      type: facility.type,
      description: facility.description
    }));

    // 7. ABOUT US (History, Vision, Management with image)
    const aboutUsData = {
      visionMission: aboutUs?.visionMission || '',
      history: aboutUs?.history || '',
      management: aboutUs?.management ? JSON.parse(aboutUs.management) : [],
      image: aboutUs?.image || '', // Hospital image/logo
      coverPage: aboutUs?.coverPage || '' // Cover page image
    };

    // 8. GALLERY
    // For now using coverPage and image from AboutUs
    // You can later add a separate images array field to AboutUs model
    const gallery = [
      aboutUs?.coverPage,
      aboutUs?.image
    ].filter(Boolean); // Remove null/undefined values

    // 9. TESTIMONIALS (You need to create a Testimonial model)
    const testimonials = []; // Empty for now

    // 10. CONTACT US
    const contactUs = contact ? {
      hospitalName: contact.hospitalName,
      address: contact.address,
      email: contact.email,
      phone: contact.admissionPhone,
      emergencyPhone: contact.principalPhone,
      website: contact.website
    } : null;

    res.status(200).json({
      success: true,
      message: "Home page details fetched successfully.",
      data: {
        hospitalInfo,
        doctors,
        ipd,
        emergency,
        otherServices,
        aboutUs: aboutUsData,
        gallery,
        testimonials,
        contactUs,
      },
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch home page details.",
      error: error.message,
    });
  }
};

// ==========================================
// IMAGE UPLOAD APIS
// ==========================================

// Upload Logo Image
export const uploadLogoImage = async (req, res) => {
  try {
    const { logoImage } = req.body;
    
    if (!logoImage) {
      return res.status(400).json({
        success: false,
        message: 'Logo image URL is required'
      });
    }

    const aboutUs = await AboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      { logoImage },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Logo image uploaded successfully',
      data: {
        logoImage: aboutUs.logoImage
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to upload logo image',
      error: error.message
    });
  }
};

// Upload Hospital Image
export const uploadHospitalImage = async (req, res) => {
  try {
    const { hospitalImage } = req.body;
    
    if (!hospitalImage) {
      return res.status(400).json({
        success: false,
        message: 'Hospital image URL is required'
      });
    }

    const aboutUs = await AboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      { hospitalImage },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Hospital image uploaded successfully',
      data: {
        hospitalImage: aboutUs.hospitalImage
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to upload hospital image',
      error: error.message
    });
  }
};

// Upload Cover Page Image
export const uploadCoverPage = async (req, res) => {
  try {
    const { coverPage } = req.body;
    
    if (!coverPage) {
      return res.status(400).json({
        success: false,
        message: 'Cover page URL is required'
      });
    }

    const aboutUs = await AboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      { coverPage },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cover page uploaded successfully',
      data: {
        coverPage: aboutUs.coverPage
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to upload cover page',
      error: error.message
    });
  }
};

// Add Gallery Image
export const addGalleryImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const aboutUs = await AboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      { $push: { gallery: imageUrl } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Gallery image added successfully',
      data: {
        gallery: aboutUs.gallery
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add gallery image',
      error: error.message
    });
  }
};

// Add Multiple Gallery Images
export const addMultipleGalleryImages = async (req, res) => {
  try {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }

    const aboutUs = await AboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      { $push: { gallery: { $each: images } } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Gallery images added successfully',
      data: {
        gallery: aboutUs.gallery
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add gallery images',
      error: error.message
    });
  }
};

// Remove Gallery Image
export const removeGalleryImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const aboutUs = await AboutUs.findOneAndUpdate(
      { businessId: req.user._id },
      { $pull: { gallery: imageUrl } },
      { new: true }
    );

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery image removed successfully',
      data: {
        gallery: aboutUs.gallery
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to remove gallery image',
      error: error.message
    });
  }
};

// Get All Images
export const getAllImages = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne({ businessId: req.user._id });
    
    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: 'About Us not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Images fetched successfully',
      data: {
        logoImage: aboutUs.logoImage,
        hospitalImage: aboutUs.hospitalImage,
        coverPage: aboutUs.coverPage,
        gallery: aboutUs.gallery
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
      error: error.message
    });
  }
};