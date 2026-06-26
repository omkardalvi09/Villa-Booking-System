import { useEffect, useState, useContext } from "react";
import { AppContext } from "../Context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function TextReviews() {
  const { axios, user } = useContext(AppContext);
  const { id: villaId } = useParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // ================= FETCH REVIEWS =================
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/${villaId}`);
      if (data.success) setReviews(data.reviews);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= FETCH USER REVIEW =================
  const fetchUserReview = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/user/${villaId}`);
      if (data.success) {
        setUserReview(data.review);

        if (data.review) {
          setText(data.review.text);
          setRating(data.review.rating);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ================= SUBMIT REVIEW =================
  const submitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to add a review");
      navigate("/login", { state: { redirectTo: `/villa/${villaId}` } });
      return;
    }

    if (!text.trim()) {
      toast.error("Review text cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`/api/reviews/${villaId}`, {
        text,
        rating,
      });

      if (data.success) {
        toast.success(data.message);
        setUserReview(data.review);
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    const d = new Date(date);

    const formattedDate = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const formattedTime = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return `${formattedDate} • ${formattedTime}`;
  };

  useEffect(() => {
    fetchReviews();
    if (user) fetchUserReview();
  }, [villaId, user]);

  return (
    <div className="mt-16">
      {/* ================= REVIEWS HEADER ================= */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Guest Reviews
        </h2>
        <span className="text-sm text-gray-400">
          {reviews.length} Review{reviews.length !== 1 && "s"}
        </span>
      </div>

      {/* ================= REVIEWS LIST ================= */}
      {reviews.length === 0 ? (
        <div className="bg-[#1E1E1E]/80 border border-[#2A2A2A] rounded-xl p-6">
          <p className="text-gray-400 text-center">
            No reviews yet. Be the first to review this villa!
          </p>
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="min-w-[300px] p-6 rounded-2xl bg-[#1E1E1E]/90 
                       border border-[#2A2A2A] 
                       hover:border-blue-600/40 
                       transition-all duration-300"
            >
              {/* User + Rating */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-semibold leading-none mb-3">
                    {review.user.name}
                  </p>
                  <div className="text-xs text-gray-300 flex flex-col">
                    <span>Posted: {formatDateTime(review.createdAt)}</span>

                    {review.updatedAt !== review.createdAt && (
                      <span className="text-green-400 flex">
                       Edited: {formatDateTime(review.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 -mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-500"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-300 text-sm leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ================= REVIEW FORM ================= */}
      <div className="mt-14 w-full md:w-[60%] mx-auto bg-[#1E1E1E]/80 border border-[#2A2A2A] rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-1">
          {userReview ? "Update Your Review" : "Write a Review"}
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Share your experience to help other guests
          {userReview && (
            <p className="text-green-400 text-sm mb-2">
              You already reviewed this villa. You can update it.
            </p>
          )}
        </p>

        <form onSubmit={submitReview} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg 
                       bg-black text-white 
                       border border-gray-600 
                       focus:outline-none 
                       focus:ring-2 focus:ring-blue-600/40"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r > 1 && "s"}
                </option>
              ))}
            </select>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Your Review
            </label>
            <textarea
              rows="4"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 rounded-lg 
                       bg-black text-white 
                       border border-gray-600 
                       resize-none 
                       focus:outline-none 
                       focus:ring-2 focus:ring-blue-600/40"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-fit 
                     bg-blue-600 hover:bg-blue-700 
                     px-8 py-3 rounded-xl 
                     text-white font-medium 
                     transition-all duration-300 
                     disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Submitting..."
              : userReview
                ? "Update Review"
                : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TextReviews;
