import express from "express";
import {
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessById,
  listBusinesses,
  getBusinessesByPincode,
  fetchHospitalDetails,
} from "../controllers/business.controller.js";
import { saveHospitalOfferings } from "../controllers/catalog.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Businesses
 *   description: Hospital / Clinic / Lab management
 */

/**
 * @swagger
 * /api/businesses:
 *   post:
 *     summary: Create a new business (hospital / clinic / lab)
 *     tags: [Businesses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: City Care Hospital
 *               type:
 *                 type: string
 *                 enum: [HOSPITAL, CLINIC, LAB, PHARMACY]
 *                 example: HOSPITAL
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               locations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pincode:
 *                       type: string
 *                       example: "560037"
 *                     city:
 *                       type: string
 *                       example: Bangalore
 *                     state:
 *                       type: string
 *                       example: Karnataka
 *     responses:
 *       201:
 *         description: Business created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", createBusiness);

/**
 * @swagger
 * /api/businesses:
 *   get:
 *     summary: List all businesses
 *     tags: [Businesses]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [HOSPITAL, CLINIC, LAB, PHARMACY]
 *         description: Filter by business type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Businesses fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", listBusinesses);

/**
 * @swagger
 * /api/businesses/by-pincode:
 *   get:
 *     summary: Fetch businesses available in a specific pincode
 *     tags: [Businesses]
 *     parameters:
 *       - in: query
 *         name: pincode
 *         required: true
 *         schema:
 *           type: string
 *         example: "560037"
 *         description: Pincode to search businesses
 *     responses:
 *       200:
 *         description: Businesses fetched successfully by pincode
 *       400:
 *         description: Pincode missing
 *       500:
 *         description: Server error
 */
router.get("/by-pincode", getBusinessesByPincode);

/**
 * @swagger
 * /api/businesses/{id}:
 *   get:
 *     summary: Get a business by ID
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business fetched successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getBusinessById);

/**
 * @swagger
 * /api/businesses/{id}:
 *   put:
 *     summary: Update business details
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [HOSPITAL, CLINIC, LAB, PHARMACY]
 *               isActive:
 *                 type: boolean
 *               locations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pincode:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *     responses:
 *       200:
 *         description: Business updated successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */
router.put("/:id", updateBusiness);

/**
 * @swagger
 * /api/businesses/{id}:
 *   delete:
 *     summary: Deactivate a business (soft delete)
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business deactivated successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Business not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", deleteBusiness);

/**
 * @swagger
 * /api/businesses/ai-hospital/fetch-details:
 *   get:
 *     summary: Fetch all offerings for a specific hospital
 *     description: >
 *       Fetches all offerings (contacts, doctors, facilities, wards, static pages, etc.)
 *       for a given hospital (business). Results are grouped by offering type
 *       and filtered by pincode if provided.
 *     tags: [AI Hospital]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital (Business) ID
 *
 *       - in: query
 *         name: pincode
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional pincode to filter offerings by availability
 *     responses:
 *       200:
 *         description: Hospital offerings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hospital offerings fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "6650f2b5c9b8f1a2c8a3b123"
 *                         name:
 *                           type: string
 *                           example: The Mission Hospital
 *                         type:
 *                           type: string
 *                           example: HOSPITAL
 *                     offerings:
 *                       type: object
 *                       properties:
 *                         CONTACT:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ListingBase'
 *                         DOCTOR:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ListingBase'
 *                         WARD:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ListingBase'
 *                         FACILITY:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ListingBase'
 *                         MANAGEMENT:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ListingBase'
 *                         STATIC_PAGE:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ListingBase'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
router.get("/ai-hospital/fetch-details", fetchHospitalDetails);

/**
 * @swagger
 * /api/businesses/ai-hospital/offerings/save:
 *   post:
 *     summary: Save hospital offerings using hierarchical catalog keys
 *     description: >
 *       Saves hospital offerings by resolving catalog nodes hierarchically.
 *       For each level, the system checks catalog nodes using
 *       (moduleId + parentId + key). If a child node does not exist,
 *       it is created automatically. Offerings are then saved
 *       against the resolved catalog node IDs.
 *
 *       Root catalog nodes must already exist.
 *     tags: [AI Hospital]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - moduleId
 *               - data
 *             properties:
 *               businessId:
 *                 type: string
 *                 description: Business (Hospital) ID
 *                 example: 6650f2b5c9b8f1a2c8a3b123
 *               moduleId:
 *                 type: string
 *                 description: Hospital module ID
 *                 example: 6650f1a9c9b8f1a2c8a3a999
 *               data:
 *                 type: object
 *                 description: >
 *                   Key-based structured hospital data.
 *                   Keys must match catalog node keys.
 *                 example:
 *                   CONTACT_US:
 *                     phone: "+91-7482-222062"
 *                     email: info@hospital.com
 *                   OPT_OUTPATIENT_DEPARTMENT:
 *                     GENERAL_MEDICINE:
 *                       description: Adult medicine OPD
 *                       timing: "10:00 AM - 05:00 PM"
 *                       doctors:
 *                         - "Dr. Rajesh Sharma (MD)"
 *     responses:
 *       201:
 *         description: Hospital offerings saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Hospital offerings saved successfully
 *                 createdListings:
 *                   type: number
 *                   example: 42
 *       400:
 *         description: Validation error or missing catalog root
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Business not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/ai-hospital/offerings/save",
  protect,
  saveHospitalOfferings
);



export default router;
