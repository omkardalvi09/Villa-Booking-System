import SkeletonRoomCard from "./SkeletonRoomCard";

function SkeletonRoomGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-12">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRoomCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonRoomGrid;