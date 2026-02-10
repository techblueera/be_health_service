import express from "express";
import helloRouter from "./hello.route.js";
import categoryRouter from "./category.route.js";
import productRouter from "./product.route.js";
import inventoryRouter from "./inventory.route.js";
import orderRouter from "./order.route.js";
import authRouter from "./auth.route.js"
const router = express.Router();

router.use("/hello", helloRouter);
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/inventory", inventoryRouter);
router.use("/orders", orderRouter);
router.use("/auth", authRouter)

export default router;
