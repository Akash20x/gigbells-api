import express from "express";
import portfolioController from "../controllers/portfolioController";
import upload from "../middleware/upload";
import verifyToken from "../middleware/verifyToken";


const router = express.Router();

router.post("/", verifyToken, portfolioController.updateProfile);

router.post("/edit-profile-image", verifyToken, upload, portfolioController.editProfileImage);

router.get("/profile/:username", portfolioController.getPortfolioPreview);

router.get("/", verifyToken, portfolioController.getUserPortfolio);

router.get("/services/:username", portfolioController.getUserServices);

router.post("/add-collection", verifyToken, portfolioController.addCollection);

router.post("/edit-collection", verifyToken, portfolioController.editCollection);

router.post("/delete-collection", verifyToken, portfolioController.deleteCollection);

router.post("/add-card", verifyToken, portfolioController.addCard);

router.post("/edit-card", verifyToken, portfolioController.editCard);

router.post("/delete-card", verifyToken, portfolioController.deleteCard);

router.post("/save-about", verifyToken, portfolioController.saveAbout);

router.post("/add-position", verifyToken, portfolioController.addPosition);

router.post("/delete-position", verifyToken, portfolioController.deletePosition);

router.post("/edit-position", verifyToken, portfolioController.editPosition);

router.post("/add-education", verifyToken, portfolioController.addEducation);

router.post("/delete-education", verifyToken, portfolioController.deleteEducation);

router.post("/edit-education", verifyToken, portfolioController.editEducation);

router.post("/add-service", verifyToken, portfolioController.addService);

router.post("/delete-service", verifyToken, portfolioController.deleteService);

router.post("/edit-service", verifyToken, portfolioController.editService);

router.post("/upload-image", verifyToken, upload, portfolioController.uploadImage);

router.post("/delete-image", verifyToken, portfolioController.deleteImage);






export default router;