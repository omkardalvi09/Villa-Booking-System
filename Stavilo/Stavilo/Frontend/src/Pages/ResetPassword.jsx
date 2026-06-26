import { useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();
  const { axios, navigate } = useContext(AppContext);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/user/reset-password/${token}`,
        { password }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D80] text-[#eddbcd] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <section className="rounded-2xl border bg-[#1E1E1E]/80 backdrop-blur-lg shadow-xl overflow-hidden">
          
          {/* Header */}
          <header className="px-6 pt-6 pb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD369] to-[#6A0DAD] bg-clip-text text-transparent">
              Stavilo
            </h1>
            <p className="mt-1 text-sm text-[#CCCCCC]">
              Create a new secure password
            </p>
          </header>

          {/* Form */}
          <form onSubmit={submitHandler} className="px-6 py-6 space-y-5">
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#B3B3B3]">
                New Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#333333] bg-[#1E1E1E80]
                  px-3 py-2 pr-14 text-white placeholder-[#888888] shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-[#c0b283]
                  focus:border-[#FFD369]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                  text-xs font-medium text-[#FFD369] hover:text-white"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#6A0DAD] px-5 py-2
              font-medium text-white transition
              hover:bg-[#FFD369] hover:text-[#6A0DAD]
              disabled:opacity-60"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>

            {/* Back to login */}
            <p className="text-center text-sm text-[#404a42]">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-[#FFD369] underline underline-offset-4 hover:text-white"
              >
                Login
              </Link>
            </p>
          </form>
        </section>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#eddbcd]/80">
          © {new Date().getFullYear()} Stavilo
        </p>
      </div>
    </main>
  );
}