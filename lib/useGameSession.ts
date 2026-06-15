"use client";

import { useEffect, useRef, useState } from "react";

import {
  getChoiceResult,
  getSceneById,
  getSceneProgress,
  getStageCompletionSummary,
  getStageEntrySceneId,
  nextScene,
  type GameChoice,
  type GameData,
} from "@/lib/gameEngine";
import type { StageAnswerRecordInput } from "@/lib/research-contract";

type FeedbackState = {
  message: string;
  status: "correct" | "wrong";
  xpAwarded: number;
};

const FEEDBACK_DELAY_MS = 1200;
const XP_BURST_DELAY_MS = 900;

export function useGameSession({
  initialSceneId,
  initialXp = 0,
  stageData,
}: {
  initialSceneId?: string | null;
  initialXp?: number;
  stageData: GameData;
}) {
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(
    initialSceneId ?? getStageEntrySceneId(stageData),
  );
  const [xp, setXp] = useState(initialXp);
  const [xpBurst, setXpBurst] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [answerRecords, setAnswerRecords] = useState<StageAnswerRecordInput[]>([]);
  const nextSceneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const xpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const currentScene = getSceneById(stageData, currentSceneId);
  const isComplete = currentSceneId === null;
  const progress = getSceneProgress(stageData, currentSceneId);
  const completion = getStageCompletionSummary(stageData, xp);

  useEffect(() => {
    return () => {
      if (nextSceneTimerRef.current) {
        clearTimeout(nextSceneTimerRef.current);
      }

      if (xpTimerRef.current) {
        clearTimeout(xpTimerRef.current);
      }

      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioContext = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playTone = ({
    delay = 0,
    duration,
    frequency,
    gain = 0.05,
    type = "sine",
  }: {
    delay?: number;
    duration: number;
    frequency: number;
    gain?: number;
    type?: OscillatorType;
  }) => {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  };

  const playAudioFile = async (name: "click" | "correct" | "wrong") => {
    if (typeof window === "undefined") {
      return false;
    }

    const sourcePath = `/sounds/${name}.mp3`;
    const cachedAudio = audioRefs.current[name] ?? new Audio(sourcePath);
    audioRefs.current[name] = cachedAudio;

    try {
      cachedAudio.currentTime = 0;
      await cachedAudio.play();
      return true;
    } catch {
      return false;
    }
  };

  const playClickSound = () => {
    void playAudioFile("click").then((played) => {
      if (!played) {
        playTone({
          duration: 0.08,
          frequency: 420,
          gain: 0.03,
          type: "square",
        });
      }
    });
  };

  const playCorrectSound = () => {
    void playAudioFile("correct").then((played) => {
      if (!played) {
        playTone({
          delay: 0.02,
          duration: 0.12,
          frequency: 660,
          gain: 0.04,
          type: "triangle",
        });
        playTone({
          delay: 0.14,
          duration: 0.18,
          frequency: 880,
          gain: 0.04,
          type: "triangle",
        });
      }
    });
  };

  const playWrongSound = () => {
    void playAudioFile("wrong").then((played) => {
      if (!played) {
        playTone({
          duration: 0.18,
          frequency: 220,
          gain: 0.045,
          type: "sawtooth",
        });
      }
    });
  };

  const handleChoiceSelect = (choice: GameChoice) => {
    if (!currentScene || feedback) {
      return;
    }

    playClickSound();

    const result = getChoiceResult(choice);
    const correctChoice = currentScene.choices.find((item) => item.correct);

    if (result.isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    if (result.xpAwarded > 0) {
      setXp((currentXp) => currentXp + result.xpAwarded);
      setXpBurst(result.xpAwarded);

      if (xpTimerRef.current) {
        clearTimeout(xpTimerRef.current);
      }

      xpTimerRef.current = setTimeout(() => {
        setXpBurst(null);
      }, XP_BURST_DELAY_MS);
    }

    setAnswerRecords((currentRecords) => [
      ...currentRecords,
      {
        answeredAt: new Date().toISOString(),
        correctAnswer: correctChoice?.text ?? "",
        isCorrect: result.isCorrect,
        question: currentScene.question,
        sceneId: currentScene.sceneId,
        selectedAnswer: choice.text,
        xpAwarded: result.xpAwarded,
      },
    ]);

    setFeedback({
      message: result.feedback,
      status: result.status,
      xpAwarded: result.xpAwarded,
    });

    nextSceneTimerRef.current = setTimeout(() => {
      setFeedback(null);
      setCurrentSceneId(nextScene(stageData, currentScene.sceneId, choice));
    }, FEEDBACK_DELAY_MS);
  };

  const handleRestart = () => {
    if (nextSceneTimerRef.current) {
      clearTimeout(nextSceneTimerRef.current);
    }

    if (xpTimerRef.current) {
      clearTimeout(xpTimerRef.current);
    }

    setCurrentSceneId(getStageEntrySceneId(stageData));
    setXp(initialXp);
    setAnswerRecords([]);
    setXpBurst(null);
    setFeedback(null);
  };

  return {
    answerRecords,
    completion,
    currentScene,
    currentSceneId,
    feedback,
    handleChoiceSelect,
    handleRestart,
    isComplete,
    progress,
    xp,
    xpBurst,
  };
}
