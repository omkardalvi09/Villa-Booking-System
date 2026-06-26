import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "owner"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },

    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Villa",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
