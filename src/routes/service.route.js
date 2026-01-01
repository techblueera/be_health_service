import express from "express";
import * as serviceController from "../controllers/service.controller.js";
const router = express.Router();

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
 *                 type: string
 *                 description: JSON string containing service data
 *                 example: >
 *                   {
 *                     "catalogNodeId": "64fa1234abcd1234abcd1234",
 *                     "name": "Complete Blood Count",
 *                     "serviceType": "LAB_TEST",
 *                     "labDetails": {
 *                       "sampleType": "BLOOD",
 *                       "fastingRequired": false,
 *                       "tatHours": 24
 *                     },
 *                     "pricing": [
 *                       {
 *                         "pincode": "560001",
 *                         "cityName": "Bangalore",
 *                         "mrp": 1200,
 *                         "sellingPrice": 900
 *                       }
 *                     ]
 *                   }
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
router.post("/", serviceController.createService);

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
router.put("/:id", serviceController.updateService);

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
router.delete("/:id", serviceController.deleteService);
;

export default router;