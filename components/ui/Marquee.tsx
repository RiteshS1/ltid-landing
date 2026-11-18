/** Slow ticker band. Pure CSS so it costs nothing at runtime. */
export default function Marquee({ text, className = "" }: { text: string; className?: string }) {
  const row = Array.from({ length: 4 }, () => text).join("");
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div className="marquee-track font-display text-sm font-bold uppercase tracking-[0.18em] md:text-base">
        <span className="whitespace-pre pr-0">{row}</span>
        <span className="whitespace-pre">{row}</span>
      </div>
    </div>
  );
}
