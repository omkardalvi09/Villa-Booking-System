import User from "../models/user.model.js";

// ================= TOGGLE FAVOURITE =================
export const toggleFavourite = async (req, res) => {
  const { id } = req.user;
  const { villaId } = req.params;

  try {
    const user = await User.findById(id);

    const isFav = user.favourites.includes(villaId);

    if (isFav) {
      user.favourites.pull(villaId);
    } else {
      user.favourites.push(villaId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isFav
        ? "Removed from favourites"
        : "Added to favourites",
      favourites: user.favourites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ================= GET FAVOURITE VILLAS =================
export const getFavouriteVillas = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id).populate("favourites");

    res.status(200).json({
      success: true,
      villas: user.favourites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};