"use client";

import { useEffect, useMemo, useState } from "react";

import GameScene from "@/components/GameScene";
import PWARegistrar from "@/components/PWARegistrar";
import ResultScreen from "@/components/ResultScreen";
import StageSelectScreen from "@/components/StageSelectScreen";
import StartScreen from "@/components/StartScreen";
import type { GameData } from "@/lib/gameEngine";
import {
  clearGameSave,
  loadGameSave,
  saveGameProgress,
  type GameSaveData,
} from "@/lib/gameSave";
import type {
  GameProgressInput,
  PlayerProfile,
  StageResultInput,
} from "@/lib/research-contract";

type AppScreen = "play" | "result" | "select" | "start";

type GameAppProps = {
  appSeed: string;
  initialProgress: GameProgressInput | null;
  player: PlayerProfile;
  stages: GameData[];
};

type ResultState = {
  stageId: string;
  stars: number;
  totalXp: number;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

async function postJson(url: string, payload: GameProgressInput | StageResultInput) {
  const response = await fetch(url, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }
}

export default function GameApp({
  appSeed,
  initialProgress,
  player,
  stages,
}: GameAppProps) {
  const firstStage = stages[0];
  const [screen, setScreen] = useState<AppScreen>("start");
  const [activeStageId, setActiveStageId] = useState(firstStage.id);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(
    firstStage.entrySceneId,
  );
  const [xp, setXp] = useState(0);
  const [unlockedStageIds, setUnlockedStageIds] = useState<string[]>([
    firstStage.id,
  ]);
  const [completedStageIds, setCompletedStageIds] = useState<string[]>([]);
  const [resultState, setResultState] = useState<ResultState | null>(null);
  const [runSeedIndex, setRunSeedIndex] = useState(0);
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [saveLoaded, setSaveLoaded] = useState(false);

  const activeStage =
    stages.find((stage) => stage.id === activeStageId) ?? firstStage;
  const activeStageIndex = stages.findIndex((stage) => stage.id === activeStage.id);
  const nextStage = stages[activeStageIndex + 1] ?? null;
  const sessionSeed = `${appSeed}:${runSeedIndex}:${activeStage.id}`;

  useEffect(() => {
    const existingSave = loadGameSave();

    if (existingSave) {
      queueMicrotask(() => {
        setActiveStageId(existingSave.currentStageId);
        setCurrentSceneId(existingSave.currentSceneId);
        setXp(existingSave.xp);
        setUnlockedStageIds(existingSave.unlockedStageIds);
        setCompletedStageIds(existingSave.completedStageIds);
        setHasSave(true);
      });
    } else if (initialProgress) {
      queueMicrotask(() => {
        setActiveStageId(initialProgress.currentStageId);
        setCurrentSceneId(initialProgress.currentSceneId);
        setXp(initialProgress.xp);
        setUnlockedStageIds(initialProgress.unlockedStageIds);
        setCompletedStageIds(initialProgress.completedStageIds);
        setHasSave(true);
      });
    }

    queueMicrotask(() => {
      setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
      setIsIOS(/iPad|iPhone|iPod/.test(window.navigator.userAgent));
      setSaveLoaded(true);
    });
  }, [initialProgress]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  useEffect(() => {
    if (!saveLoaded || screen === "start") {
      return;
    }

    const saveData: GameSaveData = {
      completedStageIds,
      currentSceneId,
      currentStageId: activeStageId,
      unlockedStageIds,
      xp,
    };

    saveGameProgress(saveData);
    void postJson("/api/player-progress", saveData).catch(() => {
      // Local save stays authoritative if the network write fails.
    });
  }, [
    activeStageId,
    completedStageIds,
    currentSceneId,
    saveLoaded,
    screen,
    unlockedStageIds,
    xp,
  ]);

  const handleNewGame = () => {
    clearGameSave();
    setActiveStageId(firstStage.id);
    setCurrentSceneId(firstStage.entrySceneId);
    setUnlockedStageIds([firstStage.id]);
    setCompletedStageIds([]);
    setXp(0);
    setHasSave(true);
    setResultState(null);
    setRunSeedIndex((index) => index + 1);
    setScreen("select");
  };

  const handleContinueGame = () => {
    setResultState(null);
    setRunSeedIndex((index) => index + 1);
    setScreen(currentSceneId === null ? "select" : "play");
  };

  const handleSelectStage = (stageId: string) => {
    const selectedStage = stages.find((stage) => stage.id === stageId) ?? firstStage;
    const resumeScene =
      stageId === activeStageId && currentSceneId !== null
        ? currentSceneId
        : selectedStage.entrySceneId;

    setActiveStageId(selectedStage.id);
    setCurrentSceneId(resumeScene);
    setResultState(null);
    setRunSeedIndex((index) => index + 1);
    setScreen("play");
  };

  const handleGameProgressChange = (payload: {
    sceneId: string | null;
    xp: number;
  }) => {
    setCurrentSceneId(payload.sceneId);
    setXp(payload.xp);
  };

  const handleStageComplete = (payload: {
    stageXp: number;
    stars: number;
    totalXp: number;
  }) => {
    const nextUnlocked = nextStage
      ? Array.from(new Set([...unlockedStageIds, nextStage.id]))
      : unlockedStageIds;
    const nextCompleted = Array.from(new Set([...completedStageIds, activeStage.id]));
    const stageLabel = activeStage.stage ?? `Stage ${activeStageIndex + 1}`;

    setUnlockedStageIds(nextUnlocked);
    setCompletedStageIds(nextCompleted);
    setXp(payload.totalXp);
    setCurrentSceneId(null);
    setResultState({
      stageId: activeStage.id,
      stars: payload.stars,
      totalXp: payload.totalXp,
    });
    setScreen("result");

    void postJson("/api/stage-results", {
      stageId: activeStage.id,
      stageLabel,
      stageTitle: activeStage.title,
      stageXp: payload.stageXp,
      stars: payload.stars,
      totalXp: payload.totalXp,
    }).catch(() => {
      // Stage result can be retried manually from the player's next completion.
    });
  };

  const handleSwitchPlayer = async () => {
    clearGameSave();

    try {
      await fetch("/api/player-session", {
        method: "DELETE",
      });
    } finally {
      window.location.reload();
    }
  };

  const handleReplayStage = () => {
    setCurrentSceneId(activeStage.entrySceneId);
    setResultState(null);
    setRunSeedIndex((index) => index + 1);
    setScreen("play");
  };

  const handleNextStage = () => {
    if (!nextStage) {
      setScreen("select");
      return;
    }

    setActiveStageId(nextStage.id);
    setCurrentSceneId(nextStage.entrySceneId);
    setResultState(null);
    setRunSeedIndex((index) => index + 1);
    setScreen("play");
  };

  const handleInstall = async () => {
    if (!installPromptEvent) {
      return;
    }

    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  const stageLabel = useMemo(() => {
    return activeStage.stage ?? `Stage ${activeStageIndex + 1}`;
  }, [activeStage.stage, activeStageIndex]);

  if (!saveLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950 text-white">
        <div className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Loading
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[420px] overflow-hidden rounded-none bg-slate-950 shadow-[0_40px_120px_rgba(15,23,42,0.5)] sm:h-[calc(100dvh-24px)] sm:rounded-[36px] sm:border sm:border-white/10">
      <PWARegistrar />

      {screen === "start" ? (
        <StartScreen
          canContinue={hasSave}
          canInstall={Boolean(installPromptEvent)}
          isIOS={isIOS}
          isStandalone={isStandalone}
          onContinue={handleContinueGame}
          onInstall={handleInstall}
          onNewGame={handleNewGame}
          onSwitchPlayer={handleSwitchPlayer}
          playerName={player.username}
          playerUid={player.uid}
        />
      ) : null}

      {screen === "select" ? (
        <StageSelectScreen
          completedStageIds={completedStageIds}
          currentStageId={activeStageId}
          onBack={() => setScreen("start")}
          onSelectStage={handleSelectStage}
          stages={stages}
          unlockedStageIds={unlockedStageIds}
          xp={xp}
        />
      ) : null}

      {screen === "play" ? (
        <GameScene
          initialSceneId={currentSceneId ?? activeStage.entrySceneId}
          initialXp={xp}
          onBack={() => setScreen("select")}
          onProgressChange={handleGameProgressChange}
          onStageComplete={handleStageComplete}
          sessionSeed={sessionSeed}
          stageData={activeStage}
        />
      ) : null}

      {screen === "result" && resultState ? (
        <ResultScreen
          canAdvance={Boolean(nextStage)}
          onNextStage={handleNextStage}
          onReplay={handleReplayStage}
          onStageSelect={() => setScreen("select")}
          stageLabel={stageLabel}
          stars={resultState.stars}
          title={activeStage.title}
          totalXp={resultState.totalXp}
        />
      ) : null}
    </div>
  );
}
