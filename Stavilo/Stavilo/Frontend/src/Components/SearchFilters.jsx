import { useContext, useState, useEffect } from "react";
import { AppContext } from "../Context/AppContext";

function SearchFilters() {
  const { searchVillasFn, location, guests, dates, priceRange } =
    useContext(AppContext);

  const [filters, setFilters] = useState({
    sort: "",
    rating: "",
    bedrooms: "",
    amenities: [],
    meals: [],
    city: "",
  });

  const amenitiesList = ["wifi", "parking", "pool", "ac", "tv", "kitchen"];
  const mealsList = ["breakfast", "lunch", "dinner"];

  const handleAmenityToggle = (amenity) => {
    setFilters((prev) => {
      const exists = prev.amenities.includes(amenity);

      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleMealToggle = (meal) => {
    setFilters((prev) => {
      const exists = prev.meals.includes(meal);

      return {
        ...prev,
        meals: exists
          ? prev.meals.filter((m) => m !== meal)
          : [...prev.meals, meal],
      };
    });
  };

  useEffect(() => {
    searchVillasFn({
      ...filters,
      location,
      adults: guests?.adults,
      children: guests?.children,
      infants: guests?.infants,
      checkIn: dates?.checkIn,
      checkOut: dates?.checkOut,
      minPrice: priceRange?.minPrice,
      maxPrice: priceRange?.maxPrice,
      amenities: filters.amenities.join(","),
      meals: filters.meals.join(","),
    });
  }, [filters]);

  return (
    <div className="bg-[#1E1E1E] border border-[#444] rounded-xl p-5 text-white space-y-6 sticky top-28">
      {/* SORT */}
      <div>
        <h3 className="text-[#FFD369] font-semibold mb-2">Sort By</h3>

        <select
          className="w-full bg-[#2A2A2A] border border-[#444] rounded-md p-2"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sort: e.target.value }))
          }
        >
          <option value="">Latest</option>
          <option value="priceLow">Price Low → High</option>
          <option value="priceHigh">Price High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* CITY */}
      <div>
        <h3 className="text-[#FFD369] font-semibold mb-2">City</h3>

        <input
          type="text"
          placeholder="Search city"
          className="w-full bg-[#2A2A2A] border border-[#444] rounded-md p-2"
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, city: e.target.value }))
          }
        />
      </div>

      {/* BEDROOMS */}
      <div>
        <h3 className="text-[#FFD369] font-semibold mb-2">Bedrooms</h3>

        {[1, 2, 3, 4].map((num) => (
          <label key={num} className="flex gap-2 items-center mb-1">
            <input
              type="radio"
              name="bedrooms"
              value={num}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  bedrooms: e.target.value,
                }))
              }
            />
            {num}+ Bedrooms
          </label>
        ))}
      </div>

      {/* RATING */}
      <div>
        <h3 className="text-[#FFD369] font-semibold mb-2">Rating</h3>

        {[4, 3, 2].map((rate) => (
          <label key={rate} className="flex gap-2 items-center mb-1">
            <input
              type="radio"
              name="rating"
              value={rate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  rating: e.target.value,
                }))
              }
            />
            {rate}+ Stars
          </label>
        ))}
      </div>

      {/* AMENITIES */}
      <div>
        <h3 className="text-[#FFD369] font-semibold mb-2">Amenities</h3>

        {amenitiesList.map((item) => (
          <label key={item} className="flex gap-2 items-center mb-1">
            <input type="checkbox" onChange={() => handleAmenityToggle(item)} />
            {item}
          </label>
        ))}
      </div>

      {/* MEALS */}
      <div>
        <h3 className="text-[#FFD369] font-semibold mb-2">Meals</h3>

        {mealsList.map((item) => (
          <label key={item} className="flex gap-2 items-center mb-1">
            <input type="checkbox" onChange={() => handleMealToggle(item)} />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

export default SearchFilters;
