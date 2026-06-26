import { useContext, useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Mail,
  CreditCard,
} from "lucide-react";
import { AppContext } from "../../Context/AppContext.jsx";
import toast from "react-hot-toast";

function Bookings() {
  const { axios } = useContext(AppContext);
  const [bookingData, setBookingData] = useState([]);

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/villa");
      if (data.success) {
        setBookingData(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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

  return (
    <div className="min-h-screen text-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Villa Bookings</h1>
          <p className="text-white/80 text-lg">
            View all bookings made for your villas
          </p>
        </div>

        <div className="bg-[#1E1E1E] rounded-2xl shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-700">
            {bookingData.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status);

              return (
                <div
                  key={booking._id}
                  className="p-6 hover:bg-gray-800 transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* VILLA INFO */}
                    <div className="md:col-span-4 flex gap-4">
                      <img
                        src={
                          booking.villa?.images?.length
                            ? booking.villa.images[0]
                            : "/no-image.png"
                        }
                        className="w-24 h-20 rounded-lg object-cover"
                        alt={booking.villa?.villaName}
                      />

                      <div>
                        <h3 className="font-semibold text-lg">
                          {booking.villa?.villaName}
                        </h3>
                        <p className="text-blue-400">
                          {booking.bookingType === "villa"
                            ? "🏡 Entire Villa"
                            : `🛏️ ${booking.room?.roomType}`}
                        </p>

                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {booking.villa?.villaAddress}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Users className="w-3 h-3" />
                          {booking.persons} Guests
                        </div>
                      </div>
                    </div>

                    {/* DATES */}
                    <div className="md:col-span-3 text-sm space-y-1">
                      <p>
                        <span className="text-gray-400">Check-in:</span>{" "}
                        {new Date(booking.checkIn).toDateString()}
                      </p>
                      <p>
                        <span className="text-gray-400">Check-out:</span>{" "}
                        {new Date(booking.checkOut).toDateString()}
                      </p>
                    </div>

                    {/* GUEST INFO */}
                    <div className="md:col-span-3 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{booking.user?.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{booking.user?.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span>{booking.paymentMethod}</span>
                      </div>

                      <p className="font-bold text-green-500">₹ {booking.totalPrice}</p>
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

export default Bookings;
