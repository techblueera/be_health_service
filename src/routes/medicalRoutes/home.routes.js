import express from 'express';
import { getMedicalHomeProfile } from "../../controllers/medicalStore/home.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Medical Profile
 *   description: Public-facing aggregated profile for a medical business
 */

/**
 * @swagger
 * /api/ms/medical-profile/{businessId}:
 *   get:
 *     summary: "Get a complete medical profile for a business"
 *     description: "Fetches an aggregated profile including business details (via gRPC), about us, contact info, gallery, active testimonials, and an inventory summary (popular discounted products and level-0 category-grouped products)."
 *     tags: [Medical Profile]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           description: The unique identifier (ObjectId) of the business.
 *     responses:
 *       200:
 *         description: Successfully fetched the complete medical profile.
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
 *                   example: "Medical profile fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     businessProfile:
 *                       type: object
 *                       description: "Business details retrieved from the gRPC microservice. Null if unavailable."
 *                     aboutUs:
 *                       type: object
 *                       description: "Pharmacy About Us details including logos and medical store images."
 *                     contact:
 *                       type: object
 *                       description: "Pharmacy Contact details including address, location coordinates, and timings."
 *                     gallery:
 *                       type: array
 *                       description: "List of gallery image collections for the business."
 *                       items:
 *                         type: object
 *                     testimonials:
 *                       type: array
 *                       description: "List of active user testimonials."
 *                       items:
 *                         type: object
 *                     inventorySummary:
 *                       type: object
 *                       properties:
 *                         popularProducts:
 *                           type: array
 *                           description: "List of products currently discounted (MRP > Selling Price)."
 *                           items:
 *                             type: object
 *                             properties:
 *                               productVariant:
 *                                 type: string
 *                               pincode:
 *                                 type: string
 *                               batches:
 *                                 type: object
 *                               variant:
 *                                 type: object
 *                               product:
 *                                 type: object
 *                               category:
 *                                 type: object
 *                         categoriesWithProducts:
 *                           type: array
 *                           description: "Products grouped by their Level-0 root category."
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: "Level 0 Category ID"
 *                               categoryName:
 *                                 type: string
 *                               categoryImage:
 *                                 type: string
 *                               categoryKey:
 *                                 type: string
 *                               products:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     inventoryId:
 *                                       type: string
 *                                     productId:
 *                                       type: string
 *                                     productName:
 *                                       type: string
 *                                     brand:
 *                                       type: string
 *                                     variantId:
 *                                       type: string
 *                                     variantName:
 *                                       type: string
 *                                     mrp:
 *                                       type: number
 *                                     sellingPrice:
 *                                       type: number
 *                                     totalStock:
 *                                       type: number
 *       400:
 *         description: Bad Request - Invalid businessId format.
 *       404:
 *         description: Business profile not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get('/:businessId',protect ,getMedicalHomeProfile);


export default router;