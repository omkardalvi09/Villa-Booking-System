import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isOwner } from "../middlewares/isOwner.js";
import {
  bookRoom,
  checkRoomAvailability,
  checkVillaAvailability,
  updateBooking,
  getUserBookings,
  getVillaBookings,
  payAtVilla,
  cancelBooking,
  razorpayPayment,
  verifyRazorpayPayment,
  previewBookingPrice,
  getOwnerEarnings,
} from "../controllers/booking.controller.js";
const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkRoomAvailability);
bookingRouter.post("/check-villa-availability", checkVillaAvailability);
bookingRouter.post("/book", isAuthenticated, bookRoom);
bookingRouter.post("/update", isAuthenticated, updateBooking);
bookingRouter.get("/user", isAuthenticated, getUserBookings);
bookingRouter.get("/villa", isAuthenticated, isOwner, getVillaBookings);
bookingRouter.post("/pay-at-villa", isAuthenticated, payAtVilla);
bookingRouter.post("/cancel", isAuthenticated, cancelBooking);
bookingRouter.post("/razorpay-order", isAuthenticated, razorpayPayment);
bookingRouter.post("/razorpay-verify", isAuthenticated, verifyRazorpayPayment);
bookingRouter.post("/preview-price", previewBookingPrice);
bookingRouter.get("/owner/earnings", isAuthenticated, isOwner, getOwnerEarnings);

export default bookingRouter;