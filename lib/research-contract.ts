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
  activityType?: "multiple-choice" | "audio-listening" | "pronunciation";
  answeredAt: string;
  attemptCount?: number;
  audioText?: string;
  correctAnswer: string;
  hiddenPrompt?: boolean;
  isCorrect: boolean;
  isPronunciationCorrect?: boolean;
  meaningTh?: string;
  question: string;
  recognizedText?: string;
  sceneId: string;
  selectedAnswer: string;
  targetWord?: string;
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
