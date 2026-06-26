import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import profileIcon from "../assets/profile_icon.png";
import download from "../assets/download.png";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser, axios } = useContext(AppContext);
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Villas", path: "/Villas" },
    { name: "Rooms", path: "/rooms" },
    { name: "About", path: "/about" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        toast.success(data.message);
        setUser(false);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      {/* Dummy content to test scrolling */}
      <p className="w-10 h-[100px]"></p>

      <nav
        className={`fixed top-0 left-0 w-full flex items-center justify-between 
          px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50
          ${
            isScrolled
              ? "bg-[#1E1E1E]/60 shadow-md text-[#FFFFFF] backdrop-blur-lg py-3 md:py-4"
              : "bg-[#1E1E1E] text-white backdrop-blur-md py-4 md:py-6"
          }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 select-none">
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className="group flex flex-col gap-0.5"
            >
              {link.name}
              <div className="bg-current h-0.5 w-0 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative group inline-block">
              <img
                src={profileIcon}
                alt="Profile"
                className="w-12 h-12 rounded-full cursor-pointer border-2 border-white"
              />
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-0 pt-2 w-40 bg-white shadow-lg rounded-md opacity-0 group-hover:opacity-100 group-hover:visible invisible transition duration-300 z-50">
                <ul className="py-2">
                  <li>
                    <Link
                      to={"/my-bookings"}
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    >
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={"/favourites"}
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    >
                      Favourites
                    </Link>
                  </li>
                  <li onClick={logout}>
                    <Link className=" px-5 py-3 text-sm font-medium text-red-500 block hover:bg-red-200">
                      Log out
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-2.5 rounded-full ml-4 transition-all duration-500 bg-[#6A0DAD] text-[#FFFFFF] cursor-pointer hover:bg-[#FFD369] hover:text-[#6A0DAD] "
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <svg
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-6 w-6 cursor-pointer"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-full h-screen bg-white text-base 
            flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 
            transition-all duration-500 ${
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <button
            className="absolute top-4 right-4"
            onClick={() => setIsMenuOpen(false)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {navLinks.map((link, i) => (
            <Link key={i} to={link.path} onClick={() => setIsMenuOpen(false)}>
              {link.name}
            </Link>
          ))}

          {/* User Actions (Mobile Only) */}
          {user ? (
            <div className="flex flex-col gap-3 mt-4 w-full px-10">
              <Link
                to="/my-bookings"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3 rounded-lg 
                 transition duration-200"
              >
                My Bookings
              </Link>

              <Link
                to="/favourites"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3 rounded-lg transition duration-200"
              >
                Favourites
              </Link>

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full py-3 rounded-lg text-red-500
                  transition duration-200"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
              className="px-8 py-3 rounded-full mt-4
               bg-blue-400 text-black
               hover:bg-indigo-600 hover:text-white
               transition-all duration-300"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
