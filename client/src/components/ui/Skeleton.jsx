export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-surface-2 via-white/[0.06] to-surface-2 bg-[length:400px_100%] animate-shimmer ${className}`}
    />
  );
}
