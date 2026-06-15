import {
  getBackendDashboard,
  getBackendPlayerSession,
} from "@/lib/backend-api";
import type {
  PlayerProfile,
  StageAnswerRecordInput,
} from "@/lib/research-contract";
import { getPlayerSession } from "@/lib/session";

function toDate(value: string) {
  return new Date(value);
}

function mapPlayerProfile(player: PlayerProfile) {
  return {
    id: player.id,
    phone: player.phone,
    uid: player.uid,
    username: player.username,
  } satisfies PlayerProfile;
}

function isStageAnswerRecord(value: unknown): value is StageAnswerRecordInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<StageAnswerRecordInput>;

  return (
    typeof record.answeredAt === "string" &&
    typeof record.correctAnswer === "string" &&
    typeof record.isCorrect === "boolean" &&
    typeof record.question === "string" &&
    typeof record.sceneId === "string" &&
    typeof record.selectedAnswer === "string" &&
    typeof record.xpAwarded === "number"
  );
}

function mapStageResult<T extends { completedAt: string }>(result: T) {
  const record = result as T & {
    answerRecords?: unknown;
    correctCount?: unknown;
    incorrectCount?: unknown;
  };

  return {
    ...result,
    answerRecords: Array.isArray(record.answerRecords)
      ? record.answerRecords.filter(isStageAnswerRecord)
      : [],
    completedAt: toDate(result.completedAt),
    correctCount:
      typeof record.correctCount === "number" ? record.correctCount : 0,
    incorrectCount:
      typeof record.incorrectCount === "number" ? record.incorrectCount : 0,
  };
}

export async function getCurrentPlayerProfile() {
  const session = await getPlayerSession();

  if (!session) {
    return null;
  }

  const backendSession = await getBackendPlayerSession(session.uid).catch(() => null);

  if (!backendSession || backendSession.player.id !== session.playerId) {
    return null;
  }

  return mapPlayerProfile(backendSession.player);
}

export async function getCurrentPlayerState() {
  const session = await getPlayerSession();

  if (!session) {
    return null;
  }

  const backendSession = await getBackendPlayerSession(session.uid).catch(() => null);

  if (!backendSession || backendSession.player.id !== session.playerId) {
    return null;
  }

  return {
    player: mapPlayerProfile(backendSession.player),
    progress: backendSession.progress,
  };
}

export async function getResearchDashboardData(accessToken: string) {
  const dashboard = await getBackendDashboard(accessToken);
  const allResults = (dashboard.allResults || dashboard.recentResults).map(
    mapStageResult,
  );

  return {
    allResults,
    playerRows: dashboard.playerRows.map((player) => ({
      ...player,
      createdAt: toDate(player.createdAt),
      lastActiveAt: toDate(player.lastActiveAt),
      progress: player.progress
        ? {
            ...player.progress,
            updatedAt: toDate(player.progress.updatedAt),
          }
        : null,
      recentResults: player.recentResults.map(mapStageResult),
    })),
    recentResults: dashboard.recentResults.map(mapStageResult),
    stageBreakdown: dashboard.stageBreakdown,
    summary: dashboard.summary,
  };
}
