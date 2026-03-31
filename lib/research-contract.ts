export type PlayerProfile = {
  id: number;
  phone: string;
  uid: string;
  username: string;
};

export type GameProgressInput = {
  completedStageIds: string[];
  currentSceneId: string | null;
  currentStageId: string;
  unlockedStageIds: string[];
  xp: number;
};

export type StageResultInput = {
  stageId: string;
  stageLabel: string;
  stageTitle: string;
  stageXp: number;
  stars: number;
  totalXp: number;
};
