import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { Phone, Star, MapPin } from "lucide-react";
import toast from "react-hot-toast";

function AllVillas() {
  const { navigate, axios } = useContext(AppContext);
  const [villaData, setVillaData] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const fetchOwnerVillas = async () => {
    try {
      const { data } = await axios.get("/api/villa/get");
      if (data.success) {
        setVillaData(data.villas);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchOwnerVillas();
  }, []);

  //  DELETE VILLA
  const deleteVilla = async (id) => {
    try {
      setDeletingId(id);
      const { data } = await axios.delete("/api/villa/delete/" + id);

      if (data.success) {
        toast.success(data.message);
        fetchOwnerVillas();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center bg-[#1E1E1E] rounded-2xl shadow-xl p-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Your Villas</h1>
            <p className="text-white/70">Manage all your registered villas</p>
          </div>
          <button
            className="bg-[#6A0DAD] text-white px-6 py-2 rounded-md"
            onClick={() => navigate("/owner/register-villa")}
          >
            Register Villa
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#1E1E1E]/90 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-black to-indigo-800 text-white">
                <tr>
                  <th className="px-6 py-4 ml-2">VILLA</th>
                  <th className="px-6 py-4 ml-2">LOCATION</th>
                  <th className="px-6 py-4 ml-2">CONTACT</th>
                  <th className="px-6 py-4 text-left">RATING</th>
                  <th className="px-6 py-4 text-left">Pricing</th>
                  <th className="px-6 py-4 text-left">AMENITIES</th>
                  <th className="px-6 py-4 text-left">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {villaData.map((villa, index) => (
                  <tr
                    key={villa._id}
                    className={`${
                      index % 2 === 0 ? "bg-[#1E1E1E]" : "bg-[#2A2A2A]"
                    } hover:bg-[#3A3A3A] transition`}
                  >
                    {/* Villa */}
                    <td className="px-6 py-5 w-1/4">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            villa.images?.length
                              ? villa.images[0]
                              : "/no-image.png"
                          }
                          alt={villa.villaName}
                          className="w-20 h-16 rounded-lg object-cover"
                        />
                        <span className="text-white font-semibold">
                          {villa.villaName}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-5 text-white/80 text-base">
                      <div className="flex items-top gap-1">
                        <MapPin size={16} />
                        {villa.villaAddress}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-5 text-white/80">
                      <div className="flex items-center justify-center whitespace-nowrap gap-2">
                        <Phone size={16} />
                        <span>+91-{villa.villaContactNo}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-5 text-white/80 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <Star
                          size={16}
                          className="text-yellow-400 fill-current"
                        />
                        <span>{villa.rating}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-5 text-green-500 font-bold">
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap">
                          ₹ {villa.price}
                        </span>
                        <span className="text-xs text-purple-400 font-lg whitespace-nowrap">
                          {villa.pricingModel === "per_person"
                            ? "/ Person / Night"
                            : "/ Night"}
                        </span>
                      </div>
                    </td>

                    {/* Amenities */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {villa.amenities?.split(",").map((a, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-full"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5 flex flex-col gap-2">
                      <button
                        onClick={() =>
                          navigate(`/owner/register-villa/${villa._id}`)
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full"
                      >
                        update
                      </button>
                      <button
                        onClick={() => deleteVilla(villa._id)}
                        disabled={deletingId === villa._id}
                        className={`px-4 py-1 rounded-full text-white ${
                          deletingId === villa._id
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {deletingId === villa._id ? "Deleting..." : "Delete"}
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

export default AllVillas;
