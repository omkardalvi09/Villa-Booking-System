import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connect } from "mongoose";
import { connectDB } from "./config/connectDB.js";

import userRouter from "./routes/users.routes.js";
import villaRouter from "./routes/villa.routes.js";
import roomRouter from "./routes/room.routes.js";
import bookingRouter from "./routes/booking.routes.js";
import reviewRouter from "./routes/review.routes.js";
import favouriteRouter from "./routes/favourite.routes.js";
import availabilityRouter from "./routes/availability.routes.js";

dotenv.config();

const app = express();

// DataBase Connection
connectDB();

//Middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

// API EndPoints OR Routes
app.get("/", (req, res) => {
  res.send("hello world from server");
});

//app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/villa", villaRouter);
app.use("/api/room", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/favourites", favouriteRouter);
app.use("/api/availability", availabilityRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
