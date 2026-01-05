import express from "express";
import multer from "multer";
import {
  createProductAdmin,
  updateProductAdmin,
  searchProducts,
  searchProductsForUser,
  getProductById,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getChangeRequests,
  approveChangeRequest,
  rejectChangeRequest,
  getAllProductsAdmin,
  getPostedOfferingsByCategoryNode,
} from "../controllers/product.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { createListing, fetchListings, updateDoctorLeave } from "../controllers/hospital.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
/**
 * @swagger
 * components:
 *   schemas:
 *     ListingBase:
 *       type: object
 *       required:
 *         - catalogNodeId
 *         - type
 *         - title
 *       properties:
 *         catalogNodeId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         order:
 *           type: number
 *         isActive:
 *           type: boolean
 *
 *     DoctorListing:
 *       allOf:
 *         - $ref: '#/components/schemas/ListingBase'
 *         - type: object
 *           required:
 *             - type
 *             - data
 *           properties:
 *             type:
 *               type: string
 *               enum: [DOCTOR]
 *             data:
 *               type: object
 *               required:
 *                 - availability
 *                 - fees
 *               properties:
 *                 availability:
 *                   type: object
 *                 fees:
 *                   type: number
 *
 *     WardListing:
 *       allOf:
 *         - $ref: '#/components/schemas/ListingBase'
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [WARD]
 *             data:
 *               type: object
 *               properties:
 *                 beds:
 *                   type: number
 *                 pricePerDay:
 *                   type: number
 *
 *     FacilityListing:
 *       allOf:
 *         - $ref: '#/components/schemas/ListingBase'
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [FACILITY]
 *             data:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 */

/**
 * @swagger
 * /api/offerings/{id}/doctor/leave:
 *   patch:
 *     summary: Set doctor leave period
 *     description: |
 *       Updates the leave period for an existing DOCTOR listing.
 *       This does NOT create a new listing.
 *
 *       Rules:
 *       - Only listings with type = DOCTOR are allowed
 *       - Leave is stored inside data.availability
 *       - Leave will be auto-cleared after the end date (via cron)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from
 *               - to
 *             properties:
 *               from:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-01
 *               to:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-05
 *     responses:
 *       200:
 *         description: Doctor leave updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Doctor leave updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Invalid input (ID format, missing dates, invalid range)
 *       404:
 *         description: Doctor listing not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:id/doctor/leave",
  protect,
  updateDoctorLeave
);

/**
 * @swagger
 * /api/offerings/fetch-listings:
 *   get:
 *     summary: Fetch listings (Doctor, Ward, Facility, etc.)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: catalogNodeId
 *         schema:
 *           type: string
 *         description: Catalog node ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DOCTOR, WARD, FACILITY]
 *         description: Listing type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Active status
 *     responses:
 *       200:
 *         description: Listings fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/fetch-listings", fetchListings);

/**
 * @swagger
 * tags:
 *   name: Offerings
 *   description: Product management for admins and businesses
 */

