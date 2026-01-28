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

import categoryRoutes from './pharmacyRoutes/category.routes.js'
import orderRoutes from './pharmacyRoutes/order.route.js'
import productRoutes from './pharmacyRoutes/product.routes.js'
import productVariantRoutes from './pharmacyRoutes/productVariant.routes.js'

const router = express.Router();

router.use("/auth", authRouter);

router.use("/hp/about-us", aboutUsRoutes);
router.use("/hp/beds", bedRoutes);
router.use("/hp/branches", branchRoutes);
router.use("/hp/careers", careerRoutes);
router.use("/hp/departments", departmentRoutes);
router.use("/hp/doctors", doctorRoutes);
router.use("/hp/wards", wardRoutes);
router.use("/hp/emergency-services", emergencyServiceRoutes);
router.use("/hp/facilities", facilityRoutes);
router.use("/hp/contact", contactRoutes);
router.use("/hp/hospital-data", aiRoutes);
router.use('/hp/testimonials', testimonialRoutes)

router.use('/ms/categories', categoryRoutes);
router.use('/ms/orders', orderRoutes);
router.use('/ms/products', productRoutes);
router.use('/ms/product-variants', productVariantRoutes)

router.use("/upload", uploadRoutes)
export default router;
