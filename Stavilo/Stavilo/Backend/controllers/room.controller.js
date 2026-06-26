import Room from "../models/room.model.js";
import Booking from "../models/booking.model.js";
import Villa from "../models/villa.model.js";
import cloudinary from "../config/cloudinary.js";

// add a new Room
export const addRoom = async (req, res) => {
  try {
    const {
      roomType,
      villa,
      guests,
      pricePerNight,
      description,
      amenities,
      isAvailable,
      meals,
    } = req.body;
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "rooms",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              },
            )
            .end(file.buffer);
        });
      });

      imageUrls = await Promise.all(uploads);
    }
    const mealsData = meals ? JSON.parse(meals) : {};
    const newRoom = await Room.create({
      roomType,
      villa,
      guests,
      pricePerNight,
      description,
      amenities,
      isAvailable,
      meals: mealsData,
      images: imageUrls,
    });

    await Villa.findByIdAndUpdate(villa, {
      $inc: { totalRooms: 1 },
    });

    return res
      .status(201)
      .json({ message: "Room added successfully", success: true });
  } catch (error) {
    console.error("ADD ROOM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all rooms for a specific owner
export const getOwnerRooms = async (req, res) => {
  try {
    const { id } = req.user;

    const rooms = await Room.find().populate({
      path: "villa",
      select: "villaName villaAddress rating amenities owner villaContactNo",
    });

    const ownerRooms = rooms.filter(
      (room) => room.villa && room.villa.owner.toString() === id,
    );

    return res.status(200).json({
      success: true,
      rooms: ownerRooms,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all rooms for USers
export const getAllRooms = async (req, res) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const skip = (page - 1) * limit;

    const totalRooms = await Room.countDocuments();

    const rooms = await Room.find()
      .populate({
        path: "villa",
        select: "villaName villaAddress amenities rating owner villaContactNo",
        populate: { path: "owner", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      rooms,
      pagination: {
        hasMore: page * limit < totalRooms,
        currentPage: Number(page),
        totalRooms,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    await Room.findByIdAndDelete(roomId);

    await Villa.findByIdAndUpdate(room.villa, {
      $inc: { totalRooms: -1 },
    });

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= MOST POPULAR ROOMS =================
export const getPopularRooms = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const popularRooms = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "cancelled" },
          room: { $ne: null }, // only room bookings
        },
      },
      {
        $group: {
          _id: "$room",
          totalBookings: { $sum: 1 },
          lastBookingAt: { $max: "$createdAt" },
        },
      },
      {
        $sort: {
          totalBookings: -1,
          lastBookingAt: -1,
        },
      },
      { $limit: 4 },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "_id",
          as: "room",
        },
      },
      { $unwind: "$room" },
      {
        $lookup: {
          from: "villas",
          localField: "room.villa",
          foreignField: "_id",
          as: "villa",
        },
      },
      { $unwind: "$villa" },
    ]);

    res.status(200).json({
      success: true,
      rooms: popularRooms.map((r) => ({
        ...r.room,
        villa: r.villa,
        totalBookings: r.totalBookings,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular rooms",
    });
  }
};

// ================= UPDATE ROOM =================
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRoom = await Room.findById(id);
    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    let existingImagesFromClient = [];
    try {
      existingImagesFromClient = req.body.existingImages
        ? JSON.parse(req.body.existingImages)
        : [];
    } catch {
      existingImagesFromClient = [];
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "rooms",
                transformation: [
                  { width: 1200, crop: "limit" },
                  { quality: "auto" },
                  { fetch_format: "auto" },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              },
            )
            .end(file.buffer);
        });
      });

      newImages = await Promise.all(uploads);
    }

    const finalImages = [...existingImagesFromClient, ...newImages];

    const mealsData = req.body.meals
      ? JSON.parse(req.body.meals)
      : existingRoom.meals;

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        ...req.body,
        meals: mealsData,
        images: finalImages,
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};
