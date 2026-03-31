type ResultScreenProps = {
  canAdvance: boolean;
  stageLabel: string;
  stars: number;
  title: string;
  totalXp: number;
  onNextStage: () => void;
  onReplay: () => void;
  onStageSelect: () => void;
};

export default function ResultScreen({
  canAdvance,
  onNextStage,
  onReplay,
  onStageSelect,
  stageLabel,
  stars,
  title,
  totalXp,
}: ResultScreenProps) {
  return (
    <section className="relative flex h-full flex-col justify-end overflow-hidden px-5 pb-6 pt-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f59e0b_0%,rgba(245,158,11,0.2)_20%,transparent_52%),linear-gradient(180deg,#0f172a_0%,#111827_52%,#020617_100%)]" />
      <div className="relative z-10 rounded-[32px] border border-white/12 bg-white/8 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-fuchsia-200">
          Result
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-200/88">
          {stageLabel} complete. Alex is ready for the next journey.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-4xl">
          {Array.from({ length: 3 }, (_, index) => (
            <span key={index}>{index < stars ? "⭐" : "☆"}</span>
          ))}
        </div>

        <div className="mt-6 rounded-[24px] bg-slate-950/58 px-5 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
            Total XP
          </p>
          <p className="mt-2 text-3xl font-black text-amber-300">{totalXp}</p>
        </div>

        <div className="mt-6 space-y-3">
          {canAdvance ? (
            <button
              type="button"
              onClick={onNextStage}
              className="w-full rounded-[24px] bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-500 px-5 py-4 text-base font-bold text-white shadow-[0_22px_44px_rgba(91,33,182,0.34)] transition hover:-translate-y-0.5 active:scale-[0.985]"
            >
              Next Stage
            </button>
          ) : null}

          <button
            type="button"
            onClick={onReplay}
            className="w-full rounded-[24px] border border-white/12 bg-white/8 px-5 py-4 text-base font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 active:scale-[0.985]"
          >
            Replay Stage
          </button>
          <button
            type="button"
            onClick={onStageSelect}
            className="w-full rounded-[24px] border border-white/12 bg-white/8 px-5 py-4 text-base font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 active:scale-[0.985]"
          >
            Stage Select
          </button>
        </div>
      </div>
    </section>
  );
}
