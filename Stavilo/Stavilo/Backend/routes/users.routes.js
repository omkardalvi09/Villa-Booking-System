import express from "express";
import {
  isAuth,
  login,
  logout,
  signup,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const userRouter = express.Router();

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/is-auth", isAuthenticated, isAuth);
userRouter.get("/logout", isAuthenticated, logout);

export default userRouter;
