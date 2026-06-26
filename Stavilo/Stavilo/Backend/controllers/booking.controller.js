import Booking from "../models/booking.model.js";
import Room from "../models/room.model.js";
import Villa from "../models/villa.model.js";
import User from "../models/user.model.js";
import transporter from "../config/nodemailer.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import AvailabilityBlock from "../models/availabilityBlock.model.js";

// Calculate total persons
const getTotalPersons = ({ adults = 0, children = 0, infants = 0 }) => {
  return Number(adults) + Number(children) + Number(infants);
};

// ================= EMAIL HELPER =================
const sendBookingEmail = async (booking, subject, title, extraDetails = {}) => {
  try {
    if (!booking.user || !booking.villa) return;

    if (!booking.user.email) {
      booking = await Booking.findById(booking._id).populate("user villa room");
    }

    const owner = await User.findById(booking.villa.owner);

    const recipients = [booking.user.email, owner?.email].filter(Boolean);

    const { oldPersons, oldTotalPrice, isUpdate = false } = extraDetails;
    const priceDifference =
      isUpdate && oldTotalPrice ? booking.totalPrice - oldTotalPrice : 0;

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: recipients.join(","),
      subject,
      html: `
        <h2>${title}</h2>
        <hr/>
        <h3>User Details</h3>
        <p><strong>Name:</strong> ${booking.user?.name || "N/A"}</p>
        <p><strong>Email:</strong> ${booking.user?.email || "N/A"}</p>
        <hr/>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Villa:</strong> ${booking.villa?.villaName || "Villa"}</p>
        <p><strong>Room:</strong> ${booking.room?.roomType || "Entire Villa"}</p>
        <p><strong>Check-in:</strong> ${new Date(
          booking.checkIn,
        ).toDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(
          booking.checkOut,
        ).toDateString()}</p>
        ${
          isUpdate
            ? `
        <h3>Booking Update Details</h3>
        <p><strong>Previous Guests:</strong> ${oldPersons}</p>
        <p><strong>Updated Guests:</strong> ${booking.persons}</p>

        <p><strong>Previous Total Price:</strong> ₹ ${oldTotalPrice}</p>
        <p><strong>Updated Total Price:</strong> ₹ ${booking.totalPrice}</p>

        ${
          priceDifference > 0
            ? `<p style="color: red; font-weight: bold;">
                Price Increased: An additional amount of ₹ ${priceDifference} is payable at the villa.
              </p>`
            : priceDifference < 0
              ? `<p style="color: green; font-weight: bold;">
                    Price Reduced: A refund of ₹ ${Math.abs(priceDifference)} will be provided at the villa.
                  </p>`
              : ""
        }
        `
            : `
        <p><strong>Guests:</strong> ${booking.persons}</p>
        <p><strong>Total Price:</strong> ₹ ${booking.totalPrice}</p>
        `
        }
        <p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Villa Address:</strong> ${booking.villa.villaAddress}</p>
        <p style="color: orange; font-weight: bold;">
          Note: You can update a confirmed booking only once.
        </p>
      `,
    });
  } catch (error) {
    console.log("Email sending failed:", error.message);
  }
};

export const checkAvailability = async ({
  villa,
  room,
  checkInDate,
  checkOutDate,
  excludeBookingId = null,
}) => {
  const dateFilter = {
    villa,
    checkIn: { $lte: new Date(checkOutDate) },
    checkOut: { $gte: new Date(checkInDate) },
    status: { $ne: "cancelled" },
  };

  if (excludeBookingId) {
    dateFilter._id = { $ne: excludeBookingId };
  }

  // WEBSITE BOOKINGS
  const villaBooked = await Booking.findOne({
    ...dateFilter,
    bookingType: "villa",
  });

  if (villaBooked) return false;
  if (room) {
    const roomBooked = await Booking.findOne({
      ...dateFilter,
      room,
      status: { $ne: "cancelled" },
    });

    if (roomBooked) return false;
  }
  if (!room) {
    const roomBookings = await Booking.countDocuments({
      ...dateFilter,
      bookingType: "room",
      status: { $ne: "cancelled" },
    });

    if (roomBookings > 0) return false;
  }

  // MANUAL BLOCKS
  const villaBlocked = await AvailabilityBlock.findOne({
    ...dateFilter,
    rooms: { $size: 0 },
  });

  if (villaBlocked) return false;

  if (room) {
    const roomBlocked = await AvailabilityBlock.findOne({
      ...dateFilter,
      rooms: { $in: [room] },
    });

    if (roomBlocked) return false;
  }

  if (!room) {
    const anyRoomBlocked = await AvailabilityBlock.findOne({
      ...dateFilter,
      rooms: { $exists: true, $ne: [] },
    });

    if (anyRoomBlocked) return false;
  }

  return true;
};

