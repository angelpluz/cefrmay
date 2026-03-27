import stage1Data from "@/data/stage1.json";
import stage2Data from "@/data/stage2.json";
import type { GameData } from "@/lib/gameEngine";

const STAGES = {
  "stage-1": stage1Data as GameData,
  "stage-2": stage2Data as GameData,
} as const;

export type StageId = keyof typeof STAGES;

export function getStage(stageId: StageId) {
  return STAGES[stageId];
}

export function getAllStages() {
  return [STAGES["stage-1"], STAGES["stage-2"]];
}
