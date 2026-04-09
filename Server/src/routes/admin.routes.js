import express from "express";
import { 
    getAllOrders, 
    updateOrderStatus, 
    deleteOrder, 
    getAllProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "../controller/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// All admin routes must be authorized and admin-confirmed
router.use(verifyJWT);
router.use(isAdmin);

// Order Management
router.get("/orders", getAllOrders);
router.patch("/orders/:id", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

// Product/Stock Management
router.get("/products", getAllProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