/**
 * @swagger
 * /api/offerings/category/{categoryNodeId}:
 *   get:
 *     summary: '[Admin] Get posted products by category node'
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryNodeId
 *         required: true
 *         schema:
 *           type: string
 *           example: 65ab12f3c9a1b23d45ef6789
 *         description: Catalog / Category node ID
 *     responses:
 *       200:
 *         description: Posted products fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Posted products fetched successfully
 *                 count:
 *                   type: number
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 65bc98a2f1c3
 *                       name:
 *                         type: string
 *                         example: CBC Blood Test
 *                       status:
 *                         type: string
 *                         example: POSTED
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Invalid category node ID format
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/category/:categoryNodeId",
  protect,
  getPostedOfferingsByCategoryNode
);

/**
 * @swagger
 * /api/offerings/user/search:
 *   get:
 *     summary: "[User] Search for available products in a pincode"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pincode
 *         required: true
 *         schema:
 *           type: string
 *         description: The pincode where the user wants to search for products. This is mandatory.
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Search within a specific category using its key (e.g., 'FRUITS'). Will include child categories.
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Text to search for in product name, brand, description, and tags.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page.
 *     responses:
 *       200:
 *         description: A paginated list of products, where each variant includes available inventory for the specified pincode.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Product'
 *                       - type: object
 *                         properties:
 *                           variants:
 *                             type: array
 *                             items:
 *                               allOf:
 *                                 - $ref: '#/components/schemas/ProductVariant'
 *                                 - type: object
 *                                   properties:
 *                                     inventory:
 *                                       type: array
 *                                       description: "Inventory details for this variant in the specified pincode. Can be from multiple businesses."
 *                                       items:
 *                                         $ref: '#/components/schemas/Inventory'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Bad Request - Pincode is required.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/user/search", protect, searchProductsForUser);

/**
 * @swagger
 * /api/offerings/search:
 *   get:
 *     summary: "[Business] Search for products to add to inventory"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Text to search for in product name, brand, and description.
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Search within a specific category ID.
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Search within a specific category using its key.
 *       - in: query
 *         name: pincode
 *         schema:
 *           type: string
 *         description: Pincode to prioritize search results. Variants with pricing for this pincode will appear first.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page.
 *     responses:
 *       200:
 *         description: A paginated list of products with their variants.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductWithVariants'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/search", protect, searchProducts);

/**
 * @swagger
 * /api/offerings/{productId}:
 *   get:
 *     summary: "[Public] Get a single product by its ID, with all its variants"
 *     tags: [Offerings]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product.
 *     responses:
 *       200:
 *         description: The product object along with an array of its variants.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProductWithVariants'
 *       400:
 *         description: Bad Request - Invalid product ID format.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/:productId", getProductById);

/**
 * @swagger
 * /api/offerings/admin:
 *   post:
 *     summary: "[Admin] Create a new product and its variants"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productData:
 *                 type: string
 *                 description: A JSON string of the product object.
 *                 example: '{"name": "Organic Apples", "description": "Fresh organic apples from the farm.", "brand": "FarmFresh", "catalogNodeId": "694e4427d7104a6ee744d868", "type": "PRODUCT", "tags": ["organic", "fruit", "fresh"], "isVegetarian": true, "countryOfOrigin": "India"}'
 *               variantData:
 *                 type: string
 *                 description: A JSON string of an array of product variant objects.
 *                 example: '[{"variantName": "1kg Pack", "unit": "kg", "sku": "FFA-APL-1KG", "barcode": "9876543210123", "pricing": [{"pincode": "110001", "cityName": "Delhi", "mrp": 150, "sellingPrice": 140}], "weight": 500}, {"variantName": "500g Pack", "unit": "g", "sku": "FFA-APL-500G", "barcode": "9876543210124", "pricing": [{"pincode": "110001", "cityName": "Delhi", "mrp": 80, "sellingPrice": 75}], "weight": 250}]'
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images for the main product (use fieldname 'productImages').
 *               "variantImages[n]":
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Images for the variant at index 'n' in the variantData array. E.g., 'variantImages[0]', 'variantImages[1]'."
 *     responses:
 *       201:
 *         description: Product and variants created successfully.
 *       400:
 *         description: Bad Request - Invalid input, JSON parsing error, or image moderation failure.
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: Category not found.
 *       409:
 *         description: Conflict - A product or variant with the same unique fields (e.g., SKU) already exists.
 *       500:
 *         description: Internal Server Error.
 */
router.post(
  "/admin",
  protect,
  authorizeRoles("ADMIN"),
  upload.any(),
  createProductAdmin
);

/**
 * @swagger
 * /api/offerings/admin/{productId}:
 *   put:
 *     summary: "[Admin] Update a product and its variants"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productData:
 *                 type: string
 *                 description: "A JSON string of the product fields to update. To remove images, include an 'imagesToRemove' array with image URLs."
 *                 example: '{"name": "Premium Organic Apples", "brand": "FarmFresh Supreme", "imagesToRemove": ["https://s3.amazonaws.com/bucket/old-image.jpg"]}'
 *               variantsData:
 *                 type: string
 *                 description: "A JSON string of the COMPLETE array of product variants. To update a variant, include its '_id'. To create a new one, omit '_id'. Variants not in this array will be DELETED (if they have no inventory)."
 *                 example: '[{"_id": "60d0fe4f5311236168a109cb", "variantName": "1kg Premium Pack", "pricing": [{"mrp": 160, "sellingPrice": 155}]}, {"variantName": "2kg Box", "sku": "FFA-APL-2KG", "pricing": [{"pincode": "110001", "cityName": "Delhi", "mrp": 300, "sellingPrice": 280}]}]'
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to ADD to the main product. These are appended to the existing images.
 *               "variantImages[n]":
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "New images to ADD for the variant at index 'n' in the variantsData array. These are appended to existing images for that variant."
 *     responses:
 *       200:
 *         description: Product and variants updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ProductWithVariants'
 *       400:
 *         description: Bad Request - Invalid input, JSON parsing error, image moderation failure, or trying to delete variant with inventory.
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: Product or a specified variant not found.
 *       409:
 *         description: Conflict - A product or variant with the same unique fields (e.g., SKU) already exists.
 *       500:
 *         description: Internal Server Error.
 */
router.put(
  "/admin/:productId",
  protect,
  authorizeRoles("ADMIN"),
  upload.any(),
  updateProductAdmin
);

