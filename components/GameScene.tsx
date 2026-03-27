"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";

import CharacterBox from "@/components/CharacterBox";
import ChoiceBox from "@/components/ChoiceBox";
import ProgressBar from "@/components/ProgressBar";
import { shuffleChoices, type GameData } from "@/lib/gameEngine";
import { useGameSession } from "@/lib/useGameSession";

type GameSceneProps = {
  initialXp?: number;
  nextStageTitle?: string;
  onContinueToNextStage?: (totalXp: number) => void;
  onRestartCampaign: () => void;
  sessionSeed: string;
  stageCount: number;
  stageData: GameData;
  stageNumber: number;
};

export default function GameScene({
  initialXp = 0,
  nextStageTitle,
  onContinueToNextStage,
  onRestartCampaign,
  sessionSeed,
  stageCount,
  stageData,
  stageNumber,
}: GameSceneProps) {
  const {
    completion,
    currentScene,
    feedback,
    handleChoiceSelect,
    handleRestart,
    isComplete,
    progress,
    xp,
    xpBurst,
  } = useGameSession(stageData, initialXp);
  const autoAdvanceRef = useRef(false);
  const randomizedChoices = useMemo(() => {
    if (!currentScene) {
      return [];
    }

    return shuffleChoices(
      currentScene.choices,
      `${sessionSeed}:${stageData.id}:${currentScene.sceneId}`,
    );
  }, [currentScene, sessionSeed, stageData.id]);

  useEffect(() => {
    autoAdvanceRef.current = false;
  }, [stageData.id]);

  useEffect(() => {
    if (
      !isComplete ||
      !nextStageTitle ||
      !onContinueToNextStage ||
      autoAdvanceRef.current
    ) {
      return;
    }

    autoAdvanceRef.current = true;

    const timer = setTimeout(() => {
      onContinueToNextStage(completion.totalXp);
    }, 1800);

    return () => {
      clearTimeout(timer);
    };
  }, [completion.totalXp, isComplete, nextStageTitle, onContinueToNextStage]);

  if (isComplete || !currentScene) {
    const hasNextStage = Boolean(nextStageTitle && onContinueToNextStage);

    return (
      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-6 shadow-[0_28px_70px_rgba(30,41,59,0.16)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-violet-200 via-pink-100 to-amber-100" />
        <div className="relative text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-[0_20px_40px_rgba(168,85,247,0.2)]">
            🏆
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-500">
            Stage Clear
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            {stageData.title} complete
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-600">
            Alex made it through this chapter with {completion.totalXp} XP.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
              Total XP {completion.totalXp}
            </div>
            <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-sky-700">
              Stage {stageNumber}/{stageCount}
            </div>
          </div>

          {hasNextStage ? (
            <>
              <p className="mt-6 text-sm font-medium text-slate-500">
                Moving to {nextStageTitle}...
              </p>
              <button
                type="button"
                onClick={() => onContinueToNextStage?.(completion.totalXp)}
                className="mt-5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-6 py-3 text-sm font-bold text-white shadow-[0_20px_40px_rgba(168,85,247,0.28)] transition hover:-translate-y-0.5"
              >
                Continue to Next Stage
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onRestartCampaign}
              className="mt-8 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-6 py-3 text-sm font-bold text-white shadow-[0_20px_40px_rgba(168,85,247,0.28)] transition hover:-translate-y-0.5"
            >
              Restart Campaign
            </button>
          )}

          <button
            type="button"
            onClick={handleRestart}
            className="mt-3 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5"
          >
            Replay This Stage
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/55 p-4 shadow-[0_30px_80px_rgba(30,41,59,0.16)] backdrop-blur-2xl sm:p-5">
      {stageData.backgroundImage ? (
        <>
          <Image
            alt={stageData.title}
            className="object-cover opacity-35"
            fill
            priority={stageNumber === 2}
            sizes="(max-width: 768px) 100vw, 448px"
            src={stageData.backgroundImage}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/55 via-violet-900/25 to-amber-100/30" />
        </>
      ) : (
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-br from-violet-200/80 via-cyan-100/70 to-orange-100/80" />
      )}
      <div className="absolute -left-14 top-10 h-36 w-36 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute -right-10 bottom-12 h-32 w-32 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative space-y-4">
        <header className="rounded-[28px] bg-slate-950/90 px-4 py-4 text-white shadow-[0_22px_40px_rgba(15,23,42,0.2)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/90">
                {stageData.stage ?? `Stage ${stageNumber}/${stageCount}`}
              </p>
              <h1 className="mt-2 text-2xl font-bold">{stageData.title}</h1>
            </div>
            <div className="relative rounded-full bg-white/10 px-4 py-2 text-right backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                XP
              </p>
              <p className="text-lg font-bold text-amber-300">{xp}</p>
              {xpBurst !== null && (
                <span className="xp-burst absolute left-1/2 top-full text-sm font-bold text-emerald-300">
                  +{xpBurst} XP
                </span>
              )}
            </div>
          </div>
        </header>

        <ProgressBar current={progress.current} total={progress.total} />

        <section className="rounded-[30px] bg-slate-950/88 px-5 py-5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.18)] backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Story
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {currentScene.story.title}
              </h2>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">
              {currentScene.type ?? "Scene"} / {currentScene.difficulty ?? "Normal"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            {currentScene.story.text}
          </p>
          {currentScene.sceneImage ? (
            <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
              <div className="relative aspect-[16/9]">
                <Image
                  alt={currentScene.story.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  src={currentScene.sceneImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {currentScene.location}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <CharacterBox
          avatar={stageData.character.avatar}
          avatarImage={stageData.character.avatarImage}
          context={currentScene.context}
          dialogue={currentScene.dialogue.text}
          location={currentScene.location}
          mood={currentScene.dialogue.mood}
          name={stageData.character.name}
          role={stageData.character.role}
          speaker={currentScene.character ?? currentScene.dialogue.speaker}
        />

        <section className="rounded-[30px] bg-white/82 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.09)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
                Choice
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {currentScene.question}
              </h2>
            </div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              {progress.current}/{progress.total}
            </span>
          </div>

          <div className="space-y-3">
            {randomizedChoices.map((choice, index) => (
              <ChoiceBox
                key={`${currentScene.sceneId}-${choice.text}`}
                disabled={feedback !== null}
                index={index + 1}
                text={choice.text}
                onClick={() => handleChoiceSelect(choice)}
              />
            ))}
          </div>
        </section>

        <div className="min-h-20">
          {feedback ? (
            <div
              className={`feedback-pop rounded-[26px] px-4 py-4 shadow-[0_18px_36px_rgba(15,23,42,0.12)] ${
                feedback.status === "correct"
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                    Feedback
                  </p>
                  <p className="mt-2 text-base font-semibold">{feedback.message}</p>
                </div>
                <div className="rounded-full bg-white/20 px-3 py-2 text-sm font-bold">
                  {feedback.xpAwarded > 0 ? `+${feedback.xpAwarded} XP` : "0 XP"}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[26px] border border-dashed border-slate-200 bg-white/45 px-4 py-5 text-sm text-slate-500">
              Choose the best reply to guide Alex through the scene.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
