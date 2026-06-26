import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";

export default function BlockedDates() {
  const { axios } = useContext(AppContext);

  const [villas, setVillas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [blockedList, setBlockedList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    villa: "",
    rooms: [],
    checkIn: "",
    checkOut: "",
    reason: "",
    source: "offline",
  });

  useEffect(() => {
    fetchVillas();
    fetchBlocked();
  }, []);

  const fetchVillas = async () => {
    try {
      const { data } = await axios.get("/api/villa/owner");
      if (data.success) setVillas(data.villas);
    } catch {
      toast.error("Failed to load villas");
    }
  };

  const fetchBlocked = async () => {
    try {
      const { data } = await axios.get("/api/availability");
      if (data.success) setBlockedList(data.blocks);
    } catch {
      toast.error("Failed to load blocked data");
    }
  };

  useEffect(() => {
    if (!form.villa) return;
    const selectedVilla = villas.find((v) => v._id === form.villa);
    setRooms(selectedVilla?.rooms || []);
  }, [form.villa, villas]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleRoom = (roomId) => {
    setForm((prev) => ({
      ...prev,
      rooms: prev.rooms.includes(roomId)
        ? prev.rooms.filter((id) => id !== roomId)
        : [...prev.rooms, roomId],
    }));
  };

  const addEntry = async () => {
    if (!form.villa || !form.checkIn || !form.checkOut) {
      return toast.error("Fill required fields");
    }

    try {
      setLoading(true);

      await axios.post("/api/availability", form);

      toast.success("Dates blocked successfully");

      setForm({
        villa: "",
        rooms: [],
        checkIn: "",
        checkOut: "",
        reason: "",
        source: "offline",
      });

      setRooms([]);

      fetchBlocked();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block dates");
    } finally {
      setLoading(false);
    }
  };

  const removeBlock = async (id) => {
    try {
      await axios.delete(`/api/availability/${id}`);
      toast.success("Block removed");
      fetchBlocked();
    } catch {
      toast.error("Failed to remove block");
    }
  };

  const isExpired = (date) => {
    const today = new Date();
    const checkDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today;
  };

  const getVillaName = (villaId) =>
    villas.find((v) => v._id === villaId)?.villaName || "Villa";

  const formatDate = (date) => {
    if (!date) return "";

    const d = date.slice(0, 10);
    const [year, month, day] = d.split("-");

    return `${day}/${month}/${year}`;
  };

  return (
    <div className="p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Block Villa Dates</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addEntry();
        }}
        className="bg-[#1f2937] p-6 rounded-xl space-y-4"
      >
        <select
          required
          name="villa"
          value={form.villa}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[#111827]"
        >
          <option value="">Select Villa</option>
          {villas.map((villa) => (
            <option key={villa._id} value={villa._id}>
              {villa.villaName}
            </option>
          ))}
        </select>

        {rooms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <button
                key={room._id}
                type="button"
                onClick={() => toggleRoom(room._id)}
                className={`px-3 py-1 rounded ${
                  form.rooms.includes(room._id) ? "bg-blue-500" : "bg-gray-700"
                }`}
              >
                {room.roomName}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <input
            required
            type="date"
            name="checkIn"
            value={form.checkIn}
            min={new Date().toISOString().split("T")[0]}
            onChange={handleChange}
            className="p-3 rounded bg-[#111827]"
          />
          <input
            required
            type="date"
            name="checkOut"
            value={form.checkOut}
            min={form.checkIn || new Date().toISOString().split("T")[0]}
            onChange={handleChange}
            className="p-3 rounded bg-[#111827]"
          />
        </div>

        <input
          required
          type="text"
          name="reason"
          placeholder="Reason"
          value={form.reason}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[#111827]"
        />

        <select
          required
          name="source"
          value={form.source}
          onChange={handleChange}
          className="w-full p-3 rounded bg-[#111827]"
        >
          <option value="offline">Offline Booking</option>
          <option value="booking.com">Booking.com</option>
          <option value="airbnb">Airbnb</option>
          <option value="maintenance">Maintenance</option>
          <option value="personal">Personal Use</option>
          <option value="other">Other</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-5 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Add Entry"}
        </button>
      </form>

      {/* ================= LIST ================= */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Blocked Villas</h2>

        {blockedList.length === 0 ? (
          <p className="text-gray-400">No blocked dates</p>
        ) : (
          <div className="space-y-3">
            {blockedList.map((block) => {
              const disabled = isExpired(block.checkIn);

              return (
                <div
                  key={block._id}
                  className="bg-[#111827] p-4 rounded flex justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {block.villa?.villaName || "Villa"}
                    </p>
                    <p>
                      {formatDate(block.checkIn)} → {formatDate(block.checkOut)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {block.reason || "No reason"} • {block.source}
                    </p>
                  </div>

                  <button
                    disabled={disabled}
                    onClick={() => removeBlock(block._id)}
                    className={`px-4 py-2 rounded ${
                      disabled
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 cursor-pointer"
                    }`}
                  >
                    {disabled ? "Expired" : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
