import React, { useContext, useEffect } from "react";
import { AppContext } from "../Context/AppContext";
import { useParams } from "react-router-dom";

function Loader() {
  const { navigate } = useContext(AppContext);
  const { nextUrl } = useParams();

  useEffect(() => {
    if (nextUrl) {
      setTimeout(() => {
        navigate(`/${nextUrl}`);
      }, 5000);
    }
  }, [nextUrl]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full w-20 h-20 border-4 border-gray-300 border-t-blue-600"></div>
    </div>
  );
}

export default Loader;
