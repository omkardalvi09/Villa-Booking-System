import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  toggleFavourite,
  getFavouriteVillas,
} from "../controllers/favourite.controller.js";

const router = express.Router();

router.post("/toggle/:villaId", isAuthenticated, toggleFavourite);
router.get("/", isAuthenticated, getFavouriteVillas);

export default router;