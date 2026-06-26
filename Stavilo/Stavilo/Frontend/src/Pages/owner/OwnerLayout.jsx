import {
  Warehouse,
  CalendarArrowDown,
  Bed,
  TrendingUp,
  CalendarX,
  User,
  UserCircle,
} from "lucide-react";
import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

function OwnerLayout() {
  const location = useLocation();

  const { owner, setOwner, axios, ownerName } = useContext(AppContext);

  const sidebarLinks = [
    { name: "Villas", path: "/owner", icon: <Warehouse /> },
    { name: "Rooms", path: "/owner/rooms", icon: <Bed /> },
    { name: "Bookings", path: "/owner/bookings", icon: <CalendarArrowDown /> },
    { name: "Earnings", path: "/owner/earnings", icon: <TrendingUp /> },
    {
      name: "Blocked Dates",
      path: "/owner/blocked-dates",
      icon: <CalendarX />,
    },
  ];

  const navigate = useNavigate();
  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        toast.success(data.message);
        setOwner(false);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-black transition-all duration-300">
        <Link to="/owner" className="flex items-center gap-3 select-none">
          <span className="flex font-extrabold text-2xl md:text-3xl tracking-wide">
            {"Stavilo".split("").map((char, index) => (
              <span
                key={index}
                className={`
          inline-block cursor-pointer
          transition-all duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          hover:scale-125
          hover:-translate-y-1
          hover:font-black
          hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.55)]
          
          ${
            index === 0
              ? "text-yellow-300 hover:text-amber-400 dark:hover:text-yellow-300 scale-125 -translate-y-0.5 mr-0.5 drop-shadow-[0_0_10px_rgba(250,204,21,0.55)]"
              : "text-zinc-200 dark:text-zinc-200 hover:text-yellow-500 dark:hover:text-yellow-400"
          }
        `}
              >
                {char}
              </span>
            ))}
          </span>
        </Link>
        <div className="flex items-center gap-10 text-white/80">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-white/90">
            <UserCircle size={22} className="text-yellow-400" />
            <p className="text-sm font-medium">{ownerName || "Owner"}</p>
          </div>
          <button
            onClick={logout}
            className="border rounded-full text-sm px-4 py-1 text-red-500 hover:bg-red-500 hover:border-red-700 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="md:w-64 w-16 border-r h-[550px] text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
          {sidebarLinks.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                to={item.path}
                key={index}
                className={`flex items-center py-3 px-4 gap-3 transition-all
                  ${
                    isActive
                      ? "bg-indigo-500/20 border-r-4 border-indigo-500 text-indigo-400 font-semibold"
                      : "hover:bg-indigo-400/20 text-gray-300"
                  }
                `}
              >
                {item.icon}
                <p className="md:block hidden text-center">{item.name}</p>
              </Link>
            );
          })}
        </div>

        <div className="flex-1 flex justify-center overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default OwnerLayout;
