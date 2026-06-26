import { useState, useEffect, useRef, useContext } from "react";
import { toast } from "react-hot-toast";
import { AppContext } from "../../Context/AppContext";
import { useParams } from "react-router-dom";

const AddRoom = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { axios, navigate } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState({
    villa: "",
    roomType: "",
    guests: "",
    pricePerNight: "",
    description: "",
    amenities: [],
    images: [],
    meals: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    isAvailable: false,
  });
  const [imageError, setImageError] = useState("");

  const [villaData, setVillaData] = useState([]);

  const suggestionRef = useRef(null);
  const roomTypeSuggestions = [
    "Standard Room",
    "Dormatory Room",
    "Deluxe Room",
    "Superior Room",
    "Executive Room",
    "Luxury Room",
    "Premium Room",
    "Classic Room",
    "Economy Room",
    "Budget Room",
  ];

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] =
    useState(roomTypeSuggestions);
  const handleRoomTypeChange = (e) => {
    const value = e.target.value;

    setRoomData((prev) => ({
      ...prev,
      roomType: value,
    }));

    const filtered = roomTypeSuggestions.filter((type) =>
      type.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
  };

  const selectSuggestion = (value) => {
    setRoomData((prev) => ({
      ...prev,
      roomType: value,
    }));

    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchOwnerVillas = async () => {
    try {
      const { data } = await axios.get("/api/villa/get");
      if (data.success) {
        setVillaData(data.villas);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(data.message);
    }
  };
  useEffect(() => {
    fetchOwnerVillas();
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    setRoomData({
      ...roomData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedImages = [...roomData.images];
      updatedImages[index] = file;
      setRoomData({ ...roomData, images: updatedImages });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const existingImages = roomData.images.filter(
      (img) => typeof img === "string",
    );

    const formData = new FormData();
    formData.append("villa", roomData.villa);
    formData.append("roomType", roomData.roomType);
    formData.append("guests", roomData.guests);
    formData.append("pricePerNight", roomData.pricePerNight);
    formData.append("description", roomData.description);
    formData.append("isAvailable", roomData.isAvailable);
    formData.append("amenities", roomData.amenities);
    formData.append("meals", JSON.stringify(roomData.meals));
    formData.append("existingImages", JSON.stringify(existingImages));

    const hasImage = roomData.images.some((img) => img);

    if (!hasImage) {
      setImageError("Please upload at least one villa image.");
      return;
    }

    setImageError("");

    roomData.images.forEach((img) => {
      if (img instanceof File) {
        formData.append("images", img);
      }
    });

    try {
      setLoading(true);

      const url = isEdit ? `/api/room/update/${id}` : "/api/room/add";
      const method = isEdit ? axios.put : axios.post;

      const { data } = await method(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/owner/rooms");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (e, min, max, integer = false) => {
    const { name, value } = e.target;

    if (value === "") {
      setRoomData((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    const num = integer ? parseInt(value, 10) : Number(value);

    if (
      !isNaN(num) &&
      num >= min &&
      (max === null || num <= max) &&
      (!integer || Number.isInteger(num))
    ) {
      setRoomData((prev) => ({ ...prev, [name]: num }));
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchRoom = async () => {
      try {
        const { data } = await axios.get("/api/room/get-all");

        if (data.success) {
          const room = data.rooms.find((r) => r._id === id);

          if (room) {
            setRoomData({
              villa: room.villa._id,
              roomType: room.roomType,
              guests: room.guests,
              pricePerNight: room.pricePerNight,
              description: room.description,
              amenities: room.amenities,
              images: room.images,
              isAvailable: room.isAvailable,
              meals: room.meals || {
                breakfast: false,
                lunch: false,
                dinner: false,
              },
            });
          }
        }
      } catch (error) {
        toast.error("Failed to fetch room");
      }
    };

    fetchRoom();
  }, [id]);

  return (
    <div className="py-10 flex flex-col justify-between bg-[#1E1E1E]/90">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="md:p-10 p-4 space-y-5 max-w-lg"
      >
        <h2 className="text-white font-bold text-3xl">
          {isEdit ? "Update Room" : "Register New Room"}
        </h2>
        <div>
          <p className="text-base font-medium">Room Image</p>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    type="file"
                    accept="image/*"
                    id={`image${index}`}
                    hidden
                    onChange={(e) => {
                      handleImageChange(e, index);
                      setImageError("");
                    }}
                  />
                  <img
                    className="max-w-24 rounded-md cursor-pointer"
                    src={
                      roomData.images[index]
                        ? typeof roomData.images[index] === "string"
                          ? roomData.images[index]
                          : URL.createObjectURL(roomData.images[index])
                        : "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/uploadArea.png"
                    }
                    alt="upload"
                    width={100}
                    height={100}
                  />
                </label>
              ))}
          </div>
          {imageError && (
            <p className="text-red-500 text-sm mt-2">{imageError}</p>
          )}
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Room Type
          </label>
          <div ref={suggestionRef} className="relative">
            <input
              name="roomType"
              value={roomData.roomType}
              onChange={handleRoomTypeChange}
              onFocus={() => setShowSuggestions(true)}
              type="text"
              placeholder="Type or select room type"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
              required
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                className="absolute z-50 w-full bg-gray-800 border border-gray-600 rounded mt-1 max-h-52 overflow-y-auto shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {filteredSuggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => selectSuggestion(item)}
                    className="px-3 py-2 cursor-pointer hover:bg-[#6A0DAD]/40 transition"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Guests</label>
            <input
              min={1}
              max={30}
              step={1}
              type="number"
              name="guests"
              value={roomData.guests}
              onChange={(e) => handleNumberChange(e, 1, 30, true)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Room Description
          </label>
          <textarea
            name="description"
            value={roomData.description}
            onChange={handleChange}
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            required
          ></textarea>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Price per person per night
            </label>
            <input
              min={0}
              step={1}
              type="number"
              name="pricePerNight"
              value={roomData.pricePerNight}
              onChange={(e) => handleNumberChange(e, 1, 500000, true)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Room Amenities
          </label>
          <textarea
            name="amenities"
            value={roomData.amenities}
            onChange={handleChange}
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            required
          ></textarea>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-medium">Meals Available</label>

          {["breakfast", "lunch", "dinner"].map((meal) => (
            <label key={meal} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={roomData.meals[meal]}
                onChange={(e) =>
                  setRoomData({
                    ...roomData,
                    meals: {
                      ...roomData.meals,
                      [meal]: e.target.checked,
                    },
                  })
                }
              />
              <span className="capitalize">{meal}</span>
            </label>
          ))}
        </div>

        <div className="w-full flex flex-col gap-1">
          <label htmlFor="">Select Villa</label>
          <select
            name="villa"
            value={roomData.villa}
            onChange={handleChange}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 bg-gray-800"
            required
          >
            <option value="">Select Villa</option>
            {villaData.map((item) => (
              <option key={item._id} value={item._id}>
                {item.villaName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="">
              isAvailable
              <input
                type="checkbox"
                name="isAvailable"
                onChange={handleChange}
                checked={roomData.isAvailable}
                placeholder="0"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 ml-2"
                required
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-2.5 text-white font-medium rounded transition-all duration-200
  ${
    loading
      ? "bg-[#6A0DAD]/60 cursor-not-allowed"
      : "bg-[#6A0DAD] hover:bg-[#5a0aa0]"
  }`}
        >
          {loading
            ? isEdit
              ? "Updating..."
              : "Adding..."
            : isEdit
              ? "Update Room"
              : "Add Room"}
        </button>
      </form>
    </div>
  );
};

export default AddRoom;
