import React, { useContext } from "react";
import { AppContext } from "../Context/AppContext";
import RoomCard from "./RoomCard";
import SkeletonRoomGrid from "./SkeletonRoomGrid";

function PopularRooms() {
  const { popularRooms, popularRoomsLoading } =
    useContext(AppContext);

  return (
    <div className="py-16">
      <h1 className="text-[#FFFFFF] text-3xl font-semibold text-center">
        Most Popular Rooms
      </h1>

      <p className="text-[#CCCCCC80] text-sm text-center max-w-lg mx-auto">
        Based on bookings from last 7 days
      </p>

      <div className="max-w-7xl mx-auto mt-12 px-4">

        {popularRoomsLoading && popularRooms.length === 0 ? (
          <SkeletonRoomGrid count={4} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>       
            {popularRoomsLoading && (
              <SkeletonRoomGrid count={2} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PopularRooms;