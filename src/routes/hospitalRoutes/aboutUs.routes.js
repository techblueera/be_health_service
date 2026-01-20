// routes/aboutUsRoutes.js
import express from "express";
import {
  createAboutUs,
  getAboutUs,
  updateAboutUs,
  deleteAboutUs,
  getHomePageDetails,
  getAllImages,
  removeGalleryImage,
  addMultipleGalleryImages,
  addGalleryImage,
  uploadCoverPage,
  uploadHospitalImage,
  uploadLogoImage,
} from "../../controllers/hospitalControllers/aboutUs.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AboutUs
 *   description: About Us management for hospital/business
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AboutUs:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1c9c2a1b23c0012345678
 *         businessId:
 *           type: string
 *           example: 64f1c9c2a1b23c0098765432
 *         visionMission:
 *           type: string
 *           example: To provide world-class healthcare
 *         history:
 *           type: string
 *           example: Established in 1998 with a mission to serve
 *         management:
 *           type: string
 *           example: Managed by a team of senior doctors
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/about-us:
 *   post:
 *     summary: Create About Us details
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visionMission:
 *                 type: string
 *               history:
 *                 type: string
 *               management:
 *                 type: string
 *     responses:
 *       201:
 *         description: About Us created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       400:
 *         description: Validation or creation error
 */
router.post("/", protect, createAboutUs);

/**
 * @swagger
 * /api/about-us:
 *   get:
 *     summary: Get About Us details for logged-in business
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: About Us fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       404:
 *         description: About Us not found
 *       500:
 *         description: Server error
 */
router.get("/", protect, getAboutUs);

/**
 * @swagger
 * /api/about-us:
 *   put:
 *     summary: Update About Us details (upsert supported)
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visionMission:
 *                 type: string
 *               history:
 *                 type: string
 *               management:
 *                 type: string
 *     responses:
 *       200:
 *         description: About Us updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       400:
 *         description: Validation error
 */
router.put("/", protect, updateAboutUs);

/**
 * @swagger
 * /api/about-us:
 *   delete:
 *     summary: Delete About Us details
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: About Us deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: About Us deleted successfully
 *       404:
 *         description: About Us not found
 *       500:
 *         description: Server error
 */
router.delete("/", protect, deleteAboutUs);

/**
 * @swagger
 * /api/about-us/home:
 *   get:
 *     summary: Get home page details
 *     description: Fetches aggregated data required for the home page including doctors, departments, IPD, emergency services, about us, management, gallery, testimonials, and contact details.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Home page details fetched successfully
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
 *                   example: Home page details fetched successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     doctors:
 *                       type: object
 *                       properties:
 *                         departments:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                         list:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               department:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                     ipd:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                           beds:
 *                             type: number
 *                     emergencyAndCriticalCare:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           serviceName:
 *                             type: string
 *                           description:
 *                             type: string
 *                     otherServices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           serviceName:
 *                             type: string
 *                           description:
 *                             type: string
 *                     aboutUs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                     management:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           designation:
 *                             type: string
 *                     gallery:
 *                       type: array
 *                       items:
 *                         type: string
 *                     testimonials:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *                     contactUs:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         _id:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         email:
 *                           type: string
 *                         address:
 *                           type: string
 *       500:
 *         description: Failed to fetch home page details
 */
router.get("/home", protect, getHomePageDetails);

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Hospital image management APIs
 */

/**
 * @swagger
 * /api/about-us/images/logo:
 *   post:
 *     summary: Upload logo image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - logoImage
 *             properties:
 *               logoImage:
 *                 type: string
 *                 example: https://cdn.app/logo.png
 *     responses:
 *       200:
 *         description: Logo image uploaded successfully
 *       400:
 *         description: Validation error
 */

router.post("/images/logo", protect, uploadLogoImage);

/**
 * @swagger
 * /api/about-us/images/hospital:
 *   post:
 *     summary: Upload hospital image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hospitalImage
 *             properties:
 *               hospitalImage:
 *                 type: string
 *                 example: https://cdn.app/hospital.png
 *     responses:
 *       200:
 *         description: Hospital image uploaded successfully
 *       400:
 *         description: Validation error
 */

router.post("/images/hospital", protect, uploadHospitalImage);

/**
 * @swagger
 * /api/about-us/images/cover:
 *   post:
 *     summary: Upload cover page image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coverPage
 *             properties:
 *               coverPage:
 *                 type: string
 *                 example: https://cdn.app/cover.jpg
 *     responses:
 *       200:
 *         description: Cover page uploaded successfully
 *       400:
 *         description: Validation error
 */

router.post("/images/cover", protect, uploadCoverPage);

/**
 * @swagger
 * /api/about-us/images/gallery:
 *   post:
 *     summary: Add a single gallery image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 example: https://cdn.app/gallery1.jpg
 *     responses:
 *       200:
 *         description: Gallery image added successfully
 *       400:
 *         description: Validation error
 */

router.post("/images/gallery", protect, addGalleryImage);

/**
 * @swagger
 * /api/about-us/images/gallery/bulk:
 *   post:
 *     summary: Add multiple gallery images
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - https://cdn.app/gallery1.jpg
 *                   - https://cdn.app/gallery2.jpg
 *     responses:
 *       200:
 *         description: Gallery images added successfully
 *       400:
 *         description: Validation error
 */

router.post("/images/gallery/bulk", protect, addMultipleGalleryImages);

/**
 * @swagger
 * /api/about-us/images/gallery:
 *   delete:
 *     summary: Remove a gallery image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 example: https://cdn.app/gallery1.jpg
 *     responses:
 *       200:
 *         description: Gallery image removed successfully
 *       404:
 *         description: About Us not found
 *       400:
 *         description: Validation error
 */

router.delete("/images/gallery", protect, removeGalleryImage);

/**
 * @swagger
 * /api/about-us/images:
 *   get:
 *     summary: Get all uploaded images
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Images fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logoImage:
 *                   type: string
 *                 hospitalImage:
 *                   type: string
 *                 coverPage:
 *                   type: string
 *                 gallery:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: About Us not found
 *       500:
 *         description: Server error
 */

router.get("/images", protect, getAllImages);

export default router;
