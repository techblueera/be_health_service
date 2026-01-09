import mongoose from "mongoose";
import { Business, Catalog, Inventory, Listing } from "../models/index.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Uploader.js";
import { moderateContentFromUrl } from "../utils/s3-moderator.js";
import logger from "../utils/appLogger.js";

const createCategory = async (req, res) => {
  const { name, key, type, description, parentId, isActive, moduleId } =
    req.body;

  try {
    let imageUrl;
    if (req.file) {
      const uploadedUrl = await uploadToS3(req.file);
      const moderationResult = await moderateContentFromUrl(uploadedUrl);

      if (moderationResult.status !== "allowed") {
        logger.warn(
          `Image moderation failed for ${uploadedUrl} with reason: ${moderationResult.reason}`,
          "createCategory"
        );
        return res.status(400).json({
          message: `Image moderation failed: ${moderationResult.reason}`,
        });
      }
      imageUrl = uploadedUrl;
    }

    let level = 0;
    if (parentId) {
      const parentCategory = await Catalog.findById(parentId);
      if (!parentCategory) {
        return res.status(404).json({ message: "Parent category not found" });
      }
      level = parentCategory.level + 1;
    }

    const newCategory = new Catalog({
      name,
      key,
      type,
      description,
      parentId: parentId || null,
      moduleId,
      level,
      isActive,
      image: imageUrl,
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    logger.error("Error creating category", "createCategory", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A category with this name or key already exists." });
    }
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Catalog.find().sort({ level: 1 });
    res.status(200).json(categories);
  } catch (error) {
    logger.error("Error fetching categories", "getCategories", error);
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Catalog.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Catalog not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    logger.error(
      `Error fetching category ${req.params.id}`,
      "getCategoryById",
      error
    );
    res
      .status(500)
      .json({ message: "Error fetching category", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, key, description, type, parentId, level, isActive } = req.body;

  try {
    const category = await Catalog.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Catalog not found" });
    }

    let imageUrl = category.image;
    if (req.file) {
      const uploadedUrl = await uploadToS3(req.file);
      // If moderation is successful and there was an old image, delete it
      if (category.image) {
        await deleteFromS3(category.image);
      }
      imageUrl = uploadedUrl;
    }

    category.name = name ?? category.name;
    category.key = key ?? category.key;
    category.type = type ?? category.type;
    category.description = description ?? category.description;
    category.parentId = parentId ?? category.parentId;
    category.level = level ?? category.level;
    category.isActive = isActive ?? category.isActive;
    category.image = imageUrl;

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    logger.error(`Error updating category ${id}`, "updateCategory", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A category with this name or key already exists." });
    }
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Catalog.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Catalog not found" });
    }

    // Check if the category is a parent to any other categories
    const childCount = await Catalog.countDocuments({ parentId: category._id });
    if (childCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete a category that has sub-categories. Please delete them first.",
      });
    }

    // If there's an image, delete it from S3
    if (category.image) {
      await deleteFromS3(category.image);
    }

    await category.deleteOne(); // Use deleteOne instead of remove
    res.status(200).json({ message: "Catalog deleted successfully" });
  } catch (error) {
    logger.error(
      `Error deleting category ${req.params.id}`,
      "deleteCategory",
      error
    );
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

const getNestedCategories = async (req, res) => {
  try {
    const { categoryId, categoryKey } = req.query;

    const categories = await Catalog.find().lean();
    const categoryMap = new Map();

    categories.forEach((category) => {
      category.children = [];
      categoryMap.set(category._id.toString(), category);
    });

    const rootCategories = [];

    categories.forEach((category) => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId.toString());
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    if (categoryId) {
      const category = categoryMap.get(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      return res.status(200).json(category);
    }

    if (categoryKey) {
      const upperKey = categoryKey.toUpperCase();
      const category = categories.find((c) => c.key === upperKey);
      if (!category) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      // we need to get the category from the map to get children
      const categoryFromMap = categoryMap.get(category._id.toString());
      return res.status(200).json(categoryFromMap);
    }

    res.status(200).json(rootCategories);
  } catch (error) {
    logger.error(
      "Error fetching nested categories",
      "getNestedCategories",
      error
    );
    res.status(500).json({
      message: "Error fetching nested categories",
      error: error.message,
    });
  }
};

const getChildrenByCategoryId = async (req, res) => {
  try {
    const parentId = req.params.id;
    const parentCategory = await Catalog.findById(parentId);
    if (!parentCategory) {
      return res.status(404).json({ message: "Parent category not found" });
    }

    const children = await Catalog.find({ parentId: parentId });
    res.status(200).json(children);
  } catch (error) {
    logger.error(
      `Error fetching children for category ${req.params.id}`,
      "getChildrenByCategoryId",
      error
    );
    res.status(500).json({
      message: "Error fetching children categories",
      error: error.message,
    });
  }
};

const getChildrenByCategoryKey = async (req, res) => {
  try {
    const parentKey = req.params.key;
    const parentCategory = await Catalog.findOne({
      key: parentKey.toUpperCase(),
    }); // Assuming keys are stored uppercase
    if (!parentCategory) {
      return res
        .status(404)
        .json({ message: "Parent category not found with provided key." });
    }

    const children = await Catalog.find({ parentId: parentCategory._id });
    res.status(200).json(children);
  } catch (error) {
    logger.error(
      `Error fetching children for category key ${req.params.key}`,
      "getChildrenByCategoryKey",
      error
    );
    res.status(500).json({
      message: "Error fetching children categories by key",
      error: error.message,
    });
  }
};

const searchCategories = async (req, res) => {
  try {
    const { key, name } = req.query;
    const query = {};

    if (key) {
      query.key = { $regex: key, $options: "i" };
    }
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        message: "Please provide a search query parameter (e.g., key, name).",
      });
    }

    const categories = await Catalog.find(query).limit(20);
    res.status(200).json(categories);
  } catch (error) {
    logger.error("Error searching categories", "searchCategories", error);
    res
      .status(500)
      .json({ message: "Error searching categories", error: error.message });
  }
};

