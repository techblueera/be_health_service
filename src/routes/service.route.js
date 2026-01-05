import multer from 'multer';
import express from "express";
import * as serviceController from "../controllers/service.controller.js";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
import { protect } from '../middlewares/auth.middleware.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     BaseService:
 *       type: object
 *       required:
 *         - catalogNodeId
 *         - name
 *         - serviceType
 *         - pricing
 *       properties:
 *         catalogNodeId:
 *           type: string
 *           example: 64fa1234abcd1234abcd1234
 *         name:
 *           type: string
 *           example: Complete Blood Count
 *         serviceType:
 *           type: string
 *           enum: [LAB_TEST, LAB_PACKAGE]
 *         pricing:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required: [pincode, cityName, mrp, sellingPrice]
 *             properties:
 *               pincode:
 *                 type: string
 *                 example: "560001"
 *               cityName:
 *                 type: string
 *                 example: Bangalore
 *               mrp:
 *                 type: number
 *                 example: 1200
 *               sellingPrice:
 *                 type: number
 *                 example: 900
 *
 *     LabTestService:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseService'
 *         - type: object
 *           required:
 *             - labDetails
 *           properties:
 *             serviceType:
 *               type: string
 *               enum: [LAB_TEST]
 *             labDetails:
 *               type: object
 *               required: [sampleType, fastingRequired, tatHours]
 *               properties:
 *                 sampleType:
 *                   type: string
 *                   example: BLOOD
 *                 fastingRequired:
 *                   type: boolean
 *                   example: false
 *                 tatHours:
 *                   type: number
 *                   example: 24
 *
 *     LabPackageService:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseService'
 *         - type: object
 *           required:
 *             - includedServices
 *           properties:
 *             serviceType:
 *               type: string
 *               enum: [LAB_PACKAGE]
 *             includedServices:
 *               type: array
 *               minItems: 1
 *               items:
 *                 type: string
 *                 example: 64fa9999abcd1234abcd5678
 */


/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service (LAB_TEST or LAB_PACKAGE)
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productData
 *             properties:
 *               productData:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/LabTestService'
 *                   - $ref: '#/components/schemas/LabPackageService'
 *                 discriminator:
 *                   propertyName: serviceType
 *                   mapping:
 *                     LAB_TEST: '#/components/schemas/LabTestService'
 *                     LAB_PACKAGE: '#/components/schemas/LabPackageService'
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Catalog not found
 *       500:
 *         description: Internal server error
 */
router.post("/", protect, upload.any(), serviceController.createService);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: List services with filters and pagination
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: catalogId
 *         schema:
 *           type: string
 *         description: CatalogNode ID
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *           enum: [LAB_TEST, LAB_PACKAGE]
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search by service name
 *       - in: query
 *         name: pincode
 *         schema:
 *           type: string
 *         description: Filter by pricing pincode
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Services fetched successfully
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get("/", serviceController.listServices);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service details by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service fetched successfully
 *       400:
 *         description: Invalid service ID
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", serviceController.getServiceById);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Update an existing service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: "Updated CBC Test"
 *               pricing:
 *                 - pincode: "560001"
 *                   cityName: "Bangalore"
 *                   mrp: 1300
 *                   sellingPrice: 950
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", protect, serviceController.updateService);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       400:
 *         description: Invalid service ID or service in use
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", protect, serviceController.deleteService);

export default router;