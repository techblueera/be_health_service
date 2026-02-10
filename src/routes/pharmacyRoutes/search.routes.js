// import express from 'express';
// import { searchAcrossModels } from '../../controllers/pharmacyControllers/search.controller.js';
// import { protect } from '../../middlewares/auth.middleware.js';

// const router = express.Router();

// /**
//  * @swagger
//  * /api/ms/search:
//  *   get:
//  *     summary: Smart search across all pharmacy data
//  *     description: Automatically searches across all pharmacy models based on provided parameters
//  *     tags: [Pharmacy Search]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: keyword
//  *         schema:
//  *           type: string
//  *         description: Search keyword (searches all text fields)
//  *         example: paracetamol
//  *       - in: query
//  *         name: name
//  *         schema:
//  *           type: string
//  *         description: Search by medicine/product name
//  *         example: Paracetamol 500mg
//  *       - in: query
//  *         name: category
//  *         schema:
//  *           type: string
//  *         description: Search by category
//  *         example: Analgesic
//  *       - in: query
//  *         name: manufacturer
//  *         schema:
//  *           type: string
//  *         description: Search by manufacturer
//  *         example: Sun Pharma
//  *       - in: query
//  *         name: batchNumber
//  *         schema:
//  *           type: string
//  *         description: Search by batch number
//  *         example: BATCH2024001
//  *       - in: query
//  *         name: inStock
//  *         schema:
//  *           type: boolean
//  *         description: Filter medicines in stock
//  *         example: true
//  *       - in: query
//  *         name: isExpired
//  *         schema:
//  *           type: boolean
//  *         description: Filter expired items
//  *         example: false
//  *       - in: query
//  *         name: price
//  *         schema:
//  *           type: string
//  *         description: Price range (e.g., 10-100)
//  *         example: 50-200
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *       - in: query
//  *         name: sortBy
//  *         schema:
//  *           type: string
//  *           default: createdAt
//  *       - in: query
//  *         name: sortOrder
//  *         schema:
//  *           type: string
//  *           enum: [asc, desc]
//  *           default: desc
//  *     responses:
//  *       200:
//  *         description: Search results from all matching pharmacy models
//  */
// router.get('/', protect, searchAcrossModels);

// export default router;