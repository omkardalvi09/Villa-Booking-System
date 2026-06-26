import { useContext } from "react";
import { AppContext } from "../Context/AppContext";
import VillaCard from "../Components/VillaCard";

export default function Favourites() {
  const { favourites } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-[#121212] p-10">
      <h1 className="text-3xl font-bold text-white mb-8">
        Your Favourite Villas ❤️
      </h1>

      {favourites.length === 0 ? (
        <p className="text-white/60">
          No favourites added yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {favourites.map(villa => (
            <VillaCard key={villa._id} villa={villa} />
          ))}
        </div>
      )}
    </div>
  );
}