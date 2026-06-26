import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const RegisterVilla = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { axios, navigate } = useContext(AppContext);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    villaName: "",
    villaContactNo: "",
    villaDescription: "",
    villaAddress: "",
    rating: "",
    pricingModel: "per_person",
    baseGuests: "",
    extraGuestsAllowed: "",
    extraGuestCharge: "",
    price: "",
    weekDayDiscount: "",
    amenities: "",
    images: [],
    meals: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });

    const { name, value } = e.target;

    if (name === "pricingModel") {
      setData((prev) => ({
        ...prev,
        pricingModel: value,
        extraGuestsAllowed:
          value === "per_person" ? 0 : prev.extraGuestsAllowed,
        extraGuestCharge: value === "per_person" ? 0 : prev.extraGuestCharge,
      }));
      return;
    }

    if (name === "villaContactNo") {
      const onlyNumbers = value.replace(/[^0-9]/g, "");

      setData({
        ...data,
        [name]: onlyNumbers,
      });
    } else {
      setData({
        ...data,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedImages = [...data.images];
      updatedImages[index] = file;
      setData({ ...data, images: updatedImages });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (
      data.pricingModel === "entire_villa" &&
      Number(data.extraGuestsAllowed) > 0 &&
      (!data.extraGuestCharge || Number(data.extraGuestCharge) <= 0)
    ) {
      toast.error("Please enter extra guest charge");
      return;
    }

    const existingImages = data.images.filter((img) => typeof img === "string");

    const formData = new FormData();
    formData.append("villaName", data.villaName);
    formData.append("villaContactNo", data.villaContactNo);
    formData.append("villaDescription", data.villaDescription);
    formData.append("villaAddress", data.villaAddress);
    formData.append("rating", data.rating);
    formData.append("pricingModel", data.pricingModel);
    formData.append("baseGuests", data.baseGuests);
    formData.append("extraGuestsAllowed", data.extraGuestsAllowed);
    formData.append("extraGuestCharge", data.extraGuestCharge);
    formData.append("price", data.price);
    formData.append("weekDayDiscount", data.weekDayDiscount);
    formData.append("amenities", data.amenities);
    formData.append("meals", JSON.stringify(data.meals));
    formData.append("existingImages", JSON.stringify(existingImages));

    const hasImage =
      data.images.length > 0 &&
      data.images.some((img) => img instanceof File || typeof img === "string");

    if (!hasImage) {
      setImageError("Please upload at least one villa image.");
      return;
    }

    setImageError("");

    data.images.forEach((img) => {
      if (img instanceof File) {
        formData.append("images", img);
      }
    });

    try {
      setLoading(true);
      const url = isEdit ? `/api/villa/update/${id}` : "/api/villa/register";

      const method = isEdit ? axios.put : axios.post;

      const { data: res } = await method(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.success) {
        toast.success(res.message);
        navigate("/owner");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (e, min, max) => {
    const { name, value } = e.target;

    if (value === "") {
      setData((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    if (!/^\d+$/.test(value)) return;

    const num = Number(value);

    if (num < min) return;
    if (max !== null && num > max) return;

    setData((prev) => ({
      ...prev,
      [name]: num,
    }));
  };

  const blockInvalidNumberKeys = (e) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchVilla = async () => {
      try {
        const { data: res } = await axios.get(`/api/villa/${id}`);

        if (res.success) {
          const v = res.villa;

          setData({
            villaName: v.villaName || "",
            villaContactNo: v.villaContactNo || "",
            villaDescription: v.villaDescription || "",
            villaAddress: v.villaAddress || "",
            rating: v.rating || "",
            pricingModel: v.pricingModel || "per_person",
            baseGuests: v.baseGuests || "",
            extraGuestsAllowed: v.extraGuestsAllowed || "",
            extraGuestCharge: v.extraGuestCharge || "",
            price: v.price || "",
            weekDayDiscount: v.weekDayDiscount || "",
            amenities: v.amenities || "",
            images: v.images || [],
            meals: v.meals || {
              breakfast: false,
              lunch: false,
              dinner: false,
            },
          });
        }
      } catch (err) {
        toast.error("Failed to fetch villa");
      }
    };

    fetchVilla();
  }, [id]);

  return (
    <div className="py-10 flex flex-col justify-between bg-[#1E1E1E]/90">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <h2 className="text-white font-bold text-3xl">
          {isEdit ? "Update Villa" : "Register New Villa"}
        </h2>
        {/* Get Villa Images */}
        <div>
          <p className="text-base font-medium">Villa Images</p>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`villaImage${index}`}>
                  <input
                    type="file"
                    accept="image/*"
                    id={`villaImage${index}`}
                    hidden
                    onChange={(e) => {
                      handleImageChange(e, index);
                      setImageError("");
                    }}
                  />
                  <img
                    className="max-w-24 rounded-md cursor-pointer"
                    src={
                      data.images[index]
                        ? typeof data.images[index] === "string"
                          ? data.images[index]
                          : URL.createObjectURL(data.images[index])
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

        {/* Get Villa Name */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium">Villa Name</label>
          <input
            name="villaName"
            value={data.villaName}
            onChange={handleChange}
            type="text"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>

        {/* Get Villa villa Contact Number */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium">Villa Contact Number</label>
          <input
            name="villaContactNo"
            value={data.villaContactNo}
            onChange={handleChange}
            type="text"
            maxLength={10}
            inputMode="numeric"
            placeholder="Enter 10 digit number"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>

        {/* Get Villa Description */}
        <div className="flex flex-col gap-1 max-w-md">
          <label
            className="text-base font-medium"
            htmlFor="product-description"
          >
            Villa Description
          </label>
          <textarea
            name="villaDescription"
            value={data.villaDescription}
            onChange={handleChange}
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
            required
          ></textarea>
        </div>

        {/* Get Villa Address */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium">Villa Address</label>
          <textarea
            name="villaAddress"
            value={data.villaAddress}
            onChange={handleChange}
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-2">
          {/* Get Villa Ratings */}
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Rating</label>
            <input
              type="number"
              name="rating"
              min={0}
              max={5}
              step={1}
              value={data.rating}
              onChange={(e) => handleNumberChange(e, 0, 5)}
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

        {/* PRICING MODEL */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Pricing Model</label>

          <label className="text-white/80">
            <input
              type="radio"
              name="pricingModel"
              value="per_person"
              onChange={handleChange}
              checked={data.pricingModel === "per_person"}
            />
            Price per person per night
          </label>

          <label className="text-white/80">
            <input
              type="radio"
              name="pricingModel"
              value="entire_villa"
              onChange={handleChange}
            />
            Fixed price for entire villa
          </label>
        </div>

        {/* Get Villa Guests & Pricing*/}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Guests Included</label>
            <input
              type="number"
              name="baseGuests"
              min={1}
              max={50}
              step={1}
              value={data.baseGuests}
              onChange={(e) => handleNumberChange(e, 1, 50)}
              onKeyDown={blockInvalidNumberKeys}
              className="outline-none md:py-2.5 py-2 px-3 w-32 rounded border border-gray-500/40"
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium">Price (₹)</label>
            <input
              type="number"
              name="price"
              min={1}
              step={1}
              value={data.price}
              onChange={(e) => handleNumberChange(e, 1, null, true)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>

          {data.pricingModel !== "per_person" && (
            <>
              <div>
                <label>Extra Guests Allowed</label>
                <input
                  type="number"
                  name="extraGuestsAllowed"
                  min={0}
                  max={10}
                  step={1}
                  value={
                    data.extraGuestsAllowed === "" ? 0 : data.extraGuestsAllowed
                  }
                  onChange={(e) => handleNumberChange(e, 0, 10)}
                  onKeyDown={blockInvalidNumberKeys}
                  className="outline-none md:py-2.5 py-2 px-3 w-32 rounded border border-gray-500/40"
                />
              </div>

              <div>
                <label>Extra Guest Charge (₹)</label>
                <input
                  type="number"
                  name="extraGuestCharge"
                  min={0}
                  step={1}
                  value={data.extraGuestCharge}
                  onChange={(e) => handleNumberChange(e, 0, null)}
                  onKeyDown={blockInvalidNumberKeys}
                  className="outline-none md:py-2.5 py-2 px-3 w-32 rounded border border-gray-500/40"
                />
              </div>
            </>
          )}
        </div>

        {/* Week Days Discount */}
        <div className="flex flex-col gap-1 ">
          <label>Week Days Discount in % (Mon-Fri)</label>
          <input
            type="number"
            name="weekDayDiscount"
            min={0}
            max={100}
            step={1}
            value={data.weekDayDiscount === "" ? 0 : data.weekDayDiscount}
            onChange={(e) => handleNumberChange(e, 0, 100)}
            onKeyDown={blockInvalidNumberKeys}
            className="outline-none md:py-2.5 py-2 px-3 w-32 rounded border border-gray-500/40"
          />
        </div>

        {/* Get Villa Amenities */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium">Villa Amenities</label>
          <textarea
            name="amenities"
            value={data.amenities}
            onChange={handleChange}
            rows={4}
            placeholder="Separate each amenities by  ',' 
eg. WiFi, Pool"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-medium">Meals Available</label>

          {["breakfast", "lunch", "dinner"].map((meal) => (
            <label key={meal} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={data.meals[meal]}
                onChange={(e) =>
                  setData({
                    ...data,
                    meals: {
                      ...data.meals,
                      [meal]: e.target.checked,
                    },
                  })
                }
              />
              {meal}
            </label>
          ))}
        </div>

        {/* Submit Form */}
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
              : "Registering..."
            : isEdit
              ? "Update Villa"
              : "Register Villa"}
        </button>
      </form>
    </div>
  );
};

export default RegisterVilla;
