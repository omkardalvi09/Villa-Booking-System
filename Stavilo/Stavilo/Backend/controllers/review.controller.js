import Review from "../models/review.model.js";

// ================= ADD REVIEW =================
export const addReview = async (req, res) => {
  const { villaId, roomId } = req.params;
  const { text, rating } = req.body;

  try {
    const filter = {
      user: req.user.id,
      villa: villaId || null,
      room: roomId || null,
    };

    const update = { text, rating };

    const review = await Review.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      review,
      message: "Review submitted/updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

export const getReviews = async (req, res) => {
  const { villaId, roomId } = req.params;

  try {
    const filter = roomId ? { room: roomId } : { villa: villaId, room: null };

    const reviews = await Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// ================= GET REVIEWS BY VILLA =================
export const getVillaReviews = async (req, res) => {
  const { villaId } = req.params;

  try {
    const reviews = await Review.find({ villa: villaId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews" });
  }
};

// ================= GET REVIEW BY USER =================
export const getUserReview = async (req, res) => {
  const { villaId, roomId } = req.params;

  try {
    const review = await Review.findOne({
      user: req.user.id,
      villa: villaId || null,
      room: roomId || null,
    });

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user review",
    });
  }
};
