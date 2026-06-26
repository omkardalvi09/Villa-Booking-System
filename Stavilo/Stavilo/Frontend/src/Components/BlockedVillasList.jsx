import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";

export default function BlockedVillasList() {
  const { axios } = useContext(AppContext);

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = async () => {
    try {
      const { data } = await axios.get("/api/availability/owner");

      if (data.success) {
        setBlocks(data.blocks);
      }
    } catch {
      toast.error("Failed to load blocked villas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const cancelBlock = async (id) => {
    try {
      const { data } = await axios.delete(`/api/availability/${id}`);

      if (data.success) {
        toast.success("Block removed");

        setBlocks((prev) => prev.filter((b) => b._id !== id));
      }
    } catch {
      toast.error("Failed to remove block");
    }
  };

  const today = new Date();

  if (loading) {
    return <p className="text-gray-400 mt-6">Loading blocked villas...</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("T")[0].split("-");

    return `${day}/${month}/${year}`;
  };
  

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Blocked Villas</h2>

      {blocks.length === 0 && (
        <p className="text-gray-400">No blocked dates found.</p>
      )}

      <div className="space-y-4">
        {blocks.map((block) => {
          const checkInPassed = new Date(block.checkIn) < today;

          return (
            <div
              key={block._id}
              className="bg-[#111827] p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  {block.villa?.villaName || "Villa"}
                </h3>

                <p className="text-sm text-gray-300">
                  {formatDate(block.checkIn)} → {formatDate(block.checkOut)}d
                </p>

                <p className="text-sm text-gray-400">
                  {block.reason || "No reason"} • {block.source}
                </p>
              </div>

              <button
                disabled={checkInPassed}
                onClick={() => cancelBlock(block._id)}
                className={`px-4 py-2 rounded text-white ${
                  checkInPassed
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Cancel
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
