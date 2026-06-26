import { useContext } from "react";
import { AppContext } from "../Context/AppContext";
import SkeletonGrid from "./SkeletonGrid";
import VillaCard from "./VillaCard";
import SearchFilters from "./SearchFilters";

function SearchResults() {
  const { searchVillas, isSearching, villaLoading } = useContext(AppContext);

  if (!isSearching) return null;

  return (
    <div className="py-10 border-b border-gray-700">
      <h1 className="text-[#FFD369] text-2xl font-semibold text-center mb-10">
        Search Results
      </h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS */}
        <div className="lg:col-span-1">
          <SearchFilters />
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-3">
          {villaLoading && <SkeletonGrid count={6} />}

          {!villaLoading && searchVillas.length === 0 && (
            <p className="text-center text-gray-400">No villas found 😢</p>
          )}

          {!villaLoading && searchVillas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchVillas.map((villa) => (
                <VillaCard key={villa._id} villa={villa} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
