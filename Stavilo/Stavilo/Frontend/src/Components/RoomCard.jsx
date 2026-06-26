import React, { useContext } from "react";
import { AppContext } from "../Context/AppContext";

function RoomCard({ room }) {
  const { navigate } = useContext(AppContext);

  return (
    <div className="group cursor-pointer">
      <div
        className="
          bg-[#1E1E1E]/90 backdrop-blur-lg 
          rounded-xl shadow-lg overflow-hidden
          transition-all duration-300 ease-out
          transform hover:-translate-y-2 hover:shadow-2xl
          max-w-80 border border-[#2A2A2A]
        "
      >
        {/* Room Image */}
        <img
          src={room.images?.[0]}
          alt={room.roomType}
          className="
            w-full h-52 object-cover 
            group-hover:scale-105 transition-transform duration-500
          "
        />

        {/* Room Title */}
        <h1
          className="
            mt-3 px-4 pt-3 mb-1 
            text-lg font-semibold 
            text-white tracking-wide
          "
        >
          {room.roomType}
        </h1>

        {/* Price + Button */}
        <div className="flex items-center gap-4 justify-between px-4 pb-4">
          <p className="text-sm text-gray-400">
            ₹ {room.pricePerNight}
            <span className="text-gray-500"> /per person</span>
          </p>

          <button
            onClick={() => {
              navigate(`/room/${room._id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="
              bg-gradient-to-r from-[#6A0DAD] to-[#FFD369]
              text-white font-medium text-sm
              rounded-md px-4 py-1.5
              transition-all duration-300
              hover:from-[#FFD369] hover:to-[#6A0DAD]
              hover:text-black
            "
          >
            See Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
