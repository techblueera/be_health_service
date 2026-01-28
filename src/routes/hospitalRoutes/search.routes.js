// routes/searchRoutes.js
import express from 'express';
import { searchAcrossModels } from '../../controllers/hospitalControllers/search.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/hp/search:
 *   get:
 *     summary: Smart search across all hospital data
 *     description: Automatically searches across all relevant models based on the provided parameters
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword (searches across all text fields in all models)
 *         example: ramesh
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by name field
 *         example: Dr. Ramesh
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Search by type field (departments, wards, etc.)
 *         example: OPD
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *       - in: query
 *         name: isOnLeave
 *         schema:
 *           type: boolean
 *         description: Filter doctors by leave status
 *         example: false
 *       - in: query
 *         name: isOccupied
 *         schema:
 *           type: boolean
 *         description: Filter beds by occupancy
 *         example: false
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: wardId
 *         schema:
 *           type: string
 *         description: Filter by ward ID
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Search results from all matching models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: Results grouped by model name
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalResults:
 *                       type: integer
 */
router.get('/', protect, searchAcrossModels);

export default router;
