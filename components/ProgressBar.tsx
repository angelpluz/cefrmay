type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = Math.min((current / total) * 100, 100);

  return (
    <div className="rounded-[24px] bg-white/70 p-4 shadow-[0_18px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">
            Story Progress
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            Scene {current} / {total}
          </p>
        </div>
        <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
