import { cities } from "../assets/assets.js";
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../Context/AppContext";
import { MapPin, Calendar, Users, IndianRupee } from "lucide-react";
import Cookies from "js-cookie";

function Hero() {
  const {
    setLocation,
    setGuests,
    resetVillas,
    fetchVillasData,
    setDates,
    setPriceRange,
    searchVillas,
    searchVillasFn,
    villaLoading,
    location,
    guests,
    dates,
    priceRange,
  } = useContext(AppContext);
  const [searchLocation, setSearchLocation] = useState("");
  const [guestDropdown, setGuestDropdown] = useState(false);
  const guestRef = useRef(null);
  const [guestData, setGuestData] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const totalGuests = guestData.adults + guestData.children + guestData.infants;
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [price, setPrice] = useState({
    minPrice: 0,
    maxPrice: 3000,
  });

  const handleSearch = () => {
    const filters = {
      location: searchLocation,
      adults: guestData.adults,
      children: guestData.children,
      infants: guestData.infants,
      checkIn,
      checkOut,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
    };

    Cookies.set("villaFilters", JSON.stringify(filters), { expires: 7 });
    setLocation(searchLocation);
    setGuests(guestData);
    setDates({ checkIn, checkOut });
    setPriceRange(price);
    searchVillasFn(filters);
  };

  useEffect(() => {
    setSearchLocation(location);

    if (guests) {
      setGuestData({
        adults: guests.adults || 1,
        children: guests.children || 0,
        infants: guests.infants || 0,
      });
    }

    setCheckIn(dates.checkIn);
    setCheckOut(dates.checkOut);
    setPrice(priceRange);
  }, [location, guests, dates, priceRange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setGuestDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className=" max-w-5xl w-full mx-auto bg-[#2A2A2A] border-2 border-[#444444] text-[#CCCCCC] rounded-xl px-6 py-4  flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto"
      >
        {/* Location */}
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FFD369] opacity-80" />
            <label htmlFor="destinationInput">Select Location</label>
          </div>

          <input
            list="destinations"
            id="destinationInput"
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className=" placeholder-[#888888] bg-[#1E1E1E/80] text-[#FFFFFF] rounded border border-gray-200 focus:border-[#FFD369] px-3 py-1.5 mt-1.5 text-sm outline-none"
            placeholder="Type here"
          />
          <datalist id="destinations">
            {cities.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </div>

        {/* Check-In Date */}
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FFD369] opacity-80" />
            <label htmlFor="checkIn">Check in</label>
          </div>

          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            name="checkIn"
            min={new Date().toISOString().split("T")[0]}
            className="bg-[#1E1E1E/80] placeholder-[#888888] rounded border text-[#FFFFFF] border-gray-200 focus:border-[#FFD369] px-3 py-1.5 mt-1.5 text-sm outline-none"
          />
        </div>

        {/* Check-Out Date */}
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FFD369] opacity-80" />
            <label htmlFor="checkOut">Check out</label>
          </div>

          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split("T")[0]}
            name="checkOut"
            className=" bg-[#1E1E1E/80] placeholder-[#888888] rounded border text-[#FFFFFF] border-gray-200 focus:border-[#FFD369] px-3 py-1.5 mt-1.5 text-sm outline-none"
          />
        </div>

        {/* Guests Selector */}
        <div className="relative" ref={guestRef}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FFD369] opacity-80" />
            <label>Guests</label>
          </div>

          {/* INPUT DISPLAY */}
          <div
            onClick={() => setGuestDropdown(!guestDropdown)}
            className="cursor-pointer bg-[#1E1E1E/80] text-[#FFFFFF] rounded border border-gray-200 focus:border-[#FFD369] px-3 py-1.5 mt-1.5 text-sm outline-none min-w-[120px]"
          >
            {totalGuests} Guest{totalGuests !== 1 && "s"}
          </div>

          {/* DROPDOWN */}
          {guestDropdown && (
            <div className="absolute z-50 mt-2 w-64 bg-[#2A2A2A] border border-[#444] rounded-lg shadow-lg p-4">
              {[
                { label: "Adults", key: "adults", min: 1 },
                { label: "Children", key: "children", min: 0 },
                { label: "Infants", key: "infants", min: 0 },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex justify-between items-center py-2 text-white"
                >
                  <span>{item.label}</span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setGuestData((prev) => ({
                          ...prev,
                          [item.key]: Math.max(item.min, prev[item.key] - 1),
                        }))
                      }
                      className="w-8 h-8 rounded-full border border-[#FFD369] text-[#FFD369]"
                    >
                      −
                    </button>

                    <span className="w-6 text-center">
                      {guestData[item.key]}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setGuestData((prev) => ({
                          ...prev,
                          [item.key]: prev[item.key] + 1,
                        }))
                      }
                      className="w-8 h-8 rounded-full border border-[#FFD369] text-[#FFD369]"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t border-[#444] pt-2 mt-2 text-sm text-[#FFD369]">
                Total Guests: <b>{totalGuests}</b>
              </div>
            </div>
          )}
        </div>

        {/* PRICE RANGE SLIDER */}
        <div className="w-full md:w-1/3">
          <div className="flex items-center gap-2 ">
            <IndianRupee className="w-6 h-6 text-[#FFD369] opacity-80" />
            <label className="text-sm font-semibold">Price Range</label>
          </div>

          <div className="relative w-full mt-2">
            <div className="h-2 bg-gray-700 rounded relative">
              <div
                className="h-2 bg-[#FFD369] rounded absolute"
                style={{
                  left: `${(price.minPrice / 20000) * 100}%`,
                  right: `${100 - (price.maxPrice / 20000) * 100}%`,
                }}
              />
            </div>

            {/* Min Slider */}
            <input
              type="range"
              min={0}
              max={20000}
              value={price.minPrice}
              onChange={(e) =>
                setPrice((prev) => ({
                  ...prev,
                  minPrice: Math.min(
                    Number(e.target.value),
                    prev.maxPrice - 100,
                  ),
                }))
              }
              className="absolute top-0 w-full h-2 bg-transparent appearance-none pointer-events-none"
              style={{ zIndex: price.minPrice > 9800 ? 5 : 3 }}
            />

            {/* Max Slider */}
            <input
              type="range"
              min={0}
              max={20000}
              value={price.maxPrice}
              onChange={(e) =>
                setPrice((prev) => ({
                  ...prev,
                  maxPrice: Math.max(
                    Number(e.target.value),
                    prev.minPrice + 100,
                  ),
                }))
              }
              className="absolute top-0 w-full h-2 bg-transparent appearance-none pointer-events-none"
              style={{ zIndex: price.maxPrice < 200 ? 5 : 4 }}
            />
          </div>

          {/* Values */}
          <div className="flex justify-between text-sm text-[#FFD369] font-semibold mt-1">
            <span>₹{price.minPrice}</span>
            <span>₹{price.maxPrice}</span>
          </div>
        </div>

        <button
          disabled={villaLoading}
          className="flex items-center justify-center gap-1 rounded-md bg-[#6A0DAD] hover:bg-[#FFD369] py-3 px-4 text-[#FFFFFF] hover:text-[#6A0DAD] my-auto cursor-pointer max-md:w-full max-md:py-1"
        >
          {villaLoading ? (
            <span className="animate-pulse">Searching...</span>
          ) : (
            <>
              <svg
                className="w-4 h-4 "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
              <span>Search</span>
            </>
          )}
        </button>
      </form>
    </>
  );
}

export default Hero;
