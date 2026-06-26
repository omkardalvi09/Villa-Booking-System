import { useEffect, useState, useContext, useMemo } from "react";
import { AppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";

function OwnerEarnings() {
  const { axios } = useContext(AppContext);

  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });

  
  const fetchEarnings = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        "/api/bookings/owner/earnings",
        {
          params: {
            startDate,
            endDate,
          },
        }
      );

      if (data.success) {
        const formatted = data.earnings.map((item) => ({
          villaName: item._id,
          earnings: item.totalEarnings,
          bookings: item.totalBookings,
        }));

        setEarnings(formatted);

        setStats(
          data.stats || {
            totalBookings: 0,
            confirmed: 0,
            pending: 0,
            cancelled: 0,
          }
        );
      }
    } catch (error) {
      toast.error("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [startDate, endDate]);

  /* ================= TOTAL CALCULATION ================= */
  const { total, villaTotals } = useMemo(() => {
    const totals = {};
    let grandTotal = 0;

    earnings.forEach((item) => {
      grandTotal += item.earnings;

      if (!totals[item.villaName]) {
        totals[item.villaName] = 0;
      }

      totals[item.villaName] += item.earnings;
    });

    return {
      total: grandTotal,
      villaTotals: totals,
    };
  }, [earnings]);

  return (
    <div className="p-8 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Earnings & Booking Summary
      </h1>

      {/* ================= DATE FILTER ================= */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        />

        <input
          type="date"
          value={endDate}
          min={startDate || ""}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        />
      </div>

      {/* ================= BOOKING STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-600 p-5 rounded-xl shadow">
          <p className="text-sm opacity-80">Total Bookings</p>
          <h2 className="text-2xl font-bold">
            {stats.totalBookings}
          </h2>
        </div>

        <div className="bg-green-600 p-5 rounded-xl shadow">
          <p className="text-sm opacity-80">Confirmed</p>
          <h2 className="text-2xl font-bold">
            {stats.confirmed}
          </h2>
        </div>

        <div className="bg-yellow-500 p-5 rounded-xl shadow">
          <p className="text-sm opacity-80">Pending</p>
          <h2 className="text-2xl font-bold">
            {stats.pending}
          </h2>
        </div>

        <div className="bg-red-600 p-5 rounded-xl shadow">
          <p className="text-sm opacity-80">Cancelled</p>
          <h2 className="text-2xl font-bold">
            {stats.cancelled}
          </h2>
        </div>
      </div>

      {/* ================= TOTAL EARNINGS CARD ================= */}
      <div className="bg-indigo-600 p-6 rounded-xl shadow-lg max-w-md">
        {loading ? (
          <p className="text-gray-200">Loading earnings...</p>
        ) : (
          <>
            <p className="text-sm opacity-80">Total Earnings</p>

            <h2 className="text-3xl font-bold mb-4">
              ₹ {total}
            </h2>

            
            {Object.keys(villaTotals).length > 0 && (
              <div className="border-t border-indigo-400 pt-4 space-y-2">
                {Object.entries(villaTotals).map(
                  ([name, amount]) => (
                    <div
                      key={name}
                      className="flex justify-between text-sm bg-indigo-500 px-3 py-2 rounded"
                    >
                      <span>{name}</span>
                      <span className="font-semibold">
                        ₹ {amount}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

            {total === 0 && (
              <p className="text-gray-200 mt-3">
                No confirmed bookings yet.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OwnerEarnings;