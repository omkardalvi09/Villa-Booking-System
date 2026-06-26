import mongoose from "mongoose";

const availabilityBlockSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    villa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villa",
      required: true,
    },

    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      enum: [
        "offline",
        "booking.com",
        "airbnb",
        "maintenance",
        "personal",
        "other",
      ],
      default: "offline",
    },
  },
  { timestamps: true }
);


availabilityBlockSchema.index(
  { villa: 1, checkIn: 1, checkOut: 1 },
  { name: "villa_date_overlap_index" }
);

const AvailabilityBlock = mongoose.model(
  "AvailabilityBlock",
  availabilityBlockSchema
);

export default AvailabilityBlock;