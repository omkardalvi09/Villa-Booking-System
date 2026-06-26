import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  addReview,
  getReviews,
  getUserReview,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/:villaId", isAuthenticated, addReview);
router.get("/:villaId", getReviews);
router.get("/user/:villaId", isAuthenticated, getUserReview);

router.post("/room/:roomId", isAuthenticated, addReview);
router.get("/room/:roomId", getReviews);
router.get("/room/user/:roomId", isAuthenticated, getUserReview);

export default router;
