"use client";

import { useState } from "react";

import GameScene from "@/components/GameScene";
import type { GameData } from "@/lib/gameEngine";

type GameCampaignProps = {
  campaignSeed: string;
  stages: GameData[];
};

export default function GameCampaign({
  campaignSeed,
  stages,
}: GameCampaignProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [campaignXp, setCampaignXp] = useState(0);

  const currentStage = stages[currentStageIndex];
  const nextStage = stages[currentStageIndex + 1] ?? null;

  const handleContinueToNextStage = (totalXp: number) => {
    if (!nextStage) {
      return;
    }

    setCampaignXp(totalXp);
    setCurrentStageIndex((index) => Math.min(index + 1, stages.length - 1));
  };

  const handleRestartCampaign = () => {
    setCampaignXp(0);
    setCurrentStageIndex(0);
  };

  return (
    <GameScene
      initialXp={campaignXp}
      key={`${currentStage.id}-${campaignXp}`}
      nextStageTitle={nextStage?.title}
      onContinueToNextStage={handleContinueToNextStage}
      onRestartCampaign={handleRestartCampaign}
      sessionSeed={campaignSeed}
      stageCount={stages.length}
      stageData={currentStage}
      stageNumber={currentStageIndex + 1}
    />
  );
}
