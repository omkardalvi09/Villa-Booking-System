import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "../config/nodemailer.js";

// Signup Function
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.json({ message: "all fields are required", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "user already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();
    return res.json({ message: "account created successfully", success: true });
  } catch (error) {
    return res.json({ message: "internal server error", success: false });
  }
};

// Login Function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "all fields are required", success: false });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "invalid password", success: false });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRECT,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({ message: "login successful", success: true, user });
  } catch (error) {
    return res.json({ message: "internal server error", success: false });
  }
};

// Logout Function
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "logout successful", success: true });
  } catch (error) {
    return res.json({ message: "internal server error", success: false });
  }
};

// is-Auth Function
export const isAuth = async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id).select("-password");
  try {
    res.json({ success: true, user });
  } catch (error) {
    return res.json({ message: "internal server error", success: false });
  }
};



export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset your Stavilo password",
      html: `
        <h2>Password Reset</h2>
        <hr/>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <p>
          <a href="${resetUrl}" target="_blank">
            Reset Password
          </a>
        </p>
        <p>This link will expire in <strong>10 minutes</strong>.</p>
        <br/>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>— Stavilo Team ❤️</p>
      `,
    });

    return res.json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Email could not be sent" });
  }
};


export const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.json({ success: false, message: "Invalid or expired token" });
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.json({ success: true, message: "Password updated successfully" });
};