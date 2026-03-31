"use client";

type AssetPreloadScreenProps = {
  failedCount: number;
  loadedCount: number;
  totalCount: number;
};

export default function AssetPreloadScreen({
  failedCount,
  loadedCount,
  totalCount,
}: AssetPreloadScreenProps) {
  const safeTotal = totalCount || 1;
  const progress = Math.min((loadedCount / safeTotal) * 100, 100);

  return (
    <section className="relative flex h-full flex-col justify-end overflow-hidden px-5 pb-6 pt-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#22d3ee_0%,rgba(34,211,238,0.16)_20%,transparent_45%),radial-gradient(circle_at_bottom,#f97316_0%,rgba(249,115,22,0.15)_18%,transparent_42%),linear-gradient(180deg,#020617_0%,#111827_48%,#030712_100%)]" />
      <div className="absolute inset-x-0 top-0 h-84 bg-[url('/si-thep-bg.jpg')] bg-cover bg-center opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950" />

      <div className="relative z-10">
        <div className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200 backdrop-blur-md">
          Preparing Game
        </div>

        <h1 className="mt-5 max-w-sm text-5xl font-black uppercase leading-[0.94] tracking-[-0.05em]">
          Loading Adventure Assets
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-slate-200/84">
          The game is downloading images before play starts so the installed app
          stays visible even when the connection drops.
        </p>

        <div className="mt-7 rounded-[28px] border border-white/10 bg-white/7 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            <span>Asset Progress</span>
            <span>
              {loadedCount} / {totalCount}
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-4 text-sm text-slate-200">
            {progress >= 100
              ? "Assets ready."
              : "Caching images for the first run..."}
          </p>

          {failedCount > 0 ? (
            <p className="mt-3 rounded-[18px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              {failedCount} asset failed to preload. The game can still try to
              fetch it later when online.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
