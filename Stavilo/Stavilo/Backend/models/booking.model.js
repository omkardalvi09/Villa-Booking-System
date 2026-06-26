import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    villa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villa",
      required: true,
    },

    // SINGLE ROOM BOOKING
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },

    // ENTIRE VILLA BOOKING
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],

    bookingType: {
      type: String,
      enum: ["room", "villa"],
      default: "room",
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    persons: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "Pay At Villa",
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "expired", "cancelled"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    hasUpdatedAfterConfirm: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/* ======================================================
   INDEXES
====================================================== */

// TTL INDEX — Auto delete expired unpaid bookings
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent double booking at villa level
bookingSchema.index({
  villa: 1,
  checkIn: 1,
  checkOut: 1,
});

bookingSchema.index({ villa: 1, status: 1, createdAt: 1 });

bookingSchema.index({ user: 1, createdAt: -1 });

bookingSchema.index({ villa: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
