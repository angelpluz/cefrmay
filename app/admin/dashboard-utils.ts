export const SCORE_RANGE_OPTIONS = [
  { label: "All Scores", value: "all" },
  { label: "0-50", value: "0-50" },
  { label: "51-100", value: "51-100" },
  { label: "101-150", value: "101-150" },
  { label: "151+", value: "151+" },
] as const;

export type SearchParamsInput = {
  error?: string | string[];
  q?: string | string[];
  score?: string | string[];
  stage?: string | string[];
};

export type StageAnalytics = {
  attempts: number;
  averageStageXp: number;
  averageStars: number;
  averageTotalXp: number;
  highestStageXp: number;
  lowestStageXp: number;
  oneStarCount: number;
  stageId: string;
  stageLabel: string;
  stageTitle: string;
  threeStarCount: number;
  twoStarCount: number;
};

export function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatDecimal(value: number, digits = 1) {
  return value.toFixed(digits);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function isInScoreRange(score: number, range: string) {
  if (range === "0-50") {
    return score >= 0 && score <= 50;
  }

  if (range === "51-100") {
    return score >= 51 && score <= 100;
  }

  if (range === "101-150") {
    return score >= 101 && score <= 150;
  }

  if (range === "151+") {
    return score >= 151;
  }

  return true;
}

export function buildStageAnalytics<
  T extends {
    stageId: string;
    stageLabel: string;
    stageTitle: string;
    stageXp: number;
    stars: number;
    totalXp: number;
  },
>(results: T[]) {
  const stageMap = new Map<string, StageAnalytics>();

  for (const result of results) {
    const current = stageMap.get(result.stageId) || {
      attempts: 0,
      averageStageXp: 0,
      averageStars: 0,
      averageTotalXp: 0,
      highestStageXp: 0,
      lowestStageXp: Number.POSITIVE_INFINITY,
      oneStarCount: 0,
      stageId: result.stageId,
      stageLabel: result.stageLabel,
      stageTitle: result.stageTitle,
      threeStarCount: 0,
      twoStarCount: 0,
    };

    current.attempts += 1;
    current.averageStageXp += result.stageXp;
    current.averageStars += result.stars;
    current.averageTotalXp += result.totalXp;
    current.highestStageXp = Math.max(current.highestStageXp, result.stageXp);
    current.lowestStageXp = Math.min(current.lowestStageXp, result.stageXp);

    if (result.stars === 1) {
      current.oneStarCount += 1;
    } else if (result.stars === 2) {
      current.twoStarCount += 1;
    } else if (result.stars === 3) {
      current.threeStarCount += 1;
    }

    stageMap.set(result.stageId, current);
  }

  return Array.from(stageMap.values())
    .map((stage) => ({
      ...stage,
      averageStageXp: stage.attempts
        ? stage.averageStageXp / stage.attempts
        : 0,
      averageStars: stage.attempts ? stage.averageStars / stage.attempts : 0,
      averageTotalXp: stage.attempts ? stage.averageTotalXp / stage.attempts : 0,
      lowestStageXp:
        stage.lowestStageXp === Number.POSITIVE_INFINITY ? 0 : stage.lowestStageXp,
    }))
    .sort((left, right) => left.stageId.localeCompare(right.stageId));
}

export function buildPlayerScoreDistribution<
  T extends {
    progress: { xp: number } | null;
  },
>(players: T[]) {
  return SCORE_RANGE_OPTIONS.filter((option) => option.value !== "all").map(
    (option) => ({
      count: players.filter((player) =>
        isInScoreRange(player.progress?.xp ?? 0, option.value),
      ).length,
      label: option.label,
      value: option.value,
    }),
  );
}
