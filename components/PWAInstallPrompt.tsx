type PWAInstallPromptProps = {
  canInstall: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  onInstall: () => void;
};

export default function PWAInstallPrompt({
  canInstall,
  isIOS,
  isStandalone,
  onInstall,
}: PWAInstallPromptProps) {
  if (isStandalone || (!canInstall && !isIOS)) {
    return null;
  }

  return (
    <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/8 p-4 text-left text-sm text-cyan-50 shadow-[0_18px_36px_rgba(6,182,212,0.12)] backdrop-blur-md">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
        Install App
      </p>
      {canInstall ? (
        <button
          type="button"
          onClick={onInstall}
          className="mt-3 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
        >
          Add to Home Screen
        </button>
      ) : (
        <p className="mt-3 leading-6 text-cyan-50/88">
          On iPhone, tap Share and choose Add to Home Screen.
        </p>
      )}
    </div>
  );
}