/**
 * @swagger
 * /api/offerings/admin/all:
 *   get:
 *     summary: "[Admin] Get all products with pagination"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page.
 *     responses:
 *       200:
 *         description: A paginated list of products with their category populated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/admin/all", protect, authorizeRoles("ADMIN"), getAllProductsAdmin);

/**
 * @swagger
 * /api/offerings/{productId}/variants:
 *   post:
 *     summary: "[Admin/Business] Create a new variant for a product"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to add a variant to.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               variantData:
 *                 type: string
 *                 description: A JSON string of the product variant object.
 *                 example: '{"variantName": "500g Pack", "unit": "g", "sku": "FFA-APL-500G", "pricing": [{"pincode": "110001", "cityName": "Delhi", "mrp": 80, "sellingPrice": 75}], "weight": 500}'
 *               variantImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images specific to this product variant.
 *     responses:
 *       201:
 *         description: Product variant created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductVariant'
 *       400:
 *         description: Bad Request - Invalid input, JSON parsing error, or image moderation failure.
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: Product not found.
 *       409:
 *         description: Conflict - A variant with the same unique fields (e.g., SKU) already exists.
 *       500:
 *         description: Internal Server Error.
 */
router.post(
  "/:productId/variants",
  protect,
  authorizeRoles("ADMIN", "BUSINESS"),
  upload.fields([{ name: "variantImages", maxCount: 5 }]),
  createProductVariant
);

/**
 * @swagger
 * /api/offerings/variants/{variantId}:
 *   put:
 *     summary: "[Admin/Business] Update a product variant or submit for approval"
 *     description: "Admins can update directly. Business users will submit a change request for admin approval."
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product variant to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariant'
 *     responses:
 *       200:
 *         description: "[Admin] Product variant updated successfully."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductVariant'
 *       202:
 *         description: "[Business] Update request submitted for approval."
 *       400:
 *         description: Bad Request - Invalid input data. This endpoint does not support image updates.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: ProductVariant not found.
 *       409:
 *         description: Conflict - A variant with the same unique fields (e.g., SKU) already exists.
 *       500:
 *         description: Internal Server Error.
 */
router.put(
  "/variants/:variantId",
  protect,
  authorizeRoles("ADMIN", "BUSINESS"),
  updateProductVariant
);

/**
 * @swagger
 * /api/offerings/variants/{variantId}:
 *   delete:
 *     summary: "[Admin] Delete a product variant"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product variant to delete.
 *     responses:
 *       200:
 *         description: Product variant deleted successfully.
 *       400:
 *         description: Bad Request - Cannot delete variant with existing inventory.
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: ProductVariant not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete(
  "/variants/:variantId",
  protect,
  authorizeRoles("ADMIN"),
  deleteProductVariant
);

/**
 * @swagger
 * /api/offerings/variants/change-requests:
 *   get:
 *     summary: "[Admin] Get product variant change requests"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *         description: Filter requests by status.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: A list of change requests.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal Server Error.
 */
router.get(
  "/variants/change-requests",
  protect,
  authorizeRoles("ADMIN"),
  getChangeRequests
);

/**
 * @swagger
 * /api/offerings/variants/change-requests/{requestId}/approve:
 *   post:
 *     summary: "[Admin] Approve a product variant change request"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the change request to approve.
 *     responses:
 *       200:
 *         description: Change request approved and product variant updated.
 *       400:
 *         description: Request is not pending.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Change request or variant not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post(
  "/variants/change-requests/:requestId/approve",
  protect,
  authorizeRoles("ADMIN"),
  approveChangeRequest
);

/**
 * @swagger
 * /api/offerings/variants/change-requests/{requestId}/reject:
 *   post:
 *     summary: "[Admin] Reject a product variant change request"
 *     tags: [Offerings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the change request to reject.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 description: "Reason for rejecting the change."
 *                 example: "The new SKU is incorrect."
 *     responses:
 *       200:
 *         description: Change request rejected successfully.
 *       400:
 *         description: Request is not pending or rejection reason is missing.
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Change request not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post(
  "/variants/change-requests/:requestId/reject",
  protect,
  authorizeRoles("ADMIN"),
  rejectChangeRequest
);

/**
 * @swagger
 * /api/offerings/listings:
 *   post:
 *     summary: Create a listing (Doctor, Ward, Facility, etc.)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/DoctorListing'
 *               - $ref: '#/components/schemas/WardListing'
 *               - $ref: '#/components/schemas/FacilityListing'
 *             discriminator:
 *               propertyName: type
 *               mapping:
 *                 DOCTOR: '#/components/schemas/DoctorListing'
 *                 WARD: '#/components/schemas/WardListing'
 *                 FACILITY: '#/components/schemas/FacilityListing'
 *     responses:
 *       201:
 *         description: Listing created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/listings", protect, createListing);


export default router;
