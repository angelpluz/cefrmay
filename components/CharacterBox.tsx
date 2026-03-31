"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type CharacterBoxProps = {
  avatar: string;
  avatarImage?: string;
  dialogue: string;
  mood: string;
  name: string;
  role: string;
  speaker?: string;
};

const TYPING_DELAY_MS = 18;

export default function CharacterBox({
  avatar,
  avatarImage,
  dialogue,
  mood,
  name,
  role,
  speaker,
}: CharacterBoxProps) {
  const [typedDialogue, setTypedDialogue] = useState("");

  useEffect(() => {
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      setTypedDialogue(dialogue.slice(0, frame));

      if (frame >= dialogue.length) {
        window.clearInterval(timer);
      }
    }, TYPING_DELAY_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [dialogue]);

  return (
    <section className="relative rounded-[30px] border border-white/10 bg-slate-950/82 p-4 text-white shadow-[0_24px_45px_rgba(15,23,42,0.28)] backdrop-blur-md">
      <div className="flex items-end gap-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-orange-200 via-amber-100 to-white shadow-[0_14px_25px_rgba(249,115,22,0.25)]">
          {avatarImage ? (
            <Image
              alt={name}
              className="object-cover"
              fill
              sizes="88px"
              src={avatarImage}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              {avatar}
            </div>
          )}
        </div>

        <div className="relative flex-1 rounded-[24px] bg-white/95 px-4 py-4 text-slate-900 shadow-[0_18px_30px_rgba(15,23,42,0.12)]">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900">
              {speaker ?? name}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {role}
            </span>
            <span className="animate-[pulse_1.2s_ease-in-out_infinite] text-lg">
              {mood}
            </span>
          </div>

          <p className="min-h-16 text-sm leading-7 text-slate-700 sm:text-base">
            {typedDialogue}
            <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-slate-400 align-middle" />
          </p>
        </div>
      </div>
    </section>
  );
}
