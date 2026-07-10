"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import CharacterBox from "@/components/CharacterBox";
import ChoiceBox from "@/components/ChoiceBox";
import FeedbackOverlay from "@/components/FeedbackOverlay";
import GameHUD from "@/components/GameHUD";
import PronunciationPracticeScene from "@/components/PronunciationPracticeScene";
import { getStageMaxXp, shuffleChoices, type GameData } from "@/lib/gameEngine";
import type { StageAnswerRecordInput } from "@/lib/research-contract";
import { useGameSession } from "@/lib/useGameSession";

type GameSceneProps = {
  initialSceneId?: string | null;
  initialXp?: number;
  onBack: () => void;
  onProgressChange: (payload: { sceneId: string | null; xp: number }) => void;
  onStageComplete: (payload: {
    answerRecords: StageAnswerRecordInput[];
    correctCount: number;
    incorrectCount: number;
    stageXp: number;
    stars: number;
    totalXp: number;
  }) => void;
  sessionSeed: string;
  stageData: GameData;
};

function speakText(text: string, onStatusChange: (message: string) => void) {
  if (typeof window === "undefined") {
    return;
  }

  if (!("speechSynthesis" in window)) {
    onStatusChange("Speech playback is not available on this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  utterance.onstart = () => onStatusChange("Playing Alex's audio...");
  utterance.onend = () => onStatusChange("Listen again if needed.");
  utterance.onerror = () => onStatusChange("Unable to play the audio prompt.");

  window.speechSynthesis.speak(utterance);
}

export default function GameScene({
  initialSceneId,
  initialXp = 0,
  onBack,
  onProgressChange,
  onStageComplete,
  sessionSeed,
  stageData,
}: GameSceneProps) {
  const stageRunKey = `${sessionSeed}:${stageData.id}`;
  const completionSubmittedRef = useRef<string | null>(null);
  const [stageStartXp] = useState(initialXp);
  const [audioStatus, setAudioStatus] = useState<{
    message: string;
    sceneId: string;
  } | null>(null);

  const {
    answerRecords,
    currentScene,
    currentSceneId,
    feedback,
    handleChoiceSelect,
    handlePronunciationComplete,
    isComplete,
    progress,
    xp,
    xpBurst,
  } = useGameSession({
    initialSceneId,
    initialXp,
    stageData,
  });

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
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentScene?.sceneId]);

  useEffect(() => {
    onProgressChange({
      sceneId: currentSceneId,
      xp,
    });
  }, [currentSceneId, onProgressChange, xp]);

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    if (completionSubmittedRef.current === stageRunKey) {
      return;
    }

    completionSubmittedRef.current = stageRunKey;

    const correctCount = answerRecords.filter((record) => record.isCorrect).length;
    const incorrectCount = answerRecords.length - correctCount;
    const stageXp = xp - stageStartXp;
    const maxXp = getStageMaxXp(stageData);
    const ratio = maxXp === 0 ? 0 : stageXp / maxXp;
    const stars = ratio >= 0.95 ? 3 : ratio >= 0.55 ? 2 : 1;

    onStageComplete({
      answerRecords,
      correctCount,
      incorrectCount,
      stageXp: Math.max(stageXp, 0),
      stars,
      totalXp: xp,
    });
  }, [
    answerRecords,
    isComplete,
    onStageComplete,
    stageData,
    stageRunKey,
    stageStartXp,
    xp,
  ]);

  if (!currentScene) {
    return null;
  }

  const currentAudioStatus =
    audioStatus?.sceneId === currentScene.sceneId ? audioStatus.message : "";

  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      {stageData.backgroundImage ? (
        <>
          <Image
            alt={stageData.title}
            className="object-cover opacity-28"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 420px"
            src={stageData.backgroundImage}
            unoptimized
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.2),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.22)_0%,rgba(2,6,23,0.74)_45%,rgba(2,6,23,0.96)_100%)]" />
        </>
      ) : null}

      <div className="relative flex h-full flex-col overflow-hidden">
        <GameHUD
          current={progress.current}
          stageName={stageData.title}
          total={progress.total}
          xp={xp}
          xpBurst={xpBurst}
        />

        <div className="flex items-center justify-between px-4 pb-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-200 transition hover:-translate-y-0.5"
          >
            Stage Select
          </button>
          <div className="rounded-full bg-white/8 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
            {stageData.stage ?? "Adventure"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="scene-fade space-y-4 pb-4">
            <section className="rounded-[30px] bg-slate-950/84 px-5 py-5 shadow-[0_24px_45px_rgba(15,23,42,0.28)] backdrop-blur-md">
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
                  {currentScene.type ?? "Scene"} /{" "}
                  {currentScene.difficulty ?? "Normal"}
                </span>
              </div>

              {currentScene.sceneImage ? (
                <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10">
                  <div className="relative aspect-[16/9]">
                    <Image
                      alt={currentScene.story.title}
                      className="object-cover transition duration-500 ease-out hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      src={currentScene.sceneImage}
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {currentScene.location}
                    </div>
                  </div>
                </div>
              ) : null}

              <p className="mt-4 text-sm leading-7 text-slate-200">
                {currentScene.story.text}
              </p>
            </section>

            {currentScene.dialogue.hideText ? (
              <section className="rounded-[30px] border border-cyan-200/20 bg-slate-950/84 p-5 text-white shadow-[0_24px_45px_rgba(15,23,42,0.28)] backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  Audio Prompt
                </p>
                <h2 className="mt-2 text-xl font-black">
                  Listen to Alex before choosing.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  The spoken prompt is hidden for this listening item.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    speakText(currentScene.dialogue.text, (message) =>
                      setAudioStatus({
                        message,
                        sceneId: currentScene.sceneId,
                      }),
                    )
                  }
                  className="mt-4 w-full rounded-[22px] bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 px-5 py-4 text-base font-black text-slate-950 shadow-[0_20px_50px_rgba(34,211,238,0.28)] transition hover:-translate-y-0.5 active:scale-[0.985]"
                >
                  Listen to Alex
                </button>
                {currentAudioStatus ? (
                  <p className="mt-3 text-sm font-semibold text-cyan-100">
                    {currentAudioStatus}
                  </p>
                ) : null}
              </section>
            ) : (
              <CharacterBox
                key={currentScene.sceneId}
                avatar={stageData.character.avatar}
                avatarImage={stageData.character.avatarImage}
                dialogue={currentScene.dialogue.text}
                mood={currentScene.dialogue.mood}
                name={stageData.character.name}
                role={stageData.character.role}
                speaker={currentScene.character ?? currentScene.dialogue.speaker}
              />
            )}

            {currentScene.type === "pronunciation" &&
            currentScene.pronunciation ? (
              <PronunciationPracticeScene
                acceptedAnswers={currentScene.pronunciation.acceptedAnswers}
                exampleSentence={currentScene.pronunciation.exampleSentence}
                maxAttempts={currentScene.pronunciation.maxAttempts}
                meaningTh={currentScene.pronunciation.meaningTh}
                onComplete={handlePronunciationComplete}
                targetWord={currentScene.pronunciation.targetWord}
              />
            ) : (
              <section className="rounded-[30px] bg-white/94 p-5 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
                    Choice
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {currentScene.hideQuestionText
                      ? "Listen and choose the best response."
                      : currentScene.question}
                  </h2>
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
            )}
          </div>
        </div>
      </div>

      {feedback ? (
        <FeedbackOverlay
          message={feedback.message}
          status={feedback.status}
          xpAwarded={feedback.xpAwarded}
        />
      ) : null}
    </section>
  );
}
