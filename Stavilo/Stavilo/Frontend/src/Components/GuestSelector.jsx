import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { User } from "lucide-react";

function GuestSelector({ bookingData = {}, setBookingData, maxGuests = 1 }) {
  const [dropdown, setDropdown] = useState(false);
  const selectorRef = useRef(null);

  const adults = bookingData.adults ?? 1;
  const children = bookingData.children ?? 0;
  const infants = bookingData.infants ?? 0;

  const totalGuests = adults + children + infants;

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= INCREASE ================= */
  const increaseGuest = (key) => {
    const newTotal = totalGuests + 1;

    if (newTotal > maxGuests) {
      toast.error(`Only ${maxGuests} guests allowed`);
      return;
    }

    if (newTotal > bookingData.baseGuests) {
      toast(`Extra guest charges will apply ⚡`, {
        icon: "💰",
      });
    }

    setBookingData((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }));
  };

  /* ================= DECREASE ================= */
  const decreaseGuest = (key, min) => {
    setBookingData((prev) => {
      const updated = {
        ...prev,
        [key]: Math.max(min, (prev[key] ?? 0) - 1),
      };
      if (key === "adults" && updated.adults < 1) {
        updated.adults = 1;
      }

      return updated;
    });
  };

  const guestTypes = [
    { label: "Adults", key: "adults", min: 1 },
    { label: "Children", key: "children", min: 0 },
    { label: "Infants", key: "infants", min: 0 },
  ];

  return (
    <div className="relative" ref={selectorRef}>
      <label className="block text-sm font-medium text-white/80 mb-2">
        <User className="w-4 h-4 inline mr-2" />
        Guests
      </label>

      {/* DISPLAY */}
      <div
        onClick={() => setDropdown((prev) => !prev)}
        className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-600 rounded-lg cursor-pointer"
      >
        {totalGuests} Guest{totalGuests !== 1 && "s"}
      </div>

      {/* DROPDOWN */}
      {dropdown && (
        <div className="absolute mt-2 w-full bg-[#1E1E1E] border border-gray-700 rounded-lg p-4 z-50">
          {guestTypes.map((item) => (
            <div
              key={item.key}
              className="flex justify-between items-center py-2 text-white"
            >
              <span>{item.label}</span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => decreaseGuest(item.key, item.min)}
                  className="w-8 h-8 border border-yellow-400 rounded-full"
                >
                  −
                </button>

                <span className="w-6 text-center">
                  {bookingData[item.key] ?? item.min}
                </span>

                <button
                  type="button"
                  onClick={() => increaseGuest(item.key)}
                  className="w-8 h-8 border border-yellow-400 rounded-full"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="border-t border-gray-700 mt-2 pt-2 text-yellow-400">
            Total Guests: <b>{totalGuests}</b>
          </div>
        </div>
      )}

      <p className="text-xs text-white/60 mt-1">
        Maximum {maxGuests} guests allowed
      </p>
    </div>
  );
}

export default GuestSelector;
