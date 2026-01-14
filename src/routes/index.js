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
export default router;
