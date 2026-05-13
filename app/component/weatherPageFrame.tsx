export default function WeatherPageFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-ui-bg-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/MainBackground-blur.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-ui-overlay-weak/55 via-ui-bg-0/20 to-ui-overlay-strong/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,hsl(var(--ui-text-1)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--ui-text-1)/0.18)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ui-accent/70 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6">{children}</div>
    </div>
  );
}
