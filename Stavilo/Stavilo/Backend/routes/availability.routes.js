import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isOwner } from "../middlewares/isOwner.js";
import {
  createAvailabilityBlock,
  getOwnerBlocks,
  deleteBlock,
} from "../controllers/availability.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, isOwner, createAvailabilityBlock);
router.get("/", isAuthenticated, isOwner, getOwnerBlocks);
router.delete("/:id", isAuthenticated, isOwner, deleteBlock);

export default router;