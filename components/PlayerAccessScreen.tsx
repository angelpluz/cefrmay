"use client";

import { useState } from "react";

type PlayerFormState = {
  phone: string;
  username: string;
};

const INITIAL_FORM_STATE: PlayerFormState = {
  phone: "",
  username: "",
};

export default function PlayerAccessScreen() {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/player-session", {
        body: JSON.stringify(formState),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to continue.");
      }

      window.location.reload();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to continue.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f59e0b_0%,rgba(245,158,11,0.18)_18%,transparent_42%),radial-gradient(circle_at_bottom_left,#67e8f9_0%,rgba(103,232,249,0.14)_16%,transparent_40%),linear-gradient(180deg,#111827_0%,#020617_100%)]" />

      <div className="relative z-10 w-full max-w-md rounded-[36px] border border-white/12 bg-slate-950/76 p-6 shadow-[0_36px_90px_rgba(15,23,42,0.42)] backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
          Player Access
        </div>

        <h1 className="mt-5 text-4xl font-black tracking-[-0.05em]">
          Register Before Play
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Enter your player name and Student_ID before starting the
          adventure. The system will generate a UID automatically and reuse the
          same research record when the same Student_ID returns.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              User
            </span>
            <input
              required
              autoComplete="name"
              className="w-full rounded-[20px] border border-white/12 bg-white/8 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
              maxLength={60}
              value={formState.username}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  username: event.target.value,
                }))
              }
              placeholder="Alex Researcher"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold tracking-[0.24em] text-cyan-200">
              Student_ID
            </span>
            <input
              required
              autoComplete="off"
              className="w-full rounded-[20px] border border-white/12 bg-white/8 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
              maxLength={24}
              value={formState.phone}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  phone: event.target.value,
                }))
              }
              placeholder="Student_ID"
            />
          </label>

          {errorMessage ? (
            <div className="rounded-[20px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[22px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 px-5 py-4 text-base font-black text-slate-950 shadow-[0_20px_50px_rgba(251,191,36,0.32)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Preparing Session..." : "Enter The Game"}
          </button>
        </form>
      </div>
    </section>
  );
}
