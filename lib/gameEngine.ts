export type GameChoice = {
  correct: boolean;
  feedback: {
    reaction: string;
    status: "correct" | "wrong";
  };
  nextSceneId?: string | null;
  text: string;
  xp: number;
};

export type GameSceneData = {
  character?: string;
  choices: GameChoice[];
  context: string;
  dialogue: {
    mood: string;
    speaker: string;
    text: string;
  };
  difficulty?: string;
  id: number;
  location: string;
  question: string;
  sceneImage?: string;
  sceneId: string;
  story: {
    text: string;
    title: string;
  };
  type?: string;
};

export type GameData = {
  backgroundImage?: string;
  character: {
    avatar: string;
    avatarImage?: string;
    name: string;
    role: string;
  };
  entrySceneId: string;
  id: string;
  scenes: GameSceneData[];
  stage?: string;
  title: string;
  totalScenes?: number;
};

export function getChoiceResult(choice: GameChoice) {
  return {
    feedback: choice.feedback.reaction,
    isCorrect: choice.correct,
    status: choice.feedback.status,
    xpAwarded: choice.correct ? choice.xp : 0,
  };
}

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: string) {
  let state = hashSeed(seed) || 1;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function shuffleChoices<T>(choices: T[], seed: string) {
  const shuffled = [...choices];
  const random = createSeededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
  }

  return shuffled;
}

export function getSceneById(
  stageData: GameData,
  sceneId: string | null,
): GameSceneData | null {
  if (sceneId === null) {
    return null;
  }

  return stageData.scenes.find((scene) => scene.sceneId === sceneId) ?? null;
}

export function getSceneProgress(
  stageData: GameData,
  currentSceneId: string | null,
) {
  const total = stageData.totalScenes ?? stageData.scenes.length;

  if (currentSceneId === null) {
    return {
      current: total,
      total,
    };
  }

  const index = stageData.scenes.findIndex(
    (scene) => scene.sceneId === currentSceneId,
  );
  const current = index >= 0 ? index + 1 : 1;

  return {
    current,
    total,
  };
}

export function getStageCompletionSummary(stageData: GameData, xp: number) {
  return {
    totalScenes: stageData.totalScenes ?? stageData.scenes.length,
    totalXp: xp,
  };
}

export function getStageMaxXp(stageData: GameData) {
  return stageData.scenes.reduce((totalXp, scene) => {
    const bestChoiceXp = scene.choices.reduce((choiceXp, choice) => {
      return choice.correct ? Math.max(choiceXp, choice.xp) : choiceXp;
    }, 0);

    return totalXp + bestChoiceXp;
  }, 0);
}

export function getStageEntrySceneId(stageData: GameData) {
  return stageData.entrySceneId;
}

export function nextScene(
  stageData: GameData,
  currentSceneId: string,
  choice: GameChoice,
) {
  if (choice.nextSceneId !== undefined) {
    return choice.nextSceneId ?? null;
  }

  const currentIndex = stageData.scenes.findIndex(
    (scene) => scene.sceneId === currentSceneId,
  );

  if (currentIndex < 0) {
    return null;
  }

  const nextScene = stageData.scenes[currentIndex + 1];

  return nextScene ? nextScene.sceneId : null;
}
