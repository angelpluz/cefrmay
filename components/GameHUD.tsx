import ProgressBar from "@/components/ProgressBar";

type GameHUDProps = {
  current: number;
  stageName: string;
  total: number;
  xp: number;
  xpBurst: number | null;
};

export default function GameHUD({
  current,
  stageName,
  total,
  xp,
  xpBurst,
}: GameHUDProps) {
  return (
    <header className="sticky top-0 z-20 rounded-b-[28px] border-b border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900/92 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-[0_20px_40px_rgba(15,23,42,0.32)] backdrop-blur-xl">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">
            {stageName}
          </p>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white">
          {current}/{total}
        </div>
        <div className="relative text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
            XP
          </p>
          <p className="text-lg font-bold text-amber-300">{xp}</p>
          {xpBurst !== null ? (
            <span className="xp-burst absolute left-1/2 top-full text-sm font-bold text-emerald-300">
              +{xpBurst} XP
            </span>
          ) : null}
        </div>
      </div>

      <ProgressBar current={current} total={total} />
    </header>
  );
}