const getBusinessCategoriesWithInventory = async (req, res) => {
  try {
    const businessId = req.user._id;

    const pipeline = [
      // 1. Match inventory for the specific business
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
        },
      },
      // 2. Lookup productVariant
      {
        $lookup: {
          from: "productvariants",
          localField: "productVariant",
          foreignField: "_id",
          as: "productVariant",
        },
      },
      { $unwind: "$productVariant" },
      // 3. Lookup product
      {
        $lookup: {
          from: "products",
          localField: "productVariant.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      // 4. Lookup category
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      // 5. Find the top-level parent (ancestor) of each category
      {
        $graphLookup: {
          from: "categories",
          startWith: "$category.parentId",
          connectFromField: "parentId",
          connectToField: "_id",
          as: "ancestors",
        },
      },
      // 6. Find the root category (level 0)
      {
        $addFields: {
          rootCategory: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$ancestors",
                      as: "anc",
                      cond: { $eq: ["$$anc.level", 0] },
                    },
                  },
                  0,
                ],
              },
              {
                $cond: {
                  if: { $eq: ["$category.level", 0] },
                  then: "$category",
                  else: null,
                },
              },
            ],
          },
        },
      },
      // 7. Filter out products that don't have a root category (should not happen with good data)
      {
        $match: {
          rootCategory: { $ne: null },
        },
      },
      // 8. Group by the root category to get a unique list
      {
        $group: {
          _id: "$rootCategory._id",
          name: { $first: "$rootCategory.name" },
          key: { $first: "$rootCategory.key" },
          description: { $first: "$rootCategory.description" },
          image: { $first: "$rootCategory.image" },
          isActive: { $first: "$rootCategory.isActive" },
          level: { $first: "$rootCategory.level" },
          createdAt: { $first: "$rootCategory.createdAt" },
          updatedAt: { $first: "$rootCategory.updatedAt" },
        },
      },
      // 9. Reformat the output
      {
        $project: {
          _id: "$_id",
          name: "$name",
          key: "$key",
          description: "$description",
          image: "$image",
          isActive: "$isActive",
          level: "$level",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
        },
      },
      { $sort: { name: 1 } }, // Sort alphabetically
    ];

    const categories = await Inventory.aggregate(pipeline);

    res.status(200).json(categories);
  } catch (error) {
    logger.error(
      "Error fetching business categories with inventory",
      "getBusinessCategoriesWithInventory",
      error
    );
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

const updateCatalogNodeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    /* ---------- Guard: id ---------- */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid catalogNodeId format",
      });
    }

    /* ---------- Guard: isActive ---------- */
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be a boolean (true or false)",
      });
    }

    const node = await Catalog.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!node) {
      return res.status(404).json({
        message: "Catalog node not found",
      });
    }

    return res.status(200).json({
      message: `Catalog node ${isActive ? "activated" : "deactivated"} successfully`,
      data: node,
    });
  } catch (error) {
    logger.error("Error updating catalog node status", error);
    return res.status(500).json({
      message: "Error updating catalog node status",
      error: error.message,
    });
  }
};

const fetchCatalogForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { moduleId } = req.query;

    /* ---------- Guards ---------- */
    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid businessId" });
    }

    if (moduleId && !mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    /* ---------- Aggregation ---------- */
    const catalog = await Catalog.aggregate([
      /* 1. System-level active nodes */
      {
        $match: {
          isActive: true,
          ...(moduleId && {
            moduleId: new mongoose.Types.ObjectId(moduleId),
          }),
        },
      },

      /* 2. Join business-specific overrides */
      {
        $lookup: {
          from: "businesscatalognodes",
          let: { nodeId: "$_id" },
          pipeline: [
            {
              $match: {
                businessId: new mongoose.Types.ObjectId(businessId),
                $expr: { $eq: ["$catalogNodeId", "$$nodeId"] },
              },
            },
          ],
          as: "override",
        },
      },

      /* 3. Compute effective enabled flag */
      {
        $addFields: {
          isEnabledForBusiness: {
            $cond: [
              { $gt: [{ $size: "$override" }, 0] },
              { $arrayElemAt: ["$override.isEnabled", 0] },
              true, // default
            ],
          },
        },
      },

      /* 4. Cleanup */
      {
        $project: {
          override: 0,
        },
      },

      /* 5. Ordering */
      {
        $sort: {
          level: 1,
          order: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Catalog fetched successfully for business",
      data: catalog,
    });
  } catch (error) {
    logger.error("Error fetching catalog for business", error);
    return res.status(500).json({
      message: "Error fetching catalog",
      error: error.message,
    });
  }
};

export const getOrCreateCatalogNode = async ({
  moduleId,
  parentId,
  key,
  name,
  level,
}) => {
  return Catalog.findOneAndUpdate(
    {
      moduleId,
      parentId,
      key,
    },
    {
      $setOnInsert: {
        name,
        level,
        isActive: true,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );
};

const saveHospitalOfferings = async (req, res) => {
  try {
    const { businessId, moduleId, data } = req.body;

    /* ---------- Guards ---------- */
    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid businessId" });
    }

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId" });
    }

    if (!data || typeof data !== "object") {
      return res.status(400).json({ message: "data payload is required" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    /* ---------- Required root catalog keys ---------- */
    const ROOT_KEYS = [
      "OPT_OUTPATIENT_DEPARTMENT",
      "IPD_INPATIENT_DEPARTMENT",
      "EMERGENCY_AND_CRITICAL_CARE",
      "DIAGNOSTIC_DEPARTMENTS",
      "OTHER_FACILITIES",
      "ABOUT_US",
      "CONTACT_US",
      "CAREER",
      "MEDICAL_STORE",
    ];

    /* ---------- Load root catalog nodes ---------- */
    const rootNodes = await Catalog.find({
      moduleId,
      parentId: null,
      key: { $in: ROOT_KEYS },
      isActive: true,
    });

    const rootMap = {};
    rootNodes.forEach((n) => {
      rootMap[n.key] = n;
    });

    /* ---------- Validate roots ---------- */
    for (const key of Object.keys(data)) {
      if (!rootMap[key]) {
        return res.status(400).json({
          message: `Root catalog node missing or invalid: ${key}`,
        });
      }
    }

    const listings = [];

    /* ======================================================
       CONTACT_US
       ====================================================== */
    if (data.CONTACT_US) {
      listings.push({
        businessId,
        catalogNodeId: rootMap.CONTACT_US._id,
        type: "CONTACT",
        title: "Contact Us",
        isActive: true,
        data: data.CONTACT_US,
      });
    }

    /* ======================================================
       ABOUT_US
       ====================================================== */
    if (data.ABOUT_US) {
      listings.push({
        businessId,
        catalogNodeId: rootMap.ABOUT_US._id,
        type: "STATIC_PAGE",
        title: "About Us",
        isActive: true,
        data: data.ABOUT_US,
      });
    }

    /* ======================================================
       CAREER
       ====================================================== */
    if (Array.isArray(data.CAREER)) {
      for (const job of data.CAREER) {
        listings.push({
          businessId,
          catalogNodeId: rootMap.CAREER._id,
          type: "STATIC_PAGE",
          title: job.position,
          isActive: true,
          data: job,
        });
      }
    }

    /* ======================================================
       Generic section processor (OPD, IPD, Emergency, etc.)
       ====================================================== */
    const processSection = async (rootKey, listingType) => {
      const rootNode = rootMap[rootKey];
      const section = data[rootKey];
      if (!section) return;

      for (const childKey of Object.keys(section)) {
        const childData = section[childKey];

        const childNode = await getOrCreateCatalogNode({
          moduleId,
          parentId: rootNode._id,
          key: childKey,
          name: childKey.replace(/_/g, " "),
          level: rootNode.level + 1,
        });

        /* ---- Facility / Ward listing ---- */
        if (!childData.doctors && !childData.services) {
          listings.push({
            businessId,
            catalogNodeId: childNode._id,
            type: listingType,
            title: childKey.replace(/_/g, " "),
            isActive: true,
            data: childData,
          });
        }

        /* ---- Doctors under OPD ---- */
        if (Array.isArray(childData.doctors)) {
          for (const doctor of childData.doctors) {
            listings.push({
              businessId,
              catalogNodeId: childNode._id,
              type: "DOCTOR",
              title: doctor.split("(")[0].trim(),
              isActive: true,
              data: {
                raw: doctor,
                timing: childData.timing,
              },
            });
          }
        }

        /* ---- Diagnostic services ---- */
        if (Array.isArray(childData.services)) {
          for (const service of childData.services) {
            listings.push({
              businessId,
              catalogNodeId: childNode._id,
              type: "FACILITY",
              title: service.name,
              isActive: true,
              data: service,
            });
          }
        }
      }
    };

    await processSection("OPT_OUTPATIENT_DEPARTMENT", "FACILITY");
    await processSection("IPD_INPATIENT_DEPARTMENT", "WARD");
    await processSection("EMERGENCY_AND_CRITICAL_CARE", "FACILITY");
    await processSection("DIAGNOSTIC_DEPARTMENTS", "FACILITY");
    await processSection("OTHER_FACILITIES", "FACILITY");

    /* ---------- Persist listings ---------- */
    if (listings.length) {
      await Listing.insertMany(listings, { ordered: false });
    }

    return res.status(201).json({
      success: true,
      message: "Hospital offerings saved successfully",
      createdListings: listings.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error saving hospital offerings",
      error: error.message,
    });
  }
};

export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getNestedCategories,
  getChildrenByCategoryId,
  getChildrenByCategoryKey,
  searchCategories,
  getBusinessCategoriesWithInventory,
  updateCatalogNodeStatus,
  fetchCatalogForBusiness,
  saveHospitalOfferings,
};
