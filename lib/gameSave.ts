export const GAME_SAVE_KEY = "phetchabun-adventure-save-v1";

export type GameSaveData = {
  completedStageIds: string[];
  currentSceneId: string | null;
  currentStageId: string;
  unlockedStageIds: string[];
  xp: number;
};

export function loadGameSave() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSave = window.localStorage.getItem(GAME_SAVE_KEY);

  if (!rawSave) {
    return null;
  }

  try {
    return JSON.parse(rawSave) as GameSaveData;
  } catch {
    return null;
  }
}

export function saveGameProgress(saveData: GameSaveData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(saveData));
}

export function clearGameSave() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(GAME_SAVE_KEY);
}
