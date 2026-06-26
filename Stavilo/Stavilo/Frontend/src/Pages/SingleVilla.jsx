import { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../Context/AppContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import GuestSelector from "../Components/GuestSelector";
import {
  Star,
  CheckCircle,
  Eye,
  Mountain,
  TreePine,
  Wifi,
  Car,
  Utensils,
  Tv,
  Bath,
  Coffee,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Phone,
  Home,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";
import { MdLocationPin } from "react-icons/md";
import toast from "react-hot-toast";
import TextReviews from "../Components/TextReviews";
import PriceBreakdown from "../Components/PriceBreakdown";

const SingleVillaLoader = () => {
  return (
    <div className="min-h-screen bg-[#0D0D0D80] py-8 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* HEADER */}
        <div className="bg-[#1E1E1E]/80 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="space-y-4 w-full">
              <div className="h-8 w-64 bg-gray-700 rounded"></div>
              <div className="h-4 w-48 bg-gray-700 rounded"></div>
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-gray-700 rounded"></div>
                <div className="h-4 w-24 bg-gray-700 rounded"></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-32 bg-gray-700 rounded"></div>
              <div className="h-4 w-28 bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="bg-[#1E1E1E]/80 rounded-2xl p-8">
          <div className="h-8 w-40 bg-gray-700 rounded mb-6"></div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-700 rounded-xl"></div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="h-24 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* ROOMS */}
        <div className="bg-[#1E1E1E]/80 rounded-2xl p-8">
          <div className="h-8 w-48 bg-gray-700 rounded mb-6"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0f0f0f] rounded-xl overflow-hidden">
                <div className="h-56 bg-gray-700"></div>

                <div className="p-4 space-y-3">
                  <div className="h-5 w-40 bg-gray-700 rounded"></div>
                  <div className="h-4 w-24 bg-gray-700 rounded"></div>
                  <div className="h-10 w-full bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function SingleVilla() {
  const { villaData, roomData, axios, user } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [pricePreview, setPricePreview] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [villa, setVilla] = useState(null);
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    infants: 0,
  });
  const totalPersons =
    bookingData.adults + bookingData.children + bookingData.infants;
  const isAvailable = !!pricePreview;

  const onChangeHandler = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const existingVilla = villaData.find((v) => v._id === id);

    if (existingVilla) {
      setVilla(existingVilla);
      return;
    }

    const fetchVilla = async () => {
      try {
        const { data } = await axios.get(`/api/villa/${id}`);
        if (data.success) {
          setVilla(data.villa);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchVilla();
  }, [id, villaData]);

  useEffect(() => {
    if (location.state?.bookingData) {
      setBookingData(location.state.bookingData);
    }
  }, [location.state]);

  useEffect(() => {
    if (!villa || !bookingData.checkIn || !bookingData.checkOut) return;
    fetchPricePreview();
  }, [villa, bookingData.checkIn, bookingData.checkOut, totalPersons]);

  useEffect(() => {
    console.log("Current villa ID:", id);
    console.log("Loaded villas:", villaData);
  }, [villaData]);

  const fetchPricePreview = async () => {
    if (!villa || !bookingData.checkIn || !bookingData.checkOut) return;

    try {
      const { data } = await axios.post("/api/bookings/preview-price", {
        villa: villa._id,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        adults: bookingData.adults,
        children: bookingData.children,
        infants: bookingData.infants,
      });

      if (data.success) {
        if (!data.isAvailable) {
          toast.error("Villa not available for selected dates ❌");
          setPricePreview(null);
          return;
        }

        setPricePreview(data.priceDetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* ================= ROOMS ================= */
  const villaRooms =
    roomData?.filter((room) => room.villa?._id === villa?._id) || [];
  const [roomImageIndex, setRoomImageIndex] = useState({});
  const touchStartX = useRef({});

  /* ================= ROOM CAROUSEL ================= */
  const nextImage = (roomId, length) => {
    setRoomImageIndex((prev) => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % length,
    }));
  };

  const prevImage = (roomId, length) => {
    setRoomImageIndex((prev) => ({
      ...prev,
      [roomId]:
        (prev[roomId] || 0) === 0 ? length - 1 : (prev[roomId] || 0) - 1,
    }));
  };

  const handleTouchStart = (e, roomId) => {
    touchStartX.current[roomId] = e.touches[0].clientX;
  };

  const handleTouchEnd = (e, roomId, length) => {
    const diff = touchStartX.current[roomId] - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextImage(roomId, length) : prevImage(roomId, length);
    }
  };

  if (!villa) {
    return <SingleVillaLoader />;
  }
  const maxGuests = (villa?.baseGuests || 0) + (villa?.extraGuestsAllowed || 0);

  const getAmenityIcon = (amenity) => {
    const map = {
      "Ocean View": Eye,
      "Mountain View": Mountain,
      "Garden View": TreePine,
      "Free Wifi": Wifi,
      Parking: Car,
      Kitchen: Utensils,
      "Smart TV": Tv,
      Jacuzzi: Bath,
      "Breakfast Included": Coffee,
    };
    return map[amenity] || CheckCircle;
  };

  const getMealIcon = (meal) => {
    const map = {
      breakfast: Coffee,
      lunch: UtensilsCrossed,
      dinner: UtensilsCrossed,
    };

    return map[meal] || CheckCircle;
  };

  const checkVillaAvailability = async () => {
    try {
      setBtnLoading(true);

      if (bookingData.checkIn >= bookingData.checkOut) {
        toast.error("Check-In date should be before Check-Out date");
        return;
      }
      const { data } = await axios.post(
        "/api/bookings/check-villa-availability",
        {
          villa: villa._id,
          checkInDate: bookingData.checkIn,
          checkOutDate: bookingData.checkOut,
        },
      );
      if (data.success) {
        if (data.isAvailable) {
          toast.success("Villa is available ✅");
        } else {
          toast.error("Villa is not available ❌");
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleBooking = async ({ type, id, bookingData, totalPersons }) => {
    try {
      const { data } = await axios.post("/api/bookings/book", {
        [type]: id,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        persons: totalPersons,
        adults: bookingData.adults,
        children: bookingData.children,
        infants: bookingData.infants,
        paymentMethod: "Pay At Villa",
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
        scrollTo(0, 0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      if (totalPersons > maxGuests) {
        toast.error(
          `Max ${maxGuests} guests allowed (Base: ${villa.baseGuests}, Extra: ${villa.extraGuestsAllowed})`,
        );
        return;
      }

      if (!user) {
        toast.error("Please login to book");
        navigate("/login", {
          state: {
            redirectTo: location.pathname,
            bookingData,
          },
        });
        return;
      }

      if (!pricePreview) {
        toast.error("Please select valid dates");
        return;
      }

      const { data } = await axios.post("/api/bookings/book", {
        villa: villa._id,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        persons: totalPersons,
        adults: bookingData.adults,
        children: bookingData.children,
        infants: bookingData.infants,
        paymentMethod: "Pay At Villa",
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
        scrollTo(0, 0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D80] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ================= HEADER ================= */}
        <div className="bg-[#1E1E1E]/80 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            {/* LEFT */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{villa.villaName}</h1>

              <div className="flex items-center gap-2 text-white/60 mt-2">
                <MdLocationPin className="text-red-500" />
                <span>{villa.villaAddress}</span>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
                  <span>{villa.rating}</span>
                </div>

                <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <Home className="w-4 h-4" />
                  <span>{villaRooms.length} Rooms</span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500 mb-2">
                ₹ {villa.price}
                <span className="text-lg text-white/60"> / night</span>
              </div>

              <div className="text-white/70 space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <UserIcon className="w-5 h-5" />
                  <span>{villa.owner?.name}</span>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Phone className="w-5 h-5" />
                  <span>+91 - {villa.villaContactNo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= VILLA IMAGES ================= */}
        <div className="bg-[#1E1E1E]/80 rounded-2xl p-8 mb-8">
          <h2 className="text-3xl text-white font-bold mb-6">Villa Images</h2>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <img
                src={villa.images[selectedImage]}
                className="w-full h-96 object-cover rounded-xl"
                alt="Villa"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {villa.images.map((img, index) => (
                <img
                  key={index}
                  src={villa.images[index]}
                  onClick={() => setSelectedImage(index)}
                  className={`h-24 object-cover rounded-lg cursor-pointer ${
                    selectedImage === index
                      ? "ring-4 ring-blue-500"
                      : "opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ================= ROOMS ================= */}
        <div className="bg-[#1E1E1E]/80 rounded-2xl p-8">
          <h2 className="text-3xl text-white font-bold mb-6">
            Rooms in This Villa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {villaRooms.map((room) => {
              const index = roomImageIndex[room._id] || 0;

              return (
                <div
                  key={room._id}
                  className="bg-[#0f0f0f] rounded-xl overflow-hidden shadow-lg"
                >
                  <div
                    className="relative h-56"
                    onTouchStart={(e) => handleTouchStart(e, room._id)}
                    onTouchEnd={(e) =>
                      handleTouchEnd(e, room._id, room.images.length)
                    }
                  >
                    <img
                      src={room.images?.[index]}
                      className="w-full h-full object-cover"
                      alt={room.roomType}
                    />

                    {room.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            prevImage(room._id, room.images.length)
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={() =>
                            nextImage(room._id, room.images.length)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="p-4 text-white">
                    <h3 className="text-xl font-semibold mb-2">
                      {room.roomType}
                    </h3>
                    <p className="text-green-400 font-bold mb-4">
                      ₹ {room.pricePerNight} / night
                    </p>
                    <button
                      onClick={() => navigate(`/room/${room._id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
                    >
                      View Room
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">
            {/* AMENITIES */}
            <div className="bg-[#1E1E1E]/80 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Amenities</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {villa?.amenities?.split(",").map((amenity, i) => {
                  const Icon = getAmenityIcon(amenity);

                  return (
                    <div
                      key={i}
                      className="flex gap-3 bg-blue-50 p-3 rounded-lg"
                    >
                      <Icon className="text-blue-600" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MEALS */}
            <div className="bg-[#1E1E1E]/80 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Meals Available
              </h2>

              {villa?.meals &&
              Object.values(villa.meals).some((meal) => meal === true) ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(villa.meals)
                    .filter(([_, value]) => value === true)
                    .map(([meal], i) => {
                      const Icon = getMealIcon(meal);

                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg"
                        >
                          <Icon className="text-blue-600" />
                          <span className="text-gray-700 capitalize">
                            {meal}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-[#0f0f0f] text-white/70 p-4 rounded-lg">
                  <Utensils className="text-red-400" />
                  <span>No meals are provided at this villa.</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1E1E1E]/80 text-[#ffffff] rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">About This Villa</h2>
            <p className="text-[#ffffff]/60 leading-relaxed">
              {villa?.villaDescription}
            </p>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-3 flex justify-center my-10">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
          </div>
          <div className="lg:col-span-3 flex justify-center">
            <div className="w-full max-w-md bg-[#1E1E1E]/80 text-[#ffffff] rounded-2xl shadow-lg p-6 sm:p-8 lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold mb-6">Book This Villa</h2>
              <form onSubmit={onSubmitHandler} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium text-[#ffffff]/80 mb-2"
                    htmlFor=""
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingData.checkIn}
                    onChange={onChangeHandler}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-[#ffffff]/80 mb-2"
                    htmlFor=""
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    min={bookingData.checkIn}
                    value={bookingData.checkOut}
                    onChange={onChangeHandler}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  {/* Guests Selector */}
                  <GuestSelector
                    bookingData={{
                      ...bookingData,
                      baseGuests: villa.baseGuests,
                    }}
                    setBookingData={setBookingData}
                    maxGuests={maxGuests}
                  />
                </div>

                {/* Extra Guests Info */}
                {totalPersons > villa.baseGuests && (
                  <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 p-3 rounded-lg text-sm">
                    Extra Guests: {totalPersons - villa.baseGuests} <br />
                    Charges may apply per guest.
                  </div>
                )}

                <div className="border-t pt-4 mt-6">
                  {pricePreview ? (
                    <PriceBreakdown
                      pricePreview={pricePreview}
                      bookingData={bookingData}
                    />
                  ) : (
                    <div className="flex justify-between items-center">
                      <span>Price per Night</span>
                      <span>₹ {villa.price}</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
                              ${
                                btnLoading
                                  ? "bg-gray-500 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700"
                              } text-white flex items-center justify-center gap-2`}
                >
                  {btnLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </>
                  ) : pricePreview ? (
                    "Book Now"
                  ) : (
                    "Select Dates"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* ================= REVIEWS ================= */}
      <hr class="mt-10 border-t-4 border-gray-300 my-4"></hr>
      <div className="m-10">
        <TextReviews />
      </div>
    </div>
  );
}

export default SingleVilla;
