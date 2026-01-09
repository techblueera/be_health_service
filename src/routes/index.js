import express from "express";
import helloRouter from "./hello.route.js";
import categoryRouter from "./category.route.js";
import productRouter from "./product.route.js";
import inventoryRouter from "./inventory.route.js";
import moduleRouter from "./module.route.js";
import serviceRouter from "./service.route.js";
import businessRouter from "./business.route.js";
import businessCatalog from './businessCatalog.route.js';

const router = express.Router();

router.use("/hello", helloRouter);
router.use("/categories", categoryRouter);
router.use("/offerings", productRouter);
router.use("/inventory", inventoryRouter);
router.use("/modules", moduleRouter);
router.use("/services", serviceRouter);
router.use("/businesses", businessRouter);
router.use("/business-catalog", businessCatalog);

export default router;
