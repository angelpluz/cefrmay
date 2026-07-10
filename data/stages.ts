import stage1Data from "@/data/stage1_advanced.json";
import stage2Data from "@/data/stage2_advanced.json";
import stage3Data from "@/data/stage3_advanced.json";
import stage4Data from "@/data/stage4_advanced.json";
import stage5Data from "@/data/stage5_audio_listening.json";
import stage6Data from "@/data/stage6_pronunciation.json";
import type { GameData } from "@/lib/gameEngine";

const STAGES = {
  "stage-1": stage1Data as GameData,
  "stage-2": stage2Data as GameData,
  "stage-3": stage3Data as GameData,
  "stage-4": stage4Data as GameData,
  "stage-5": stage5Data as GameData,
  "stage-6": stage6Data as GameData,
} as const;

export type StageId = keyof typeof STAGES;

export function getStage(stageId: StageId) {
  return STAGES[stageId];
}

export function getAllStages() {
  return [
    STAGES["stage-1"],
    STAGES["stage-2"],
    STAGES["stage-3"],
    STAGES["stage-4"],
    STAGES["stage-5"],
    STAGES["stage-6"],
  ];
}
