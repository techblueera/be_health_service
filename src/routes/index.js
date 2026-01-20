import express from "express";
import aboutUsRoutes from "./hospitalRoutes/aboutUs.routes.js";
import bedRoutes from "./hospitalRoutes/bed.routes.js";
import branchRoutes from "./hospitalRoutes/branch.routes.js";
import careerRoutes from "./hospitalRoutes/career.routes.js";
import contactRoutes from "./hospitalRoutes/contact.routes.js";
import departmentRoutes from "./hospitalRoutes/department.routes.js";
import doctorRoutes from "./hospitalRoutes/doctor.routes.js";
import emergencyServiceRoutes from "./hospitalRoutes/emergencyService.routes.js";
import facilityRoutes from "./hospitalRoutes/facility.routes.js";
import wardRoutes from "./hospitalRoutes/ward.routes.js";
import aiRoutes from "./hospitalRoutes/ai.routes.js";
import authRouter from "./hospitalRoutes/auth.route.js";
import uploadRoutes from "./upload.routes.js"
import testimonialRoutes from './hospitalRoutes/testimonial.routes.js'

const router = express.Router();

router.use("/about-us", aboutUsRoutes);
router.use("/beds", bedRoutes);
router.use("/branches", branchRoutes);
router.use("/careers", careerRoutes);
router.use("/departments", departmentRoutes);
router.use("/doctors", doctorRoutes);
router.use("/wards", wardRoutes);
router.use("/emergency-services", emergencyServiceRoutes);
router.use("/facilities", facilityRoutes);
router.use("/contact", contactRoutes);
router.use("/hospital-data", aiRoutes);
router.use("/auth", authRouter);
router.use("/upload", uploadRoutes)
router.use('/testimonials', testimonialRoutes)

export default router;
