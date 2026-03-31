import {
  getBackendDashboard,
  getBackendPlayerSession,
} from "@/lib/backend-api";
import type { PlayerProfile } from "@/lib/research-contract";
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

  return {
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
      recentResults: player.recentResults.map((result) => ({
        ...result,
        completedAt: toDate(result.completedAt),
      })),
    })),
    recentResults: dashboard.recentResults.map((result) => ({
      ...result,
      completedAt: toDate(result.completedAt),
    })),
    stageBreakdown: dashboard.stageBreakdown,
    summary: dashboard.summary,
  };
}
