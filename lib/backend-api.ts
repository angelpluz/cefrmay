import "server-only";

import type {
  GameProgressInput,
  StageResultInput,
} from "@/lib/research-contract";

function getBackendBaseUrl() {
  const fallbackBaseUrl =
    process.env.NODE_ENV === "production"
      ? "https://api.alprasoft-corp.com/api/v1"
      : "http://127.0.0.1:4272/api/v1";

  return (process.env.BACKEND_API_BASE_URL || fallbackBaseUrl).replace(/\/+$/, "");
}

function getBackendApiKey() {
  return process.env.BACKEND_API_KEY || "toon-secret";
}

async function readBackendPayload<T>(response: Response): Promise<T> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function handleBackendError(response: Response) {
  const payload = await readBackendPayload<{ error?: string }>(response);
  throw new Error(payload.error || `Backend request failed with ${response.status}`);
}

export async function backendApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await handleBackendError(response);
  }

  return readBackendPayload<T>(response);
}

export async function backendInternalFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  return backendApiFetch<T>(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "X-API-Key": getBackendApiKey(),
    },
  });
}

export async function loginBackendAdmin(input: {
  password: string;
  username: string;
}) {
  return backendApiFetch<{
    accessToken: string;
    expiresIn: string;
    tokenType: string;
  }>("/auth/login", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function upsertBackendPlayer(input: {
  phone: string;
  username: string;
}) {
  return backendInternalFetch<{
    player: {
      created_at: string;
      id: number;
      last_active_at: string;
      phone: string;
      uid: string;
      updated_at: string;
      username: string;
    };
    progress: GameProgressInput | null;
  }>("/game/player-session", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function getBackendPlayerSession(uid: string) {
  return backendInternalFetch<{
    player: {
      created_at: string;
      id: number;
      last_active_at: string;
      phone: string;
      uid: string;
      updated_at: string;
      username: string;
    };
    progress: GameProgressInput | null;
  }>(`/game/player-session/${encodeURIComponent(uid)}`);
}

export async function saveBackendPlayerProgress(input: GameProgressInput & {
  playerId: number;
}) {
  return backendInternalFetch<{ ok: true }>("/game/progress", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function createBackendStageResult(input: StageResultInput & {
  playerId: number;
}) {
  return backendInternalFetch<{ ok: true }>("/game/results", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function getBackendDashboard(accessToken: string) {
  return backendApiFetch<{
    playerRows: Array<{
      createdAt: string;
      id: number;
      lastActiveAt: string;
      phone: string;
      progress: (GameProgressInput & { updatedAt: string }) | null;
      recentResults: Array<{
        completedAt: string;
        stageId: string;
        stageLabel: string;
        stageTitle: string;
        stageXp: number;
        stars: number;
        totalXp: number;
      }>;
      totalAttempts: number;
      uid: string;
      username: string;
    }>;
    recentResults: Array<{
      completedAt: string;
      playerPhone: string;
      playerUid: string;
      playerUsername: string;
      stageId: string;
      stageLabel: string;
      stageTitle: string;
      stageXp: number;
      stars: number;
      totalXp: number;
    }>;
    stageBreakdown: Array<{
      attempts: number;
      averageStageXp: number;
      averageStars: number;
      stageId: string;
      stageLabel: string;
      stageTitle: string;
    }>;
    summary: {
      averageStars: number;
      averageXp: number;
      highestXp: number;
      totalAttempts: number;
      totalPlayers: number;
      totalProgressRecords: number;
    };
  }>("/game/dashboard", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
