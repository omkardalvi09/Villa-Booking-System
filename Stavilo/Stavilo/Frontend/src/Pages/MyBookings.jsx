import { useContext, useEffect, useState } from "react";
import { MapPin, Users, CheckCircle, Clock, XCircle } from "lucide-react";
import { AppContext } from "../Context/AppContext.jsx";
import toast from "react-hot-toast";
import GuestSelector from "../Components/GuestSelector";

function MyBookings() {
  const [cancellingId, setCancellingId] = useState(null);
  const [payAtVillaLoadingId, setPayAtVillaLoadingId] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [updatingId, setUpdatingId] = useState(null);
  const { axios } = useContext(AppContext);
  const [bookingData, setBookingData] = useState([]);
  const [maxGuests, setMaxGuests] = useState(1);

  // ================= FETCH BOOKINGS =================
  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/user");
      if (data.success) {
        setBookingData(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ================= PAY NOW (RAZORPAY) =================
  const handlePayment = async (bookingId) => {
    try {
      const { data } = await axios.post("/api/bookings/razorpay-order", {
        bookingId,
      });

      if (!data.success) {
        toast.error("Failed to create order");
        return;
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        order_id: data.order.id,
        name: "Villa Booking",
        description: "Complete your booking payment",

        handler: async function (response) {
          const verifyRes = await axios.post("/api/bookings/razorpay-verify", {
            ...response,
            bookingId,
          });

          if (verifyRes.data.success) {
            toast.success("Payment Successful!");
            fetchMyBookings();
          } else {
            toast.error("Payment verification failed");
          }
        },

        prefill: {
          name: "Guest",
        },

        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ================= PAY AT VILLA =================
  const handlePayAtVilla = async (bookingId) => {
    setPayAtVillaLoadingId(bookingId);
    try {
      const { data } = await axios.post("/api/bookings/pay-at-villa", {
        bookingId,
      });

      if (data.success) {
        toast.success(data.message);
        fetchMyBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPayAtVillaLoadingId(null);
    }
  };

  // ================= CANCEL BOOKING =================
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmCancel) return;

    setCancellingId(bookingId);

    try {
      const { data } = await axios.post("/api/bookings/cancel", {
        bookingId,
      });

      if (data.success) {
        toast.success("Booking cancelled successfully");
        fetchMyBookings();
      } else {
        toast.error(data.message);
        setCancellingId(null);
      }
    } catch (error) {
      toast.error(error.message);
      setCancellingId(null);
    }
  };

  const getCancelButtonText = (booking) => {
    if (booking.paymentMethod === "Razorpay") {
      return "Cancel & Refund";
    }
    return "Cancel Booking";
  };

  // ================= EFFECT =================
  useEffect(() => {
    fetchMyBookings();
    const interval = setInterval(fetchMyBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusTextColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "pending":
        return Clock;
      case "cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };
  const canCancelBooking = (booking) => {
    if (booking.status === "cancelled") return false;

    // if (booking.status === "confirmed" && booking.paymentMethod === "Razorpay") {
    //   return false;
    // }

    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const diffInHours = (checkIn - now) / (1000 * 60 * 60);

    return diffInHours >= 24;
  };

  const canEditBooking = (booking) => {
    if (booking.status === "cancelled") return false;
    if (booking.status === "confirmed") {
      return !booking.hasUpdatedAfterConfirm;
    }
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const diffInHours = (checkIn - now) / (1000 * 60 * 60);
    return diffInHours >= 24;
  };

  const openEditForm = (booking) => {
    setEditingBookingId(booking._id);
    setEditFormData({
      checkIn: new Date(booking.checkIn).toISOString().slice(0, 10),
      checkOut: new Date(booking.checkOut).toISOString().slice(0, 10),
      adults: booking.adults || booking.persons || 1,
      children: booking.children || 0,
      infants: booking.infants || 0,
      baseGuests: booking.villa?.baseGuests || 1,
    });

    if (booking.bookingType === "villa") {
      const base = booking.villa?.baseGuests || 0;
      const extra = booking.villa?.extraGuestsAllowed || 0;
      setMaxGuests(base + extra);
    } else {
      setMaxGuests(booking.room?.guests || 1);
    }
  };

  const closeEditForm = () => {
    setEditingBookingId(null);
    setEditFormData({
      checkIn: "",
      checkOut: "",
      adults: 1,
      children: 0,
      infants: 0,
    });
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateBooking = async (bookingId) => {
    if (!bookingId) return;

    if (!editFormData.checkIn || !editFormData.checkOut) {
      toast.error("Please enter both check-in and check-out dates");
      return;
    }

    const checkInDate = new Date(editFormData.checkIn);
    const checkOutDate = new Date(editFormData.checkOut);
    const today = new Date(new Date().toISOString().slice(0, 10));

    if (checkInDate >= checkOutDate) {
      toast.error("Check-in must be before check-out");
      return;
    }

    if (checkInDate < today) {
      toast.error("Check-in date cannot be before today");
      return;
    }

    const adults = Number(editFormData.adults);
    const children = Number(editFormData.children);
    const infants = Number(editFormData.infants);
    const totalGuests = adults + children + infants;

    if (totalGuests < 1) {
      toast.error("At least one guest is required");
      return;
    }

    setUpdatingId(bookingId);

    try {
      const { data } = await axios.post("/api/bookings/update", {
        bookingId,
        checkInDate: editFormData.checkIn,
        checkOutDate: editFormData.checkOut,
        adults,
        children,
        infants,
      });

      if (data.success) {
        toast.success(data.message || "Booking updated successfully");
        fetchMyBookings();
        closeEditForm();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen text-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
          <p className="text-white/80 text-lg">
            View and manage your reservations
          </p>
        </div>

        {editingBookingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-[#121212] p-6 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">Update Booking</h2>

              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm text-gray-300">Check-in date</label>
                <input
                  type="date"
                  value={editFormData.checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    handleEditInputChange("checkIn", e.target.value)
                  }
                  className="rounded-md border border-gray-600 bg-[#1E1E1E] p-2 text-white"
                />

                <label className="text-sm text-gray-300">Check-out date</label>
                <input
                  type="date"
                  value={editFormData.checkOut}
                  min={editFormData.checkIn}
                  onChange={(e) =>
                    handleEditInputChange("checkOut", e.target.value)
                  }
                  className="rounded-md border border-gray-600 bg-[#1E1E1E] p-2 text-white"
                />

                <GuestSelector
                  bookingData={editFormData}
                  setBookingData={setEditFormData}
                  maxGuests={maxGuests}
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={closeEditForm}
                  className="rounded-md border border-gray-600 px-3 py-2 text-gray-200 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateBooking(editingBookingId)}
                  disabled={updatingId === editingBookingId}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:bg-gray-500"
                >
                  {updatingId === editingBookingId
                    ? "Updating..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#1E1E1E] rounded-2xl shadow-lg overflow-hidden">
          {/* HEADER */}
          <div className="hidden md:grid md:grid-cols-12 px-6 py-4 border-b border-gray-500 font-semibold text-xl">
            <div className="col-span-4 ml-8">Villa & Room</div>
            <div className="col-span-3 ml-14">Dates</div>
            <div className="col-span-3 ml-10">Payment</div>
            <div className="col-span-2 ml-10">Status</div>
          </div>

          <div className="divide-y divide-gray-600">
            {bookingData.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status);

              return (
                <div
                  key={booking._id}
                  className="p-6 hover:bg-gray-800 transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* VILLA & ROOM */}
                    <div className="md:col-span-4 flex gap-4">
                      <img
                        src={
                          booking.villa?.images?.[0]
                            ? booking.villa.images[0]
                            : "https://via.placeholder.com/150"
                        }
                        className="w-24 h-20 rounded-lg object-cover"
                        alt="villa"
                      />

                      <div>
                        <h3 className="font-semibold text-lg">
                          {booking.villa?.villaName || "Villa"}
                        </h3>
                        <p className="text-blue-500 font-medium">
                          {booking.bookingType === "villa"
                            ? "🏡 Entire Villa"
                            : `🛏️ ${booking.room?.roomType}`}
                        </p>

                        <div className="flex items-center text-sm text-gray-400 gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.villa?.villaAddress}
                        </div>

                        <div className="flex items-center text-sm text-gray-400 gap-1">
                          <Users className="w-3 h-3" />
                          {booking.persons} Guests
                        </div>
                      </div>
                    </div>

                    {/* DATES */}
                    <div className="md:col-span-3 text-sm">
                      <p>
                        <span className="text-gray-400">Check-in:</span>{" "}
                        {new Date(booking.checkIn).toDateString()}
                      </p>
                      <p>
                        <span className="text-gray-400">Check-out:</span>{" "}
                        {new Date(booking.checkOut).toDateString()}
                      </p>
                    </div>

                    {/* PAYMENT */}
                    <div className="md:col-span-3 flex items-start gap-6">
                      {/* Total Price */}
                      <p className="font-bold text-lg">
                        ₹ {booking.totalPrice}
                      </p>

                      {/* Buttons */}
                      <div className="flex flex-col space-y-1">
                        {!booking.isPaid && booking.status === "pending" && (
                          <button
                            onClick={() => handlePayment(booking._id)}
                            className="text-green-600 hover:text-white hover:bg-green-700 px-3 py-1 rounded-md transition"
                          >
                            Pay Now
                          </button>
                        )}

                        {!booking.isPaid && booking.status === "pending" && (
                          <button
                            onClick={() => handlePayAtVilla(booking._id)}
                            disabled={payAtVillaLoadingId === booking._id}
                            className={`px-3 py-1 rounded-md transition ${
                              payAtVillaLoadingId === booking._id
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "text-blue-500 hover:text-white hover:bg-blue-600"
                            }`}
                          >
                            {payAtVillaLoadingId === booking._id
                              ? "Processing..."
                              : "Pay at Villa"}
                          </button>
                        )}

                        {canEditBooking(booking) && (
                          <button
                            onClick={() => {
                              if (
                                booking.status === "confirmed" &&
                                !booking.hasUpdatedAfterConfirm
                              ) {
                                const confirmUpdate = window.confirm(
                                  "You're about to update a confirmed booking. Please note that only one update is allowed after confirmation. Do you wish to proceed?",
                                );

                                if (!confirmUpdate) return;
                              }

                              openEditForm(booking);
                            }}
                            className="text-sm px-3 py-1 rounded-md transition-all duration-200 text-indigo-400 hover:text-white hover:bg-indigo-700 hover:scale-105"
                          >
                            Update Booking
                          </button>
                        )}

                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className={`text-sm px-3 py-1 rounded-md transition-all duration-200 ${
                              cancellingId === booking._id
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "text-rose-600 hover:text-white hover:bg-rose-600 hover:scale-105"
                            }`}
                          >
                            {cancellingId === booking._id
                              ? "Cancelling..."
                              : getCancelButtonText(booking)}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* STATUS */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <StatusIcon
                        className={`w-4 h-4 ${getStatusTextColor(
                          booking.status,
                        )}`}
                      />
                      <span
                        className={`capitalize ${getStatusTextColor(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyBookings;
