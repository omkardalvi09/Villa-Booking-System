import { useContext, useState } from "react";
import { AppContext } from "../Context/AppContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const { axios } = useContext(AppContext);
  const [email, setEmail] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/user/forgot-password", { email });
      data.success ? toast.success(data.message) : toast.error(data.message);
    } catch (error) {
      toast.error("Something went wrong");
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
              Reset your password securely
            </p>
          </header>

          {/* Form */}
          <form
            onSubmit={submitHandler}
            className="px-6 py-6 space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#B3B3B3]">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#333333] bg-[#1E1E1E80] 
                px-3 py-2 text-white placeholder-[#888888] shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-[#c0b283] 
                focus:border-[#FFD369]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-full bg-[#6A0DAD] px-5 py-2 
              font-medium text-white transition 
              hover:bg-[#FFD369] hover:text-[#6A0DAD]"
            >
              Send Reset Link
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