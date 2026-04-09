import { Router } from "express";
import { registerUser, loginUser, logoutUser, getAllUsers, getCurrentUser } from "../controller/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/users", getAllUsers);
router.get("/profile", verifyJWT, getCurrentUser);

export default router;
