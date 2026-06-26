import { Link } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import VillaCard from "../Components/VillaCard";
import SkeletonGrid from "../Components/SkeletonGrid";

function Villas() {
  const [villaData, setVillaData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);

  const loaderRef = useRef(null);

  // ================= FETCH VILLAS (PAGINATED) =================
  const fetchVillas = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    if (reset) setInitialLoading(true);

    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/villa/get-all",
        {
          params: {
            page,
            limit: 6,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
          },
        },
      );

      if (data.success) {
        setVillaData((prev) =>
          reset ? data.villas : [...prev, ...data.villas],
        );
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error("Error fetching villas", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  
  useEffect(() => {
    fetchVillas();
  }, [page]);

  
  useEffect(() => {
    setVillaData([]);
    setPage(1);
    setHasMore(true);
    fetchVillas(true);
  }, [minPrice, maxPrice]);

  //  INFINITE SCROLL 
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="py-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold text-white my-8 text-center">
        All Villas
      </h1>

      {/*  VILLAS GRID  */}

      {initialLoading ? (
        <SkeletonGrid count={6} />
      ) : villaData.length > 0 ? (  
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {villaData.map((villa) => (
              <VillaCard key={villa._id} villa={villa} />
            ))}
          </div>

          {loading && <SkeletonGrid count={3} />}
        </>
      ) : (
        <p className="text-white mt-6 text-center">No villas found</p>
      )}

      {/*  LOADER  */}
      {hasMore && (
        <div ref={loaderRef} className="text-center text-white my-6">
          <span className="text-gray-400 text-sm">
            {hasMore ? "Scroll to load more" : "No more villas"}
          </span>
        </div>
      )}
    </div>
  );
}

export default Villas;
