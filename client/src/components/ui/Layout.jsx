export default function Layout({ children, navbar }) {
  return (
    <div className="min-h-screen bg-bg text-text relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-gradient-radial-glow" />
      <div className="pointer-events-none fixed -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-gps-from/10 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-gps-to/10 blur-[120px]" />
      {navbar}
      <div className="relative">{children}</div>
    </div>
  );
}
