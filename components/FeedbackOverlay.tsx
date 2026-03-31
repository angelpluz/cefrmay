type FeedbackOverlayProps = {
  message: string;
  status: "correct" | "wrong";
  xpAwarded: number;
};

export default function FeedbackOverlay({
  message,
  status,
  xpAwarded,
}: FeedbackOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-950/48 px-6 backdrop-blur-sm">
      <div
        className={`feedback-pop w-full max-w-sm rounded-[30px] border border-white/15 px-6 py-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.4)] ${
          status === "correct"
            ? "bg-emerald-500/92"
            : "bg-rose-500/92"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
          {status === "correct" ? "Correct" : "Wrong"}
        </p>
        <p className="mt-3 text-lg font-bold leading-7">{message}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="rounded-full bg-white/18 px-4 py-2 text-sm font-bold">
            {xpAwarded > 0 ? `+${xpAwarded} XP` : "0 XP"}
          </span>
          <span className="text-2xl">{status === "correct" ? "✨" : "💥"}</span>
        </div>
      </div>
    </div>
  );
}
