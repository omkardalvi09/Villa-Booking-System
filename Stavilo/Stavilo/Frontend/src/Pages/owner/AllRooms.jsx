import React, { useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { MapPin, Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";

function AllRooms() {
  const { navigate, axios } = useContext(AppContext);

  const [roomData, setRoomData] = useState([]);
  const fetchOwnerRooms = async () => {
    try {
      const { data } = await axios.get("/api/room/get");
      if (data.success) {
        setRoomData(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchOwnerRooms();
  }, []);

  const deleteRoom = async (id) => {
    try {
      const { data } = await axios.delete("/api/room/delete/" + id);
      if (data.success) {
        toast.success(data.message);
        fetchOwnerRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center bg-[#1E1E1E] rounded-2xl shadow-xl p-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Your All Rooms</h1>
            <p className="text-[#ffffff]/75">Manage Your Rooms Here</p>
          </div>
          <button
            className="bg-[#6A0DAD] text-white px-6 py-1 rounded-md cursor-pointer"
            onClick={() => navigate("/owner/add-room")}
          >
            Add New Room
          </button>
        </div>

        {/* Room Table */}
        <div className="bg-[#1E1E1E]/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-black to-indigo-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Villa
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Room Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Price/Night
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Amenities
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {roomData.map((room, index) => (
                  <tr
                    key={room._id}
                    className={`hover:bg-[#616161] transition-all duration-200 ${
                      index % 2 === 0 ? "bg-[#1E1E1E]/80" : "bg-[#282626]"
                    }`}
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={room.images?.[0]}
                            alt={room.roomType}
                            className="w-20 h-16 rounded-xl object-cover min-w-10 shadow-md"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white hover:text-amber-500 transition-colors">
                            {room.villa.villaName}
                          </h3>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-start space-x-2">
                        <span className="text-white/90 text-base leading-relaxed">
                          {room.roomType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-white/80 mt-1 flex-shrink-0" />
                        <span className="text-white/80 text-sm leading-relaxed">
                          {room.villa.villaAddress}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center align-middle">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white/80 text-sm leading-relaxed">
                          {room.villa.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 font-bold text-base leading-relaxed">
                          ₹ {room.pricePerNight}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.split(",").map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="flex flex-col gap-2 px-6 py-6">
                      <button
                        onClick={() => navigate(`/owner/add-room/${room._id}`)}
                        className="bg-blue-500 text-white py-1 px-4 rounded-full"
                      >
                        update
                      </button>
                      <button
                        onClick={() => deleteRoom(room._id)}
                        className="bg-red-500 text-white py-1 px-4 rounded-full cursor-pointer"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllRooms;
