import type { GameData } from "@/lib/gameEngine";

type StageSelectScreenProps = {
  completedStageIds: string[];
  currentStageId: string | null;
  onBack: () => void;
  onSelectStage: (stageId: string) => void;
  stages: GameData[];
  unlockedStageIds: string[];
  xp: number;
};

export default function StageSelectScreen({
  completedStageIds,
  currentStageId,
  onBack,
  onSelectStage,
  stages,
  unlockedStageIds,
  xp,
}: StageSelectScreenProps) {
  return (
    <section className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#67e8f9_0%,rgba(103,232,249,0.12)_16%,transparent_42%),linear-gradient(180deg,#111827_0%,#020617_100%)] text-white">
      <div className="px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-200 transition hover:-translate-y-0.5"
        >
          Back
        </button>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Stage Select
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              Choose Your Route
            </h2>
          </div>
          <div className="rounded-full bg-white/8 px-4 py-2 text-right backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
              XP
            </p>
            <p className="text-lg font-bold text-amber-300">{xp}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const unlocked = unlockedStageIds.includes(stage.id);
            const completed = completedStageIds.includes(stage.id);
            const active = currentStageId === stage.id;

            return (
              <button
                key={stage.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectStage(stage.id)}
                className={`w-full rounded-[28px] border px-5 py-5 text-left transition ${
                  unlocked
                    ? "border-white/12 bg-white/8 text-white shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md hover:-translate-y-0.5 active:scale-[0.99]"
                    : "border-white/6 bg-white/4 text-slate-500"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
                      Stage {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-bold">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300/88">
                      {stage.stage ?? "Adventure Route"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {completed ? (
                      <span className="rounded-full bg-emerald-400/18 px-3 py-1 text-xs font-bold text-emerald-300">
                        Cleared
                      </span>
                    ) : null}
                    {active ? (
                      <span className="rounded-full bg-fuchsia-500/18 px-3 py-1 text-xs font-bold text-fuchsia-200">
                        Active
                      </span>
                    ) : null}
                    {!unlocked ? (
                      <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-slate-400">
                        Locked
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
