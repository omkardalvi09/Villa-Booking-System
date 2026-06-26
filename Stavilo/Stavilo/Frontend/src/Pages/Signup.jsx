// Signup.jsx
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { toast } from "react-hot-toast";

export default function Signup() {
  const { axios, navigate } = useContext(AppContext);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/user/signup", formData);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Select");

  const countries = ["Owner", "User"];

  const handleSelect = (country) => {
    setSelected(country);
    setIsOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D80] text-[#eddbcd] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <section className="rounded-2xl border bg-[#1E1E1E]/80 backdrop-blur-lg text-[#192231] shadow-xl overflow-hidden">
          {/* Header */}
          <header className="px-6 pt-6 pb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD369] to-[#6A0DAD] bg-clip-text text-transparent">
              Stavilo
            </h1>
            <p className="mt-1 text-sm text-[#CCCCCC]">
              Sign up to continue exploring boutique villas
            </p>
          </header>

          {/* Form */}
          <form
            onSubmit={submitHandler}
            className="px-6 py-6 space-y-5"
            autoComplete="on"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#B3B3B3]"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={onChangeHandler}
                type="text"
                autoComplete="name"
                required
                className="mt-1 w-full rounded-lg border border-[#333333] bg-[#1E1E1E80] px-3 py-2 text-[#FFFFFF] placeholder-[#888888] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c0b283] focus:border-[#FFD369]"
                placeholder="Your Name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#B3B3B3]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={onChangeHandler}
                type="email"
                autoComplete="email"
                required
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                title="Please enter a valid email address (example: name@example.com)"
                className="mt-1 w-full rounded-lg border border-[#333333] bg-[#1E1E1E80] px-3 py-2 text-[#FFFFFF] placeholder-[#888888] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c0b283] focus:border-[#FFD369]"
                placeholder="name@example.com"
              />
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#B3B3B3]"
              >
                Role
              </label>
              <select
                name="role"
                onChange={onChangeHandler}
                value={formData.role}
                required
                className="mt-1 w-full rounded-lg border border-[#333333] bg-[#1E1E1E80] 
             px-3 py-2 text-[#FFFFFF] placeholder-[#888888] shadow-sm 
             focus:outline-none focus:ring-2 focus:ring-[#c0b283] 
             focus:border-[#FFD369] cursor-pointer"
              >
                <option value="" className="bg-[#1E1E1E] text-[#FFFFFF]">
                  Select Your Role
                </option>
                <option value="user" className="bg-[#1E1E1E] text-[#FFFFFF]">
                  User
                </option>
                <option value="owner" className="bg-[#1E1E1E] text-[#FFFFFF]">
                  Owner
                </option>
              </select>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#B3B3B3]"
                >
                  Password
                </label>
              </div>

              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={onChangeHandler}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  spellCheck={false}
                  className="w-full rounded-lg border border-[#333333] bg-[#1E1E1E80] px-3 py-2 pr-12 text-[#FFFFFF] placeholder-[#888888] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c0b283] focus:border-[#FFD369]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-[#404a42] hover:text-[#192231] focus:outline-none focus:ring-2 focus:ring-[#c0b283]"
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58a3 3 0 104.24 4.24" />
                      <path d="M9.88 5.09A9.94 9.94 0 0121 12c-.73 1.22-1.66 2.31-2.74 3.22" />
                      <path d="M6.1 6.1A9.94 9.94 0 003 12c.73 1.22 1.66 2.31 2.74 3.22A13.8 13.8 0 0012 18c1.81 0 3.54-.35 5.08-1" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-[#c0b283]/60 bg-[#6A0DAD] px-5 py-2 font-medium text-[#FFFFFF] shadow-sm transition-colors hover:bg-[#FFD369] hover:text-[#6A0DAD] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#c0b283]"
              >
                Signup
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#c0b283]/60 to-transparent" />

            {/* Login link */}
            <p className="text-center text-sm text-[#404a42]">
              Already have Stavilo account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#FFD369] underline decoration-[#c0b283]/70 underline-offset-4 hover:text-[#FFFFFF]"
              >
                Login Here
              </Link>
            </p>
          </form>
        </section>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-[#eddbcd]/80">
          © {new Date().getFullYear()} Stavilo
        </p>
      </div>
    </main>
  );
}
