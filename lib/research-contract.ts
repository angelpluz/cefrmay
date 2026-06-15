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

export type StageAnswerRecordInput = {
  answeredAt: string;
  correctAnswer: string;
  isCorrect: boolean;
  question: string;
  sceneId: string;
  selectedAnswer: string;
  xpAwarded: number;
};

export type StageResultInput = {
  answerRecords: StageAnswerRecordInput[];
  correctCount: number;
  incorrectCount: number;
  stageId: string;
  stageLabel: string;
  stageTitle: string;
  stageXp: number;
  stars: number;
  totalXp: number;
};
