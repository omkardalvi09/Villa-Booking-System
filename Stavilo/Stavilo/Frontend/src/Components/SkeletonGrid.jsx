import SkeletonVillaCard from "./SkeletonVillaCard";

function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonVillaCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonGrid;
