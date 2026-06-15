import DashboardBarChart from "./DashboardBarChart";
import DashboardMetricCard from "./DashboardMetricCard";
import {
  buildPlayerScoreDistribution,
  buildStageAnalytics,
  formatDateTime,
  formatDecimal,
  getQueryValue,
  isInScoreRange,
  SCORE_RANGE_OPTIONS,
  type SearchParamsInput,
} from "./dashboard-utils";
import { loginAdminAction, logoutAdminAction } from "./actions";

import { getResearchDashboardData } from "@/lib/research";
import type { StageAnswerRecordInput } from "@/lib/research-contract";
import { getAdminCredentials, getAdminSession } from "@/lib/session";

function AdminLogin(props: {
  error?: string;
  usingDefaults: boolean;
  username: string;
}) {
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

          {props.error === "invalid" ? (
            <div className="mt-5 rounded-[22px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              Invalid admin username or password.
            </div>
          ) : null}

          {props.usingDefaults ? (
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
                defaultValue={props.usingDefaults ? props.username : ""}
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

function DashboardError(props: { message: string }) {
  return (
    <main className="min-h-[100dvh] px-5 py-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[36px] border border-white/10 bg-slate-950/82 p-6 shadow-[0_36px_90px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Admin Dashboard
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">
                Research Control Room
              </h1>
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

        <section className="rounded-[32px] border border-rose-300/20 bg-rose-400/10 p-6 text-rose-100 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em]">
            Dashboard Error
          </p>
          <p className="mt-3 text-lg font-bold">{props.message}</p>
        </section>
      </div>
    </main>
  );
}

function AnswerRecordsDetails(props: {
  answerRecords: StageAnswerRecordInput[];
}) {
  return (
    <details className="min-w-80">
      <summary className="cursor-pointer text-sm font-bold text-cyan-200">
        {props.answerRecords.length} records
      </summary>
      <div className="mt-3 max-w-xl space-y-3">
        {props.answerRecords.length > 0 ? (
          props.answerRecords.map((record, recordIndex) => (
            <div
              key={`${record.sceneId}-${recordIndex}`}
              className="rounded-[16px] bg-white/6 p-3 text-xs leading-5 text-slate-300"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    record.isCorrect
                      ? "font-bold text-emerald-300"
                      : "font-bold text-rose-300"
                  }
                >
                  {record.isCorrect ? "Correct" : "Wrong"}
                </span>
                <span className="font-bold text-amber-200">
                  +{record.xpAwarded} XP
                </span>
                <span className="text-slate-500">{record.sceneId}</span>
              </div>
              <p className="mt-2 text-slate-200">{record.question}</p>
              <p className="mt-2">
                Selected:{" "}
                <span className="text-white">{record.selectedAnswer}</span>
              </p>
              {!record.isCorrect ? (
                <p>
                  Correct:{" "}
                  <span className="text-white">{record.correctAnswer}</span>
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-[16px] bg-white/6 p-3 text-xs text-slate-400">
            No answer record saved for this older attempt.
          </p>
        )}
      </div>
    </details>
  );
}

export default async function AdminPage(props: {
  searchParams?: Promise<SearchParamsInput>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const adminSession = await getAdminSession();
  const adminCredentials = getAdminCredentials();

  if (!adminSession) {
    return (
      <AdminLogin
        error={getQueryValue(searchParams.error)}
        usingDefaults={adminCredentials.usingDefaults}
        username={adminCredentials.username}
      />
    );
  }

  let dashboard: Awaited<ReturnType<typeof getResearchDashboardData>> | null =
    null;

  try {
    dashboard = await getResearchDashboardData(adminSession.accessToken);
  } catch (error) {
    return (
      <DashboardError
        message={
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data."
        }
      />
    );
  }

  const selectedStage = getQueryValue(searchParams.stage) || "all";
  const selectedScore = getQueryValue(searchParams.score) || "all";
  const query = getQueryValue(searchParams.q).trim().toLowerCase();
  const stageOptions = dashboard.stageBreakdown.map((stage) => ({
    label: `${stage.stageLabel} / ${stage.stageTitle}`,
    value: stage.stageId,
  }));

  const resultsByPlayerUid = new Map<string, typeof dashboard.allResults>();
  for (const result of dashboard.allResults) {
    const currentRows = resultsByPlayerUid.get(result.playerUid) ?? [];
    currentRows.push(result);
    resultsByPlayerUid.set(result.playerUid, currentRows);
  }

  const filteredResults = dashboard.allResults.filter((result) => {
    const matchesStage =
      selectedStage === "all" || result.stageId === selectedStage;
    const matchesScore = isInScoreRange(result.totalXp, selectedScore);
    const searchable =
      `${result.playerUsername} ${result.playerPhone} ${result.playerUid} ${result.stageTitle} ${result.stageLabel}`.toLowerCase();

    return matchesStage && matchesScore && (!query || searchable.includes(query));
  });

  const filteredPlayers = dashboard.playerRows.filter((player) => {
    const playerResults = resultsByPlayerUid.get(player.uid) ?? [];
    const score = player.progress?.xp ?? 0;
    const matchesScore = isInScoreRange(score, selectedScore);
    const matchesStage =
      selectedStage === "all" ||
      player.progress?.currentStageId === selectedStage ||
      playerResults.some((result) => result.stageId === selectedStage);
    const searchable =
      `${player.username} ${player.phone} ${player.uid}`.toLowerCase();

    return matchesScore && matchesStage && (!query || searchable.includes(query));
  });

  const filteredStageBreakdown = buildStageAnalytics(filteredResults);
  const filteredAttempts = filteredResults.length;
  const filteredAverageStars = filteredAttempts
    ? filteredResults.reduce((sum, result) => sum + result.stars, 0) /
      filteredAttempts
    : 0;
  const filteredAverageCorrect = filteredAttempts
    ? filteredResults.reduce((sum, result) => sum + result.correctCount, 0) /
      filteredAttempts
    : 0;
  const filteredAverageIncorrect = filteredAttempts
    ? filteredResults.reduce((sum, result) => sum + result.incorrectCount, 0) /
      filteredAttempts
    : 0;
  const filteredAverageStageXp = filteredAttempts
    ? filteredResults.reduce((sum, result) => sum + result.stageXp, 0) /
      filteredAttempts
    : 0;
  const filteredAverageTotalXp = filteredAttempts
    ? filteredResults.reduce((sum, result) => sum + result.totalXp, 0) /
      filteredAttempts
    : 0;
  const playerScoreDistribution = buildPlayerScoreDistribution(filteredPlayers);
  const starDistribution = [
    {
      label: "1 Star",
      toneClassName: "bg-gradient-to-r from-rose-400 to-orange-400",
      value: filteredResults.filter((result) => result.stars === 1).length,
    },
    {
      label: "2 Stars",
      toneClassName: "bg-gradient-to-r from-amber-300 to-yellow-400",
      value: filteredResults.filter((result) => result.stars === 2).length,
    },
    {
      label: "3 Stars",
      toneClassName: "bg-gradient-to-r from-cyan-300 to-emerald-300",
      value: filteredResults.filter((result) => result.stars === 3).length,
    },
  ].map((item) => ({
    ...item,
    valueLabel: `${item.value}`,
  }));
  type DashboardResult = (typeof filteredResults)[number];
  const playerStageRows = Array.from(
    filteredResults
      .reduce(
        (rowMap, result) => {
          const key = `${result.playerUid}:${result.stageId}`;
          const current = rowMap.get(key);

          if (!current) {
            rowMap.set(key, {
              attempts: 1,
              latestResult: result,
              playerPhone: result.playerPhone,
              playerUid: result.playerUid,
              playerUsername: result.playerUsername,
              stageId: result.stageId,
              stageLabel: result.stageLabel,
              stageTitle: result.stageTitle,
              totalCorrectCount: result.correctCount,
              totalIncorrectCount: result.incorrectCount,
            });

            return rowMap;
          }

          current.attempts += 1;
          current.totalCorrectCount += result.correctCount;
          current.totalIncorrectCount += result.incorrectCount;

          if (
            result.completedAt.getTime() >
            current.latestResult.completedAt.getTime()
          ) {
            current.latestResult = result;
          }

          return rowMap;
        },
        new Map<
          string,
          {
            attempts: number;
            latestResult: DashboardResult;
            playerPhone: string;
            playerUid: string;
            playerUsername: string;
            stageId: string;
            stageLabel: string;
            stageTitle: string;
            totalCorrectCount: number;
            totalIncorrectCount: number;
          }
        >(),
      )
      .values(),
  ).sort(
    (left, right) =>
      right.latestResult.completedAt.getTime() -
      left.latestResult.completedAt.getTime(),
  );

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
                Review participant identity, filter stage performance, and inspect
                score and answer patterns with a clearer visual dashboard.
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

          <form className="mt-6 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Search
              </span>
              <input
                name="q"
                defaultValue={getQueryValue(searchParams.q)}
                placeholder="Nickname, participant code, UID"
                className="w-full rounded-[18px] border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Stage
              </span>
              <select
                name="stage"
                defaultValue={selectedStage}
                className="w-full rounded-[18px] border border-white/12 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="all">All Stages</option>
                {stageOptions.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Score Range
              </span>
              <select
                name="score"
                defaultValue={selectedScore}
                className="w-full rounded-[18px] border border-white/12 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              >
                {SCORE_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="rounded-[18px] bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 px-5 py-3 text-sm font-black text-slate-950"
              >
                Apply
              </button>
              <a
                href="/admin"
                className="rounded-[18px] border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-slate-100"
              >
                Reset
              </a>
            </div>
          </form>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DashboardMetricCard
            label="Filtered Players"
            note="Participants matching the current search, stage, and score filters."
            tone="text-cyan-200"
            value={filteredPlayers.length}
          />
          <DashboardMetricCard
            label="Filtered Attempts"
            note="Stage completions currently included in the charts below."
            tone="text-emerald-200"
            value={filteredAttempts}
          />
          <DashboardMetricCard
            label="Avg Stars"
            note="Average star rating across the filtered attempt set."
            tone="text-amber-200"
            value={formatDecimal(filteredAverageStars, 2)}
          />
          <DashboardMetricCard
            label="Avg Correct"
            note="Average correct answers per filtered stage completion."
            tone="text-emerald-200"
            value={formatDecimal(filteredAverageCorrect, 1)}
          />
          <DashboardMetricCard
            label="Avg Wrong"
            note="Average wrong answers per filtered stage completion."
            tone="text-rose-200"
            value={formatDecimal(filteredAverageIncorrect, 1)}
          />
          <DashboardMetricCard
            label="Avg Stage XP"
            note="Average XP earned per filtered stage completion."
            tone="text-rose-200"
            value={formatDecimal(filteredAverageStageXp, 1)}
          />
          <DashboardMetricCard
            label="Avg Total XP"
            note="Average cumulative total XP at the time of those completions."
            tone="text-violet-200"
            value={formatDecimal(filteredAverageTotalXp, 1)}
          />
          <DashboardMetricCard
            label="All-Time Players"
            note="Full database size before the current dashboard filters are applied."
            tone="text-slate-200"
            value={dashboard.summary.totalPlayers}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Attempts By Stage
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Stage Activity Graph
            </h2>

            <div className="mt-5">
              <DashboardBarChart
                emptyMessage="No attempts match the current filters."
                items={filteredStageBreakdown.map((stage) => ({
                  caption: `${formatDecimal(stage.averageCorrectCount, 1)} correct / ${formatDecimal(stage.averageIncorrectCount, 1)} wrong`,
                  label: `${stage.stageLabel} / ${stage.stageTitle}`,
                  toneClassName:
                    "bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300",
                  value: stage.attempts,
                  valueLabel: `${stage.attempts} attempts`,
                }))}
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Stars Distribution
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Outcome Graph
            </h2>

            <div className="mt-5">
              <DashboardBarChart
                emptyMessage="No scored stage results are available for this filter."
                items={starDistribution}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Stage Breakdown
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Stage Score Analysis
            </h2>

            <div className="mt-5 space-y-4">
              {filteredStageBreakdown.length > 0 ? (
                filteredStageBreakdown.map((stage) => (
                  <article
                    key={stage.stageId}
                    className="rounded-[24px] border border-white/8 bg-white/6 p-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                          {stage.stageLabel}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-white">
                          {stage.stageTitle}
                        </h3>
                      </div>
                      <div className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white">
                        {stage.attempts} attempts
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-5">
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Avg Stage XP
                        </p>
                        <p className="mt-1 text-xl font-bold text-emerald-300">
                          {formatDecimal(stage.averageStageXp, 1)}
                        </p>
                      </div>
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Avg Stars
                        </p>
                        <p className="mt-1 text-xl font-bold text-amber-300">
                          {formatDecimal(stage.averageStars, 2)}
                        </p>
                      </div>
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Avg Total XP
                        </p>
                        <p className="mt-1 text-xl font-bold text-cyan-300">
                          {formatDecimal(stage.averageTotalXp, 1)}
                        </p>
                      </div>
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Avg Correct
                        </p>
                        <p className="mt-1 text-xl font-bold text-emerald-300">
                          {formatDecimal(stage.averageCorrectCount, 1)}
                        </p>
                      </div>
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Avg Wrong
                        </p>
                        <p className="mt-1 text-xl font-bold text-rose-300">
                          {formatDecimal(stage.averageIncorrectCount, 1)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Score Range
                        </p>
                        <p className="mt-1 font-bold text-white">
                          {stage.lowestStageXp} - {stage.highestStageXp} stage XP
                        </p>
                      </div>
                      <div className="rounded-[18px] bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          Stars Split
                        </p>
                        <p className="mt-1 font-bold text-white">
                          1*: {stage.oneStarCount} | 2*: {stage.twoStarCount} | 3*:{" "}
                          {stage.threeStarCount}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/8 bg-white/6 p-4 text-sm text-slate-400">
                  No stage analytics match the current filters.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Player XP Bands
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
              Score Range Graph
            </h2>

            <div className="mt-5">
              <DashboardBarChart
                emptyMessage="No player rows match the current filters."
                items={playerScoreDistribution.map((band) => ({
                  label: band.label,
                  toneClassName:
                    "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500",
                  value: band.count,
                  valueLabel: `${band.count} players`,
                }))}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Participants
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
            Filtered Player Directory
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Player</th>
                  <th className="pb-3 pr-4">Participant Code</th>
                  <th className="pb-3 pr-4">Current Stage</th>
                  <th className="pb-3 pr-4">XP</th>
                  <th className="pb-3 pr-4">Attempts</th>
                  <th className="pb-3">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
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
                      No players match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Player Stage Summary
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
            Correct and Wrong Answers by Participant
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">Player</th>
                  <th className="pb-3 pr-4">Participant Code</th>
                  <th className="pb-3 pr-4">Stage</th>
                  <th className="pb-3 pr-4">Attempts</th>
                  <th className="pb-3 pr-4">Latest Correct</th>
                  <th className="pb-3 pr-4">Latest Wrong</th>
                  <th className="pb-3 pr-4">All Correct</th>
                  <th className="pb-3 pr-4">All Wrong</th>
                  <th className="pb-3 pr-4">Last Played</th>
                  <th className="pb-3">Latest Answer Records</th>
                </tr>
              </thead>
              <tbody>
                {playerStageRows.length > 0 ? (
                  playerStageRows.slice(0, 120).map((row) => (
                    <tr
                      key={`${row.playerUid}-${row.stageId}`}
                      className="border-t border-white/6 align-top"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-bold text-white">{row.playerUsername}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                          {row.playerUid}
                        </p>
                      </td>
                      <td className="py-4 pr-4 text-slate-300">{row.playerPhone}</td>
                      <td className="py-4 pr-4 text-slate-300">
                        {row.stageLabel} / {row.stageTitle}
                      </td>
                      <td className="py-4 pr-4 font-bold text-white">
                        {row.attempts}
                      </td>
                      <td className="py-4 pr-4 font-bold text-emerald-300">
                        {row.latestResult.correctCount}
                      </td>
                      <td className="py-4 pr-4 font-bold text-rose-300">
                        {row.latestResult.incorrectCount}
                      </td>
                      <td className="py-4 pr-4 font-bold text-emerald-300">
                        {row.totalCorrectCount}
                      </td>
                      <td className="py-4 pr-4 font-bold text-rose-300">
                        {row.totalIncorrectCount}
                      </td>
                      <td className="py-4 pr-4 text-slate-300">
                        {formatDateTime(row.latestResult.completedAt)}
                      </td>
                      <td className="py-4">
                        <AnswerRecordsDetails
                          answerRecords={row.latestResult.answerRecords ?? []}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={10}>
                      No player stage rows match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/76 p-6 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Result Explorer
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
            Stage Results Under Current Filters
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">When</th>
                  <th className="pb-3 pr-4">Player</th>
                  <th className="pb-3 pr-4">Participant Code</th>
                  <th className="pb-3 pr-4">Stage</th>
                  <th className="pb-3 pr-4">Correct</th>
                  <th className="pb-3 pr-4">Wrong</th>
                  <th className="pb-3 pr-4">Stars</th>
                  <th className="pb-3 pr-4">Stage XP</th>
                  <th className="pb-3 pr-4">Total XP</th>
                  <th className="pb-3">Answer Records</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? (
                  filteredResults.slice(0, 120).map((result, index) => {
                    const answerRecords = result.answerRecords ?? [];

                    return (
                      <tr
                        key={`${result.playerUid}-${result.stageId}-${index}`}
                        className="border-t border-white/6 align-top"
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
                        <td className="py-4 pr-4 font-bold text-emerald-300">
                          {result.correctCount}
                        </td>
                        <td className="py-4 pr-4 font-bold text-rose-300">
                          {result.incorrectCount}
                        </td>
                        <td className="py-4 pr-4 font-bold text-amber-300">
                          {result.stars}
                        </td>
                        <td className="py-4 pr-4 font-bold text-emerald-300">
                          {result.stageXp}
                        </td>
                        <td className="py-4 pr-4 font-bold text-white">
                          {result.totalXp}
                        </td>
                        <td className="py-4">
                          <AnswerRecordsDetails answerRecords={answerRecords} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={10}>
                      No stage results match the current filters.
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
