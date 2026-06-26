import AvailabilityBlock from "../models/availabilityBlock.model.js";
import Villa from "../models/villa.model.js";
import Booking from "../models/booking.model.js";

export const createAvailabilityBlock = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const { villa, rooms, checkIn, checkOut, reason, source } = req.body;

    /* ================= OWNER VALIDATION ================= */
    const villaData = await Villa.findById(villa);

    if (!villaData || villaData.owner.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    /* ================= COMMON DATE OVERLAP FILTER ================= */
    const overlapFilter = {
      villa,
      checkIn: { $lte: checkOutDate },
      checkOut: { $gte: checkInDate },
    };

    /* ================= CHECK EXISTING BLOCK ================= */
    let blockFilter = { ...overlapFilter };

    if (rooms && rooms.length > 0) {
      blockFilter.rooms = { $in: rooms };
    }

    const existingBlock = await AvailabilityBlock.findOne(blockFilter);

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: "Selected dates already blocked",
      });
    }

    /* ================= CHECK EXISTING BOOKING ================= */
    let bookingFilter = {
      ...overlapFilter,
      status: { $ne: "cancelled" },
    };

    if (rooms && rooms.length > 0) {
      bookingFilter.$or = [{ room: { $in: rooms } }, { bookingType: "villa" }];
    } else {
      bookingFilter.$or = [{ bookingType: "villa" }, { bookingType: "room" }];
    }

    const existingBooking = await Booking.findOne(bookingFilter);

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Booking already exists for selected dates",
      });
    }

    const block = await AvailabilityBlock.create({
      owner: ownerId,
      villa,
      rooms: rooms && rooms.length > 0 ? rooms : [],
      checkIn: checkInDate,
      checkOut: checkOutDate,
      reason,
      source,
    });

    res.json({
      success: true,
      message: "Dates blocked successfully",
      block,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getOwnerBlocks = async (req, res) => {
  const blocks = await AvailabilityBlock.find({
    owner: req.user.id,
  })
    .populate("villa", "villaName")
    .populate("rooms")
    .sort({ createdAt: -1 });

  res.json({ success: true, blocks });
};

export const deleteBlock = async (req, res) => {
  await AvailabilityBlock.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Block removed",
  });
};
