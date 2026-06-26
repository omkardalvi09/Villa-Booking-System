// Login.jsx
import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import toast from "react-hot-toast";

export default function Login() {
  const { setUser, navigate, setOwner, axios } = useContext(AppContext);
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/user/login", formData);

      if (data.success) {
        toast.success(data.message);

        /*  REDIRECT LOGIC  */
        const redirectTo = location.state?.redirectTo;
        const bookingData = location.state?.bookingData;
        const isAvailable = location.state?.isAvailable;

        if (data.user.role === "owner") {
          setOwner(true);
          navigate("/owner");
        } else {
          setUser(true);

          if (redirectTo) {
            navigate(redirectTo, {
              state: {
                bookingData,
                isAvailable,
              },
            });
          } else {
            navigate("/");
          }
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
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
              Sign in to continue exploring boutique villas
            </p>
          </header>

          {/* Form */}
          <form
            onSubmit={submitHandler}
            className="px-6 py-6 space-y-5"
            autoComplete="on"
          >
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#B3B3B3]"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#FFD369] hover:text-[#FFFFFF] transition-colors"
                >
                  Forgot?
                </Link>
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
                      <path d="M9.88 5.09A9.94 9.94 0 0121 12" />
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
            <button
              type="submit"
              className="w-full rounded-full bg-[#6A0DAD] px-5 py-2 font-medium text-white transition hover:bg-[#FFD369] hover:text-[#6A0DAD]"
            >
              Login
            </button>

            {/* Sign up */}
            <p className="text-center text-sm text-[#404a42]">
              New to Stavilo?{" "}
              <Link
                to="/signup"
                className="font-medium text-[#FFD369] underline underline-offset-4 hover:text-white"
              >
                Create an account
              </Link>
            </p>
          </form>
        </section>

        <p className="mt-6 text-center text-xs text-[#eddbcd]/80">
          © {new Date().getFullYear()} Stavilo
        </p>
      </div>
    </main>
  );
}
