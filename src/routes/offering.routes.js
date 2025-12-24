import express from "express";
import multer from "multer";
import {
  createOffering,
  getOfferings,
  getOfferingById,
  updateOffering,
  deactivateOffering,
} from "../controllers/offering.controller.js";
import { attachLocation } from "../middlewares/location.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Offerings
 *   description: Sellable offerings and service definitions
 */

/**
 * @swagger
 * /api/offerings:
 *   post:
 *     summary: Create a new offering
 *     description: >
 *       Creates a sellable offering.
 *       Supports optional image upload.
 *     tags: [Offerings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - pricing
 *             properties:
 *               name:
 *                 type: string
 *                 example: CBC Blood Test
 *               type:
 *                 type: string
 *                 example: LAB_TEST
 *               pricing:
 *                 type: string
 *                 description: JSON stringified pricing object
 *                 example: '{"basePrice":399,"discountedPrice":349,"currency":"INR"}'
 *               catalogNodeId:
 *                 type: string
 *                 example: 65f1a9b0a23d4e0012345678
 *               moduleId:
 *                 type: string
 *                 example: 65f1a9b0a23d4e0012341111
 *               serviceablePincodes:
 *                 type: string
 *                 description: JSON stringified array of pincodes
 *                 example: '["560001","560002"]'
 *               isPackage:
 *                 type: boolean
 *                 example: false
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Offering created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", upload.single("image"), createOffering);

/**
 * @swagger
 * /api/offerings:
 *   get:
 *     summary: Get offerings for user location
 *     description: >
 *       Fetches offerings filtered by the user’s serviceable location.
 *       Location is resolved via middleware.
 *     tags: [Offerings]
 *     parameters:
 *       - in: query
 *         name: catalogNodeId
 *         schema:
 *           type: string
 *         description: Filter by catalog node ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by offering type
 *     responses:
 *       200:
 *         description: Offerings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Offerings fetched successfully
 *                 count:
 *                   type: number
 *                   example: 6
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get("/", attachLocation, getOfferings);

/**
 * @swagger
 * /api/offerings/{id}:
 *   get:
 *     summary: Get offering by ID
 *     description: Retrieves offering details by offering ID.
 *     tags: [Offerings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offering ID
 *     responses:
 *       200:
 *         description: Offering fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Offering not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getOfferingById);

/**
 * @swagger
 * /api/offerings/{id}:
 *   patch:
 *     summary: Update an offering
 *     description: Updates offering metadata or pricing.
 *     tags: [Offerings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offering ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Offering updated successfully
 *       400:
 *         description: Invalid update payload
 *       404:
 *         description: Offering not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", updateOffering);

/**
 * @swagger
 * /api/offerings/{id}/deactivate:
 *   patch:
 *     summary: Deactivate an offering
 *     description: Marks an offering as inactive without deleting it.
 *     tags: [Offerings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offering ID
 *     responses:
 *       200:
 *         description: Offering deactivated successfully
 *       404:
 *         description: Offering not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/deactivate", deactivateOffering);

export default router;
