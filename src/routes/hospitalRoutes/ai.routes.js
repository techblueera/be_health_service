import express from 'express';
import { saveHospitalData } from '../../controllers/hospitalControllers/ai.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/hospital-data/save:
 *   post:
 *     summary: Save complete hospital master data
 *     description: >
 *       Saves or updates complete hospital data including About Us, Contact,
 *       OPD Doctors, IPD Wards, Emergency Services, Facilities, and Careers.
 *       Business ID is resolved from the authenticated user token.
 *     tags:
 *       - Hospital Data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 description: Hospital configuration payload
 *                 properties:
 *
 *                   ABOUT_US:
 *                     type: object
 *                     properties:
 *                       HISTORY:
 *                         type: string
 *                       MISSION_AND_VISION:
 *                         type: string
 *                       TEAM:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             designation:
 *                               type: string
 *                             photo:
 *                               type: string
 *                               format: uri
 *
 *                   CONTACT_US:
 *                     type: object
 *                     properties:
 *                       address:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       phone:
 *                         type: string
 *                       emergencyPhone:
 *                         type: string
 *                       website:
 *                         type: string
 *                         format: uri
 *
 *                   OPT_OUTPATIENT_DEPARTMENT:
 *                     type: object
 *                     description: Dynamic OPD department map
 *                     additionalProperties:
 *                       type: object
 *                       properties:
 *                         description:
 *                           type: string
 *                         doctors:
 *                           type: array
 *                           items:
 *                             type: string
 *                         timing:
 *                           type: string
 *
 *                   IPD_INPATIENT_DEPARTMENT:
 *                     type: object
 *                     description: IPD ward configuration
 *                     additionalProperties:
 *                       type: object
 *                       properties:
 *                         bedCount:
 *                           type: string
 *                         charges:
 *                           type: string
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *
 *                   EMERGENCY_AND_CRITICAL_CARE:
 *                     type: object
 *                     description: Emergency & ICU services
 *                     additionalProperties:
 *                       type: object
 *                       properties:
 *                         description:
 *                           type: string
 *
 *                   OTHER_FACILITIES:
 *                     type: object
 *                     additionalProperties:
 *                       type: object
 *                       properties:
 *                         description:
 *                           type: string
 *
 *                   CAREER:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         position:
 *                           type: string
 *                         department:
 *                           type: string
 *                         qualification:
 *                           type: string
 *
 *           example:
 *             data:
 *               ABOUT_US:
 *                 HISTORY: "Established in 2015..."
 *                 MISSION_AND_VISION: "Providing quality healthcare"
 *                 TEAM:
 *                   - name: "Dr. Rajesh Sharma"
 *                     designation: "Medical Director"
 *                     photo: "https://example.com/photo.jpg"
 *               CONTACT_US:
 *                 address: "Sagar Road, Raisen"
 *                 email: "info@hospital.com"
 *                 phone: "+91 9999999999"
 *                 emergencyPhone: "+91 8888888888"
 *                 website: "http://hospital.com"
 *               OPT_OUTPATIENT_DEPARTMENT:
 *                 GENERAL_MEDICINE:
 *                   description: "Comprehensive care"
 *                   doctors:
 *                     - "Dr. A"
 *                     - "Dr. B"
 *                   timing: "10 AM - 4 PM"
 *               IPD_INPATIENT_DEPARTMENT:
 *                 GENERAL_WARD:
 *                   bedCount: "30"
 *                   charges: "₹800 per day"
 *               EMERGENCY_AND_CRITICAL_CARE:
 *                 ICU_INTENSIVE_CARE_UNIT:
 *                   description: "24x7 ICU care"
 *               OTHER_FACILITIES:
 *                 AMBULANCE:
 *                   description: "24x7 ambulance"
 *               CAREER:
 *                 - position: "Staff Nurse"
 *                   department: "Nursing"
 *                   qualification: "B.Sc Nursing"
 *
 *     responses:
 *       200:
 *         description: Hospital data saved successfully
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
 *                   example: Hospital data saved successfully
 *
 *       500:
 *         description: Failed to save hospital data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/save', protect, saveHospitalData);

export default router;