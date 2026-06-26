import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:4000";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [ownerName, setOwnerName] = useState("");

  // -------- FILTERS --------
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [dates, setDates] = useState({
    checkIn: "",
    checkOut: "",
  });
  const [priceRange, setPriceRange] = useState({
    minPrice: 0,
    maxPrice: 3000,
  });

  const [favourites, setFavourites] = useState([]);
  // -------- VILLAS (PAGINATION) --------
  const [villaData, setVillaData] = useState([]);
  const [villaPage, setVillaPage] = useState(1);
  const [villaHasMore, setVillaHasMore] = useState(true);
  const [villaLoading, setVillaLoading] = useState(false);
  const [searchVillas, setSearchVillas] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularVillas, setPopularVillas] = useState([]);
  const [popularVillasLoading, setPopularVillasLoading] = useState(false);

  // -------- ROOMS (PAGINATION) --------
  const [roomData, setRoomData] = useState([]);
  const [roomPage, setRoomPage] = useState(1);
  const [roomHasMore, setRoomHasMore] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [popularRooms, setPopularRooms] = useState([]);
  const [popularRoomsLoading, setPopularRoomsLoading] = useState(false);

  // ================= AUTH CHECK =================
  const checkUserLoggedInOrNot = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        if (data.user.role === "user") {
          setUser(true);
        } else {
          setOwner(true);
          setOwnerName(data.user.name);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ================= FETCH FAVOURITES =================
  const fetchFavourites = async () => {
    try {
      const { data } = await axios.get("/api/favourites");

      if (data.success) {
        setFavourites(data.villas);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // ================= TOGGLE FAVOURITE =================
  const toggleFavourite = async (villaId) => {
    const isFav = favourites.some((v) => v._id === villaId);

    const villa =
      villaData.find((v) => v._id === villaId) ||
      searchVillas.find((v) => v._id === villaId) ||
      popularVillas.find((v) => v._id === villaId);

    if (isFav) {
      setFavourites((prev) => prev.filter((v) => v._id !== villaId));
    } else if (villa) {
      setFavourites((prev) => [...prev, villa]);
    }

    try {
      await axios.post(`/api/favourites/toggle/${villaId}`);
    } catch (error) {
      toast.error("Failed to update favourite");
      fetchFavourites();
    }
  };

  // ================= Search VILLAS =================
  const searchVillasFn = async (filters) => {
    setIsSearching(true);
    setVillaLoading(true);

    try {
      const { data } = await axios.get("/api/villa/get-all", {
        params: {
          page: 1,
          limit: 6,
          adults: filters.adults ?? guests.adults,
          children: filters.children ?? guests.children,
          infants: filters.infants ?? guests.infants,
          ...filters,
        },
      });

      if (data.success) {
        setSearchVillas(data.villas);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVillaLoading(false);
    }
  };

  // ================= FETCH VILLAS =================
  const fetchVillasData = async ({ search = false, sort } = {}) => {
    if (villaLoading || !villaHasMore) return;

    setVillaLoading(true);

    try {
      const { data } = await axios.get("/api/villa/get-all", {
        params: {
          page: villaPage,
          limit: 6,
          sort,
          location,
          adults: guests.adults,
          children: guests.children,
          infants: guests.infants,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          minPrice: priceRange.minPrice,
          maxPrice: priceRange.maxPrice,
        },
      });

      if (data.success) {
        if (search) {
          setSearchVillas(data.villas);
        } else {
          setVillaData((prev) =>
            villaPage === 1 ? data.villas : [...prev, ...data.villas],
          );

          setVillaHasMore(data.pagination?.hasMore ?? false);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setVillaLoading(false);
    }
  };

  // ================= RESET VILLAS =================
  const resetVillas = () => {
    setVillaData([]);
    setVillaPage(1);
    setVillaHasMore(true);
  };

  // ================= FETCH ROOMS =================
  const fetchRoomsData = async () => {
    if (roomLoading || !roomHasMore) return;

    setRoomLoading(true);

    try {
      const { data } = await axios.get("/api/room/get-all", {
        params: {
          page: roomPage,
          limit: 8,
        },
      });

      if (data.success) {
        setRoomData((prev) =>
          roomPage === 1 ? data.rooms : [...prev, ...data.rooms],
        );
        setRoomHasMore(data.pagination?.hasMore ?? false);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRoomLoading(false);
    }
  };

  const getPopularVillas = async () => {
    try {
      setPopularVillasLoading(true);
      const { data } = await axios.get("/api/villa/popular");

      if (data.success) {
        setPopularVillas(data.villas);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPopularVillasLoading(false);
    }
  };

  const getPopularRooms = async () => {
    try {
      setPopularRoomsLoading(true);
      const { data } = await axios.get("/api/room/popular");

      if (data.success) {
        setPopularRooms(data.rooms);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPopularRoomsLoading(false);
    }
  };

  // ================= EFFECTS =================
  useEffect(() => {
    if (user) fetchFavourites();
  }, [user]);

  useEffect(() => {
    getPopularRooms();
    getPopularVillas();
  }, []);

  useEffect(() => {
    checkUserLoggedInOrNot();
  }, []);

  useEffect(() => {
    if (!isSearching) fetchVillasData();
  }, [villaPage]);

  useEffect(() => {
    fetchRoomsData();
  }, [roomPage]);

  useEffect(() => {
    const savedFilters = Cookies.get("villaFilters");
    if (!savedFilters) return;

    const filters = JSON.parse(savedFilters);

    setLocation(filters.location || "");
    setGuests({
      adults: filters.adults || 1,
      children: filters.children || 0,
      infants: filters.infants || 0,
    });
    setDates({
      checkIn: filters.checkIn || "",
      checkOut: filters.checkOut || "",
    });
    setPriceRange({
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 3000,
    });

    setTimeout(() => {
      searchVillasFn(filters);
    }, 0);
  }, []);

  const value = {
    navigate,
    user,
    setUser,
    owner,
    setOwner,
    ownerName,

    // Villas
    villaData,
    fetchVillasData,
    setVillaPage,
    villaHasMore,
    villaLoading,
    resetVillas,
    location,
    setLocation,
    guests,
    setGuests,
    setDates,
    dates,
    priceRange,
    setPriceRange,
    isSearching,
    setIsSearching,
    searchVillas,
    searchVillasFn,
    popularVillas,
    popularVillasLoading,

    // Rooms
    roomData,
    setRoomPage,
    roomHasMore,
    roomLoading,
    popularRooms,
    popularRoomsLoading,

    //favourite
    favourites,
    toggleFavourite,
    fetchFavourites,

    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
