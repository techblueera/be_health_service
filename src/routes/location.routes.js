import express from 'express';
import {
  createLocation,
  getLocations,
  getLocationByPincode,
  updateLocation,
  disableLocation
} from '../controllers/location.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Serviceability and location (PIN code) management
 */

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Register a serviceable PIN code
 *     description: Creates a new location entry for serviceability.
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pincode
 *             properties:
 *               pincode:
 *                 type: string
 *                 example: "560001"
 *               city:
 *                 type: string
 *                 example: Bengaluru
 *               state:
 *                 type: string
 *                 example: Karnataka
 *               country:
 *                 type: string
 *                 example: India
 *     responses:
 *       201:
 *         description: Location created successfully
 *       400:
 *         description: Validation error or PIN already exists
 *       500:
 *         description: Server error
 */
// Admin-only: register a PIN
router.post('/', createLocation);

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: List or search serviceable PIN codes
 *     description: >
 *       Fetches all registered PIN codes or filters them
 *       using query parameters.
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: pincode
 *         schema:
 *           type: string
 *         description: Filter by PIN code
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by service availability
 *     responses:
 *       200:
 *         description: Locations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Locations fetched successfully
 *                 count:
 *                   type: number
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
// Admin-only: list/search PINs
router.get('/', getLocations);

/**
 * @swagger
 * /api/locations/by-pincode/{pincode}:
 *   get:
 *     summary: Fetch a location by PIN code
 *     description: Retrieves serviceability metadata for a PIN code.
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: pincode
 *         required: true
 *         schema:
 *           type: string
 *         example: "560001"
 *     responses:
 *       200:
 *         description: Location fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: PIN code not found
 *       500:
 *         description: Server error
 */
// Admin-only: fetch a PIN
router.get('/by-pincode/:pincode', getLocationByPincode);

/**
 * @swagger
 * /api/locations/by-pincode/{pincode}:
 *   patch:
 *     summary: Update location metadata
 *     description: Updates serviceability details for a PIN code.
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: pincode
 *         required: true
 *         schema:
 *           type: string
 *         example: "560001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *                 example: Bengaluru
 *               state:
 *                 type: string
 *                 example: Karnataka
 *               isServiceable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       400:
 *         description: Invalid update payload
 *       404:
 *         description: PIN code not found
 *       500:
 *         description: Server error
 */
// Admin-only: update metadata for a PIN
router.patch('/by-pincode/:pincode', updateLocation);

/**
 * @swagger
 * /api/locations/by-pincode/{pincode}/disable:
 *   patch:
 *     summary: Disable serviceability for a PIN code
 *     description: Marks a PIN code as non-serviceable.
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: pincode
 *         required: true
 *         schema:
 *           type: string
 *         example: "560001"
 *     responses:
 *       200:
 *         description: Location disabled successfully
 *       404:
 *         description: PIN code not found
 *       500:
 *         description: Server error
 */
// Admin-only: disable service for a PIN
router.patch('/by-pincode/:pincode/disable', disableLocation);

export default router;
