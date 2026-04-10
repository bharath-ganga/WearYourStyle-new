import { Router } from "express";
import { placeOrder, getMyOrders, getOrderById, cancelOrder } from "../controller/order.controller.js";

const router = Router();

router.route("/place").post(placeOrder);
router.route("/my-orders").get(getMyOrders);
router.route("/cancel/:id").patch(cancelOrder);
router.route("/:id").get(getOrderById);

export default router;
