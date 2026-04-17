export function Waveform({ level }: { level: number }) {
  const bars = 20;
  const amp = Math.min(1, level * 3);
  return (
    <div className="flex h-5 items-center gap-0.5" aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const phase = Math.sin((i / bars) * Math.PI);
        const h = 4 + amp * phase * 16;
        return (
          <span
            key={i}
            className="w-0.5 rounded-full bg-teal-500 transition-[height] duration-75"
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}
