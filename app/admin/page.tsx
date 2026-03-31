import { getResearchDashboardData } from "@/lib/research";
import { getAdminCredentials, getAdminSession } from "@/lib/session";

import { loginAdminAction, logoutAdminAction } from "./actions";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminPage(props: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const adminSession = await getAdminSession();
  const adminCredentials = getAdminCredentials();

  if (!adminSession) {
    return (
      <main className="min-h-[100dvh] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl items-center justify-center">
          <section className="w-full max-w-md rounded-[36px] border border-white/10 bg-slate-950/82 p-7 shadow-[0_36px_90px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Admin Access
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.05em]">
              Research Dashboard
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Sign in to review participant data, stage performance, and result
              summaries collected from the game.
            </p>

            {searchParams.error === "invalid" ? (
              <div className="mt-5 rounded-[22px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                Invalid admin username or password.
              </div>
            ) : null}

            {adminCredentials.usingDefaults ? (
              <div className="mt-5 rounded-[22px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                Admin is still using default credentials from <code>.env</code>.
                Change them before collecting real research data.
              </div>
            ) : null}

            <form action={loginAdminAction} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Admin Username
                </span>
                <input
                  required
                  name="username"
                  className="w-full rounded-[20px] border border-white/12 bg-white/8 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500"
                  defaultValue={adminCredentials.usingDefaults ? adminCredentials.username : ""}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Password
                </span>
                <input
                  required
                  type="password"
                  name="password"
                  className="w-full rounded-[20px] border border-white/12 bg-white/8 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-[22px] bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 px-5 py-4 text-base font-black text-slate-950 shadow-[0_20px_50px_rgba(34,211,238,0.28)] transition hover:-translate-y-0.5"
              >
                Open Dashboard
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const dashboard = await getResearchDashboardData(adminSession.accessToken);

  return (
    <main className="min-h-[100dvh] px-5 py-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[36px] border border-white/10 bg-slate-950/82 p-6 shadow-[0_36px_90px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Admin Dashboard
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                Phetchabun Research Control Room
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Review participant identity, live progress, and stage outcomes
                collected from the game sessions.
              </p>
            </div>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="rounded-full border border-white/12 bg-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.26em] text-slate-100 transition hover:-translate-y-0.5"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
              Total Players
            </p>
            <p className="mt-3 text-4xl font-black">{dashboard.summary.totalPlayers}</p>
            <p className="mt-2 text-sm text-slate-300">
              Unique UID records saved in the research database.
            </p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
              Stage Attempts
            </p>
            <p className="mt-3 text-4xl font-black">{dashboard.summary.totalAttempts}</p>
            <p className="mt-2 text-sm text-slate-300">
              Total completion events captured across every player.
            </p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
              Highest XP
            </p>
            <p className="mt-3 text-4xl font-black">{dashboard.summary.highestXp}</p>
            <p className="mt-2 text-sm text-slate-300">
              Top total XP observed in synced progress data.
            </p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
              Avg XP
            </p>
            <p className="mt-3 text-4xl font-black">
              {dashboard.summary.averageXp.toFixed(1)}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Average synced XP across active player progress rows.
            </p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
              Avg Stars
            </p>
            <p className="mt-3 text-4xl font-black">
              {dashboard.summary.averageStars.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Average star rating per recorded stage result.
            </p>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">
              Progress Rows
            </p>
            <p className="mt-3 text-4xl font-black">
              {dashboard.summary.totalProgressRecords}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Players whose latest progress has been synced from the client.
            </p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  Participants
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                  Player Directory
                </h2>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  <tr>
                    <th className="pb-3 pr-4">Player</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Current Stage</th>
                    <th className="pb-3 pr-4">XP</th>
                    <th className="pb-3 pr-4">Attempts</th>
                    <th className="pb-3">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.playerRows.length > 0 ? (
                    dashboard.playerRows.map((player) => (
                      <tr key={player.id} className="border-t border-white/6">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-white">{player.username}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                            {player.uid}
                          </p>
                        </td>
                        <td className="py-4 pr-4 text-slate-300">{player.phone}</td>
                        <td className="py-4 pr-4 text-slate-300">
                          {player.progress?.currentStageId ?? "No progress yet"}
                        </td>
                        <td className="py-4 pr-4 font-bold text-amber-300">
                          {player.progress?.xp ?? 0}
                        </td>
                        <td className="py-4 pr-4 text-slate-300">{player.totalAttempts}</td>
                        <td className="py-4 text-slate-300">
                          {formatDateTime(player.lastActiveAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-slate-400" colSpan={6}>
                        No player data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Stage Breakdown
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Research Summary By Stage
            </h2>

            <div className="mt-5 space-y-3">
              {dashboard.stageBreakdown.length > 0 ? (
                dashboard.stageBreakdown.map((stage) => (
                  <article
                    key={stage.stageId}
                    className="rounded-[24px] border border-white/8 bg-white/6 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                          {stage.stageLabel}
                        </p>
                        <h3 className="mt-2 text-lg font-bold">{stage.stageTitle}</h3>
                      </div>
                      <div className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white">
                        {stage.attempts} attempts
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Avg Stars
                        </p>
                        <p className="mt-1 text-xl font-bold text-amber-300">
                          {stage.averageStars.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Avg Stage XP
                        </p>
                        <p className="mt-1 text-xl font-bold text-emerald-300">
                          {stage.averageStageXp.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/8 bg-white/6 p-4 text-sm text-slate-400">
                  No stage completions recorded yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Recent Results
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
            Latest Stage Completions
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">When</th>
                  <th className="pb-3 pr-4">Player</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Stage</th>
                  <th className="pb-3 pr-4">Stars</th>
                  <th className="pb-3 pr-4">Stage XP</th>
                  <th className="pb-3">Total XP</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentResults.length > 0 ? (
                  dashboard.recentResults.map((result, index) => (
                    <tr
                      key={`${result.playerUid}-${result.stageId}-${index}`}
                      className="border-t border-white/6"
                    >
                      <td className="py-4 pr-4 text-slate-300">
                        {formatDateTime(result.completedAt)}
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-bold text-white">{result.playerUsername}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                          {result.playerUid}
                        </p>
                      </td>
                      <td className="py-4 pr-4 text-slate-300">{result.playerPhone}</td>
                      <td className="py-4 pr-4 text-slate-300">
                        {result.stageLabel} / {result.stageTitle}
                      </td>
                      <td className="py-4 pr-4 font-bold text-amber-300">{result.stars}</td>
                      <td className="py-4 pr-4 font-bold text-emerald-300">
                        {result.stageXp}
                      </td>
                      <td className="py-4 font-bold text-white">{result.totalXp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={7}>
                      No stage result data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
