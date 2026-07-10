"use client";

import { useEffect, useRef, useState } from "react";

type PronunciationPracticeSceneProps = {
  acceptedAnswers: string[];
  exampleSentence?: string;
  maxAttempts?: number;
  meaningTh: string;
  onComplete: (result: {
    attemptCount: number;
    isCorrect: boolean;
    recognizedText: string;
    xpAwarded: number;
  }) => void;
  targetWord: string;
};

type SpeechRecognitionAlternative = {
  confidence: number;
  transcript: string;
};

type SpeechRecognitionResult = {
  [index: number]: SpeechRecognitionAlternative | undefined;
};

type SpeechRecognitionResultList = {
  [index: number]: SpeechRecognitionResult | undefined;
};

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = EventTarget & {
  abort: () => void;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function normalizeSpeechText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

function isAcceptedPronunciation(text: string, acceptedAnswers: string[]) {
  const cleanText = normalizeSpeechText(text);

  return acceptedAnswers.some(
    (answer) => normalizeSpeechText(answer) === cleanText,
  );
}

function tryStopRecognition(recognition: SpeechRecognitionInstance | null) {
  try {
    recognition?.stop();
  } catch {
    // Some browsers throw if recognition has already ended.
  }
}

function tryAbortRecognition(recognition: SpeechRecognitionInstance | null) {
  try {
    recognition?.abort();
  } catch {
    // Some browsers throw if recognition has already ended.
  }
}

export default function PronunciationPracticeScene({
  acceptedAnswers,
  exampleSentence,
  maxAttempts = 3,
  meaningTh,
  onComplete,
  targetWord,
}: PronunciationPracticeSceneProps) {
  const [attemptCount, setAttemptCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [canContinueWithoutRecognition, setCanContinueWithoutRecognition] =
    useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [status, setStatus] = useState("Click Listen, then Speak.");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const remainingAttempts = Math.max(maxAttempts - attemptCount, 0);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;

      if (!recognition) {
        return;
      }

      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      tryAbortRecognition(recognition);
      recognitionRef.current = null;
    };
  }, []);

  function speakModel() {
    if (!("speechSynthesis" in window)) {
      setStatus("Speech playback is not available on this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      exampleSentence ? `${targetWord}. ${exampleSentence}` : targetWord,
    );
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
    setStatus("Listen to the model, then speak.");
  }

  function completeAttempt(input: {
    attempt: number;
    isCorrect: boolean;
    text: string;
  }) {
    tryStopRecognition(recognitionRef.current);
    setCompleted(true);
    setIsListening(false);
    onComplete({
      attemptCount: input.attempt,
      isCorrect: input.isCorrect,
      recognizedText: input.text,
      xpAwarded: input.isCorrect ? 10 : 0,
    });
  }

  function startRecognition() {
    if (completed || isListening) {
      return;
    }

    const SpeechRecognition =
      (window as SpeechRecognitionWindow).SpeechRecognition ||
      (window as SpeechRecognitionWindow).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus(
        "Speech recognition is not available on this browser. Please try Chrome.",
      );
      setCanContinueWithoutRecognition(true);
      return;
    }

    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    setIsListening(true);
    setStatus("Listening...");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const isCorrect = isAcceptedPronunciation(transcript, acceptedAnswers);

      setRecognizedText(transcript);

      if (isCorrect) {
        setStatus(`Good pronunciation: ${transcript}`);
        completeAttempt({
          attempt: nextAttempt,
          isCorrect: true,
          text: transcript,
        });
        return;
      }

      if (nextAttempt >= maxAttempts) {
        setStatus(`Try again next time. Recognized: ${transcript}`);
        completeAttempt({
          attempt: nextAttempt,
          isCorrect: false,
          text: transcript,
        });
        return;
      }

      setStatus(`Try again. Recognized: ${transcript}`);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);

      if (nextAttempt >= maxAttempts) {
        const fallbackText = "Speech recognition error";
        setRecognizedText(fallbackText);
        setStatus("Speech recognition error. Moving to the next item.");
        completeAttempt({
          attempt: nextAttempt,
          isCorrect: false,
          text: fallbackText,
        });
        return;
      }

      setStatus("Speech recognition error. Please try again.");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setStatus("Microphone is still resetting. Please tap Speak again.");
    }
  }

  function continueWithoutRecognition() {
    if (completed) {
      return;
    }

    completeAttempt({
      attempt: Math.max(attemptCount, 1),
      isCorrect: false,
      text: "Speech recognition unavailable",
    });
  }

  return (
    <section className="rounded-[28px] bg-white/94 p-5 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
          Pronunciation
        </p>
        <div>
          <h2 className="text-3xl font-black text-slate-950">{targetWord}</h2>
          <p className="mt-2 text-base font-bold text-slate-700">{meaningTh}</p>
        </div>
        {exampleSentence ? (
          <p className="rounded-[18px] bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
            {exampleSentence}
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={speakModel}
          className="rounded-[20px] bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
        >
          Listen
        </button>
        <button
          type="button"
          disabled={completed || isListening || remainingAttempts === 0}
          onClick={startRecognition}
          className="rounded-[20px] bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isListening ? "Listening..." : "Speak"}
        </button>
      </div>

      {canContinueWithoutRecognition && !completed ? (
        <button
          type="button"
          onClick={continueWithoutRecognition}
          className="mt-3 w-full rounded-[18px] border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700"
        >
          Continue Without Score
        </button>
      ) : null}

      <div className="mt-4 rounded-[18px] bg-slate-950/5 px-4 py-3 text-sm leading-6 text-slate-700">
        <p>{status}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Attempts: {attemptCount}/{maxAttempts}
        </p>
        {recognizedText ? (
          <p className="mt-2">
            Recognized: <span className="font-bold">{recognizedText}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
