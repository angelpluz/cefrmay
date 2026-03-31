import PWAInstallPrompt from "@/components/PWAInstallPrompt";

type StartScreenProps = {
  canContinue: boolean;
  canInstall: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  onContinue: () => void;
  onInstall: () => void;
  onNewGame: () => void;
};

export default function StartScreen({
  canContinue,
  canInstall,
  isIOS,
  isStandalone,
  onContinue,
  onInstall,
  onNewGame,
}: StartScreenProps) {
  return (
    <section className="relative flex h-full flex-col justify-end overflow-hidden px-5 pb-6 pt-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#67e8f9_0%,rgba(103,232,249,0.18)_22%,transparent_48%),linear-gradient(180deg,#0f172a_0%,#111827_52%,#030712_100%)]" />
      <div className="absolute inset-x-0 top-0 h-84 bg-[url('/si-thep-bg.jpg')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-transparent via-slate-950/35 to-slate-950" />

      <div className="relative z-10">
        <div className="mb-5 inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200 backdrop-blur-md">
          Phetchabun Adventure
        </div>

        <h1 className="max-w-xs text-5xl font-black uppercase leading-[0.94] tracking-[-0.05em]">
          Mobile Story Quest
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-slate-200/84">
          Explore temples, markets, and walking streets with Alex in a real
          mobile-game flow.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onNewGame}
            className="w-full rounded-[24px] bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-500 px-5 py-4 text-base font-bold text-white shadow-[0_22px_44px_rgba(91,33,182,0.34)] transition hover:-translate-y-0.5 active:scale-[0.985]"
          >
            Start Adventure
          </button>

          {canContinue ? (
            <button
              type="button"
              onClick={onContinue}
              className="w-full rounded-[24px] border border-white/14 bg-white/8 px-5 py-4 text-base font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 active:scale-[0.985]"
            >
              Continue
            </button>
          ) : null}
        </div>

        <div className="mt-4">
          <PWAInstallPrompt
            canInstall={canInstall}
            isIOS={isIOS}
            isStandalone={isStandalone}
            onInstall={onInstall}
          />
        </div>
      </div>
    </section>
  );
}