/* ================================
   CHECK ROOM AVAILABILITY API
================================ */
export const checkRoomAvailability = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;

    const roomData = await Room.findById(room).populate("villa");
    if (!roomData) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const isAvailable = await checkAvailability({
      villa: roomData.villa._id,
      room: roomData._id,
      checkInDate,
      checkOutDate,
    });

    res.json({ success: true, isAvailable });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================================
   CHECK VILLA AVAILABILITY API
================================ */
export const checkVillaAvailability = async (req, res) => {
  try {
    const { villa, checkInDate, checkOutDate } = req.body;

    const isAvailable = await checkAvailability({
      villa,
      checkInDate,
      checkOutDate,
    });

    res.json({ success: true, isAvailable });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      bookingId,
      checkInDate,
      checkOutDate,
      adults = 0,
      children = 0,
      infants = 0,
    } = req.body;

    if (!bookingId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Booking ID, check-in and check-out dates are required",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    }).populate("room villa");

    const oldPersons = booking.persons;
    const oldTotalPrice = booking.totalPrice;

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "confirmed" && booking.hasUpdatedAfterConfirm) {
      return res.status(400).json({
        success: false,
        message: "You can update confirmed booking only once",
      });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot update a cancelled booking" });
    }

    const now = new Date();
    const newCheckIn = new Date(checkInDate);
    const newCheckOut = new Date(checkOutDate);
    const checkInDateObj = new Date(booking.checkIn);
    const diffInHours = (checkInDateObj - now) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return res.status(400).json({
        success: false,
        message: "Cannot update booking within 24 hours of check-in",
      });
    }

    if (newCheckIn >= newCheckOut) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date range" });
    }

    if (newCheckIn < new Date(now.toISOString().split("T")[0])) {
      return res.status(400).json({
        success: false,
        message: "Check-in date must be today or in the future",
      });
    }

    if (new Date(booking.checkIn) < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit a booking that has already started",
      });
    }

    const totalPersons = Number(adults) + Number(children) + Number(infants);
    if (totalPersons <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one guest required" });
    }

    let maxGuests = 0;

    if (booking.bookingType === "villa") {
      const villaData = await Villa.findById(booking.villa);
      if (!villaData) {
        return res
          .status(404)
          .json({ success: false, message: "Villa not found" });
      }
      maxGuests = villaData.baseGuests + villaData.extraGuestsAllowed;
    } else {
      const roomData = await Room.findById(booking.room).populate("villa");
      if (!roomData) {
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });
      }
      maxGuests = roomData.guests;
    }

    if (totalPersons > maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxGuests} guests allowed`,
      });
    }

    const isAvailable = await checkAvailability({
      villa: booking.villa._id || booking.villa,
      room:
        booking.bookingType === "room"
          ? booking.room._id || booking.room
          : null,
      checkInDate,
      checkOutDate,
      excludeBookingId: bookingId,
    });

    if (!isAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "Selected dates are not available" });
    }

    let totalPrice = 0;

    if (booking.bookingType === "villa") {
      const villaData = await Villa.findById(booking.villa);
      totalPrice = calculateDynamicPrice({
        pricingModel: villaData.pricingModel,
        basePrice: Number(villaData.price),
        baseGuests: villaData.baseGuests,
        extraGuestsAllowed: villaData.extraGuestsAllowed,
        extraGuestCharge: villaData.extraGuestCharge,
        totalPersons,
        adults,
        children,
        infants,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        discountPercent: villaData.weekDayDiscount || 0,
      }).totalPrice;
    } else {
      const roomData = await Room.findById(booking.room).populate("villa");
      let price = 0;
      for (
        let d = new Date(newCheckIn);
        d < newCheckOut;
        d.setDate(d.getDate() + 1)
      ) {
        const day = d.getDay();
        const isWeekend = day === 0 || day === 6;
        const adultsCost = adults * roomData.pricePerNight;
        const childrenCost = children * (roomData.pricePerNight * 0.5);
        let nightlyPrice = adultsCost + childrenCost;
        if (!isWeekend && roomData.villa.weekDayDiscount > 0) {
          nightlyPrice -= (nightlyPrice * roomData.villa.weekDayDiscount) / 100;
        }
        price += nightlyPrice;
      }
      totalPrice = Math.round(price);
    }

    booking.checkIn = newCheckIn;
    booking.checkOut = newCheckOut;
    booking.adults = Number(adults);
    booking.children = Number(children);
    booking.infants = Number(infants);
    booking.persons = totalPersons;
    booking.totalPrice = totalPrice;

    if (booking.status === "pending" && booking.isPaid) {
      booking.status = "confirmed";
    }

    if (booking.status === "confirmed") {
      booking.hasUpdatedAfterConfirm = true;
    }
    await booking.save();

    const updated = await Booking.findById(bookingId).populate(
      "room rooms villa user",
    );

    await sendBookingEmail(
      updated,
      "Booking Updated Successfully",
      "Your Booking Has Been Updated ✏️",
      {
        oldPersons,
        oldTotalPrice,
        isUpdate: true,
      },
    );

    res.json({
      success: true,
      message: "Booking updated successfully",
      booking: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// -----------DYNAMIC DAY-WISE PRICE CALCULATOR-------------
const calculateDynamicPrice = ({
  pricingModel,
  basePrice,
  baseGuests = 0,
  extraGuestsAllowed = 0,
  extraGuestCharge = 0,
  totalPersons = 0,
  adults = 0,
  children = 0,
  infants = 0,
  checkIn,
  checkOut,
  discountPercent = 0,
}) => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  let totalPrice = 0;
  let totalNights = 0;
  let weekdayNights = 0;

  for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    totalNights++;

    const day = d.getDay();
    const isWeekend = day === 0 || day === 6;

    let nightlyPrice = 0;

    /* =========================
       PER PERSON MODEL
    ========================= */
    if (pricingModel === "per_person") {
      const adultsCost = adults * basePrice;
      const childrenCost = children * (basePrice * 0.5);
      const infantsCost = 0;

      nightlyPrice = adultsCost + childrenCost + infantsCost;
    } else if (pricingModel === "entire_villa") {
      /* =========================
       ENTIRE VILLA MODEL
    ========================= */
      let extraGuests = Math.max(totalPersons - baseGuests, 0);
      const extraCost = extraGuests * extraGuestCharge;
      nightlyPrice = basePrice + extraCost;
    }

    /* =========================
       WEEKDAY DISCOUNT (MON-FRI)
    ========================= */
    if (!isWeekend && discountPercent > 0) {
      nightlyPrice = nightlyPrice - (nightlyPrice * discountPercent) / 100;
      weekdayNights++;
    }
    totalPrice += nightlyPrice;
  }

  return {
    totalPrice: Math.round(totalPrice),
    totalNights,
    weekdayNights,
    discountApplied: weekdayNights > 0,
  };
};

/* ================================
   BOOK ROOM OR ENTIRE VILLA
================================ */
export const bookRoom = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    const {
      room,
      villa,
      checkInDate,
      checkOutDate,
      persons,
      adults = 0,
      children = 0,
      infants = 0,
      paymentMethod,
    } = req.body;

    const totalPersons =
      getTotalPersons({ adults, children, infants }) || Number(persons) || 0;

    if (totalPersons <= 0) {
      return res.status(400).json({
        success: false,
        message: "At least one guest required",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    /* =========================
       ENTIRE VILLA BOOKING
    ========================= */
    if (villa) {
      const rooms = await Room.find({ villa });

      if (!rooms.length) {
        return res.status(400).json({
          success: false,
          message: "No rooms found in this villa",
        });
      }

      const isAvailable = await checkAvailability({
        villa,
        checkInDate,
        checkOutDate,
      });

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: "Villa already booked for selected dates",
        });
      }

      const villaData = await Villa.findById(villa);
      if (!villaData) {
        return res.status(404).json({
          success: false,
          message: "Villa not found",
        });
      }

      const maxGuests = villaData.baseGuests + villaData.extraGuestsAllowed;

      if (totalPersons > maxGuests) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxGuests} guests allowed`,
        });
      }

      const priceResult = calculateDynamicPrice({
        pricingModel: villaData.pricingModel,
        basePrice: Number(villaData.price),
        baseGuests: villaData.baseGuests,
        extraGuestsAllowed: villaData.extraGuestsAllowed,
        extraGuestCharge: villaData.extraGuestCharge,
        totalPersons,
        adults,
        children,
        infants,
        checkIn,
        checkOut,
        discountPercent: villaData.weekDayDiscount || 0,
      });

      const totalPrice = priceResult.totalPrice;

      const booking = await Booking.create({
        user: id,
        villa,
        rooms: rooms.map((r) => r._id),
        bookingType: "villa",
        checkIn,
        checkOut,
        persons: totalPersons,
        adults,
        children,
        infants,
        totalPrice,
        paymentMethod,
        status: "pending",
        isPaid: false,
      });

      // AUTO DELETE IF NOT PAID IN 1 MIN
      setTimeout(
        async () => {
          const latest = await Booking.findById(booking._id);

          if (!latest) return;

          const now = new Date();
          const checkInDate = new Date(latest.checkIn);
          const diffInHours = (checkInDate - now) / (1000 * 60 * 60);

          if (
            !latest.isPaid &&
            latest.status === "pending" &&
            diffInHours > 24
          ) {
            await Booking.findByIdAndDelete(latest._id);
          }
        },
        1 * 60 * 1000,
      );

      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Villa Booking Created",
        html: `
          <h2>Entire Villa Booking Created</h2>
          <p>Your villa is reserved for 1 minute.</p>
          <p>Please complete payment.</p>
        `,
      });

      return res.json({
        success: true,
        message: "Villa booking created. Complete payment.",
        bookingId: booking._id,
      });
    }

    /* =========================
       SINGLE ROOM BOOKING
    ========================= */

    const roomData = await Room.findById(room).populate("villa");

    if (!roomData) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const maxGuests = roomData.guests;

    if (totalPersons > maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxGuests} guests allowed`,
      });
    }

    const isAvailable = await checkAvailability({
      villa: roomData.villa._id,
      room: roomData._id,
      checkInDate,
      checkOutDate,
    });

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Room is already booked for these dates",
      });
    }

    const adultsCost = adults * roomData.pricePerNight;
    const childrenCost = children * (roomData.pricePerNight * 0.5);
    const infantsCost = 0;

    let totalPrice = 0;

    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const isWeekend = day === 0 || day === 6;

      const adultsCost = adults * roomData.pricePerNight;
      const childrenCost = children * (roomData.pricePerNight * 0.5);
      const infantsCost = 0;

      let nightlyPrice = adultsCost + childrenCost + infantsCost;

      if (!isWeekend && roomData.villa.weekDayDiscount > 0) {
        nightlyPrice =
          nightlyPrice - (nightlyPrice * roomData.villa.weekDayDiscount) / 100;
      }

      totalPrice += nightlyPrice;
    }

    const booking = await Booking.create({
      user: id,
      room,
      villa: roomData.villa._id,
      bookingType: "room",
      checkIn,
      checkOut,
      persons: totalPersons,
      adults,
      children,
      infants,
      totalPrice,
      paymentMethod,
      status: "pending",
      isPaid: false,
    });

    setTimeout(
      async () => {
        const latest = await Booking.findById(booking._id);
        if (!latest) return;

        const now = new Date();
        const checkInDate = new Date(latest.checkIn);
        const diffInHours = (checkInDate - now) / (1000 * 60 * 60);

        if (!latest.isPaid && latest.status === "pending" && diffInHours > 24) {
          await Booking.findByIdAndDelete(latest._id);
        }
      },
      1 * 60 * 1000,
    );

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Room Booking Created",
      html: `
        <h2>Room Booking Created</h2>
        <p>Your booking is reserved for 1 minute.</p>
      `,
    });

    res.json({
      success: true,
      message: "Room booking created. Complete payment.",
      bookingId: booking._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================================
   RAZORPAY PAYMENT
================================ */
export const razorpayPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const options = {
      amount: booking.totalPrice * 100, // amount in paise
      currency: "INR",
      receipt: booking._id.toString(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Razorpay order failed" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    const booking =
      await Booking.findById(bookingId).populate("villa room user");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    booking.isPaid = true;
    booking.status = "confirmed";
    booking.paymentMethod = "Razorpay";
    booking.expiresAt = null;

    await booking.save();

    await sendBookingEmail(
      booking,
      "Booking Confirmed - Payment Successful",
      "Payment Successful 🎉",
    );

    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

/* ================================
   USER BOOKINGS
================================ */
export const getUserBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate("room rooms villa")
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
};

/* ================================
   VILLA BOOKINGS (OWNER)
================================ */
export const getVillaBookings = async (req, res) => {
  const villas = await Villa.find({ owner: req.user.id });
  const villaIds = villas.map((v) => v._id);

  const bookings = await Booking.find({ villa: { $in: villaIds } })
    .populate("room rooms villa user")
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
};

export const payAtVilla = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be confirmed",
      });
    }

    booking.paymentMethod = "Pay At Villa";
    booking.status = "confirmed";
    booking.isPaid = false;
    booking.expiresAt = null;

    await booking.save();

    const populatedBooking =
      await Booking.findById(bookingId).populate("villa room user");

    await sendBookingEmail(
      populatedBooking,
      "Booking Confirmed - Pay at Villa",
      "Booking Confirmed 🏡",
    );

    res.json({
      success: true,
      message: "Booking confirmed. Pay at villa.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });
    }

    // Paid bookings cannot be cancelled directly
    if (
      booking.status === "confirmed" &&
      booking.paymentMethod === "Razorpay" &&
      booking.isPaid
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Paid Razorpay bookings cannot be cancelled. Please contact support for refund.",
      });
    }

    // Cannot cancel within 24 hours of check-in
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const diffInHours = (checkInDate - now) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled within 24 hours of check-in",
      });
    }

    //  Cancel booking
    booking.status = "cancelled";
    booking.isPaid = false;

    await booking.save();

    const populatedBooking =
      await Booking.findById(bookingId).populate("villa room user");

    await sendBookingEmail(
      populatedBooking,
      "Booking Cancelled",
      "Booking Cancelled ❌",
    );

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================================
   PREVIEW DYNAMIC PRICE
================================ */
export const previewBookingPrice = async (req, res) => {
  try {
    const {
      villa,
      room,
      checkInDate,
      checkOutDate,
      persons,
      adults = 0,
      children = 0,
      infants = 0,
    } = req.body;

    const totalPersons = getTotalPersons({ adults, children, infants });

    if (!checkInDate || !checkOutDate || totalPersons === 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: "Invalid date selection",
      });
    }

    let villaData;
    let basePrice = 0;
    let villaId;

    // ===== VILLA BOOKING =====
    if (villa) {
      villaData = await Villa.findById(villa);
      if (!villaData)
        return res
          .status(404)
          .json({ success: false, message: "Villa not found" });

      basePrice = Number(villaData.price);
      villaId = villaData._id;
    }

    // ===== ROOM BOOKING =====
    if (room) {
      const roomData = await Room.findById(room).populate("villa");
      if (!roomData)
        return res
          .status(404)
          .json({ success: false, message: "Room not found" });

      basePrice = roomData.pricePerNight;
      villaId = roomData.villa._id;
      villaData = roomData.villa;
    }

    // ===== CHECK AVAILABILITY =====
    const isAvailable = await checkAvailability({
      villa: villaId,
      room: room || null,
      checkInDate,
      checkOutDate,
    });

    if (!isAvailable) {
      return res.json({
        success: true,
        isAvailable: false,
      });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    let totalPrice = 0;

    if (room) {
      let totalPriceCalc = 0;
      let discountAmount = 0;

      for (
        let d = new Date(checkIn);
        d < checkOut;
        d.setDate(d.getDate() + 1)
      ) {
        const day = d.getDay();
        const isWeekend = day === 0 || day === 6;

        const adultsCost = adults * basePrice;
        const childrenCost = children * (basePrice * 0.5);

        let nightlyPrice = adultsCost + childrenCost;

        if (!isWeekend && villaData.weekDayDiscount > 0) {
          const discount = (nightlyPrice * villaData.weekDayDiscount) / 100;
          nightlyPrice -= discount;
          discountAmount += discount;
        }

        totalPriceCalc += nightlyPrice;
      }

      totalPrice = Math.round(totalPriceCalc);
    } else {
      const priceResult = calculateDynamicPrice({
        pricingModel: villaData.pricingModel,
        basePrice: Number(villaData.price),
        baseGuests: villaData.baseGuests,
        extraGuestsAllowed: villaData.extraGuestsAllowed,
        extraGuestCharge: villaData.extraGuestCharge,
        totalPersons,
        adults,
        children,
        infants,
        checkIn,
        checkOut,
        discountPercent: villaData.weekDayDiscount || 0,
      });

      totalPrice = priceResult.totalPrice;
    }

    let originalPrice = 0;

    if (villaData.pricingModel === "per_person") {
      originalPrice = basePrice * villaData.baseGuests * nights;
    } else {
      const extraGuests = Math.max(totalPersons - villaData.baseGuests, 0);
      const extraCostPerNight = extraGuests * villaData.extraGuestCharge;

      originalPrice = (basePrice + extraCostPerNight) * nights;
    }

    const discountPercent = villaData.weekDayDiscount || 0;

    let discountAmount = 0;

    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      const isWeekend = day === 0 || day === 6;

      let nightlyPrice = 0;

      if (villaData.pricingModel === "per_person") {
        const adultsCost = adults * basePrice;
        const childrenCost = children * (basePrice * 0.5);
        nightlyPrice = adultsCost + childrenCost;
      } else {
        const extraGuests = Math.max(totalPersons - villaData.baseGuests, 0);
        const extraCost = extraGuests * villaData.extraGuestCharge;

        nightlyPrice = basePrice + extraCost;
      }

      if (!isWeekend && villaData.weekDayDiscount > 0) {
        const discount = (nightlyPrice * villaData.weekDayDiscount) / 100;
        discountAmount += discount;
      }
    }
    return res.json({
      success: true,
      isAvailable: true,
      priceDetails: {
        persons: totalPersons,
        nights,
        pricingModel: villaData.pricingModel,
        basePrice,
        baseGuests: villaData.baseGuests,
        extraGuestCharge: villaData.extraGuestCharge,
        adults,
        children,
        infants,
        adultsCost: adults * basePrice * nights,
        childrenCost: children * (basePrice * 0.5) * nights,
        infantsCost: 0,
        discountPercent,
        discountAmount,
        totalPrice,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================
   OWNER EARNINGS API
====================================== */

export const getOwnerEarnings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { startDate, endDate } = req.query;

    // ===== OWNER VILLAS =====
    const ownerVillas = await Villa.find({ owner: ownerId }).select("_id");

    if (!ownerVillas.length) {
      return res.json({
        success: true,
        earnings: [],
        stats: {
          totalBookings: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
        },
      });
    }

    const ownerVillaIds = ownerVillas.map((v) => v._id);

    // ===== MATCH FILTER =====
    let matchStage = {
      villa: { $in: ownerVillaIds },
    };

    if (startDate && endDate) {
      matchStage.$and = [
        { checkIn: { $lte: new Date(endDate) } },
        { checkOut: { $gte: new Date(startDate) } },
      ];
    }

    // ===== SINGLE OPTIMIZED AGGREGATION =====
    const result = await Booking.aggregate([
      { $match: matchStage },

      {
        $facet: {
          /* =====================
             EARNINGS PER VILLA
          ===================== */
          earnings: [
            { $match: { status: "confirmed" } },

            {
              $lookup: {
                from: "villas",
                localField: "villa",
                foreignField: "_id",
                as: "villaData",
              },
            },
            { $unwind: "$villaData" },

            {
              $group: {
                _id: "$villaData.villaName",
                totalEarnings: { $sum: "$totalPrice" },
                totalBookings: { $sum: 1 },
              },
            },

            { $sort: { totalEarnings: -1 } },
          ],

          /* =====================
             BOOKING STATS
          ===================== */
          stats: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // ===== FORMAT STATS =====
    const statsData = result[0].stats || [];

    const stats = {
      totalBookings: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
    };

    statsData.forEach((s) => {
      stats.totalBookings += s.count;

      if (s._id === "confirmed") stats.confirmed = s.count;
      if (s._id === "pending") stats.pending = s.count;
      if (s._id === "cancelled") stats.cancelled = s.count;
    });

    return res.json({
      success: true,
      earnings: result[0].earnings || [],
      stats,
    });
  } catch (error) {
    console.error("Owner Earnings Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
