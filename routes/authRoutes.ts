import express from "express";
import authController from "../controllers/authController";
import verifyToken from "../middleware/verifyToken";

const router = express.Router();

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get("/profile", verifyToken, authController.getUserInfo);


export default router;