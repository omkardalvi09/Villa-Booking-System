function SkeletonVillaCard() {
  return (
    <div className="relative bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-xl animate-pulse border border-gray-700 skeleton-shimmer">
      <div className="relative w-full h-56 bg-gray-700">
        <div className="absolute top-3 left-3 w-12 h-6 bg-gray-600 rounded-full"></div>
        <div className="absolute bottom-3 right-3 w-24 h-8 bg-gray-600 rounded-full"></div>
      </div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        <div className="flex gap-2 mt-2">
          <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
          <div className="h-6 w-12 bg-gray-700 rounded-full"></div>
          <div className="h-6 w-10 bg-gray-700 rounded-full"></div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
          <div className="h-4 w-20 bg-gray-600 rounded"></div>
          <div className="h-8 w-24 bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonVillaCard;
