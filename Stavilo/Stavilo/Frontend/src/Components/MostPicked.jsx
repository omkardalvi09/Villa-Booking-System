import { useContext } from "react";
import { AppContext } from "../Context/AppContext";
import VillaCard from "./VillaCard";
import SkeletonGrid from "./SkeletonGrid";

function MostPicked() {
  const { popularVillas, popularVillasLoading } = useContext(AppContext);

  return (
    <div className="py-16">
      <h1 className="text-[#FFFFFF] text-3xl font-semibold text-center">
        Most Popular Villas
      </h1>

      <p className="text-[#CCCCCC80] text-sm text-center max-w-lg mx-auto mt-2">
        Based on bookings from the last 7 days
      </p>

      <div className="max-w-6xl mx-auto mt-10 px-4">
        {popularVillasLoading ? (
          <SkeletonGrid count={4} />
        ) : popularVillas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularVillas.map((villa) => (
              <VillaCard key={villa._id} villa={villa} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">
            No popular villas available
          </p>
        )}
      </div>
    </div>
  );
}

export default MostPicked;
