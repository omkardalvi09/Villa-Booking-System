function SkeletonRoomCard() {
  return (
    <div className="max-w-80 bg-[#1E1E1E]/90 rounded-xl overflow-hidden border border-[#2A2A2A] animate-pulse">
      
      {/* Image */}
      <div className="w-full h-52 bg-gray-700"></div>

      {/* Title */}
      <div className="px-4 pt-4 space-y-3">
        <div className="h-5 bg-gray-700 rounded w-3/4"></div>

        {/* Price + Button */}
        <div className="flex justify-between items-center pb-4">
          <div className="h-4 w-20 bg-gray-600 rounded"></div>
          <div className="h-8 w-24 bg-gray-600 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonRoomCard;