import Image from "next/image";

type CharacterBoxProps = {
  avatar: string;
  avatarImage?: string;
  context: string;
  dialogue: string;
  location: string;
  mood: string;
  name: string;
  role: string;
  speaker?: string;
};

export default function CharacterBox({
  avatar,
  avatarImage,
  context,
  dialogue,
  location,
  mood,
  name,
  role,
  speaker,
}: CharacterBoxProps) {
  return (
    <section className="scene-fade relative overflow-hidden rounded-[32px] border border-white/60 bg-white/65 p-5 shadow-[0_24px_60px_rgba(76,29,149,0.12)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-amber-200 via-orange-100 to-sky-100" />
      <div className="absolute right-5 top-6 h-16 w-16 rounded-full bg-white/50 blur-2xl" />
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">
              Temple Route
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {location}
            </h2>
          </div>
          <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            {context}
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[28px] bg-gradient-to-b from-orange-300 via-amber-200 to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_35px_rgba(251,146,60,0.25)]">
            {avatarImage ? (
              <Image
                alt={name}
                className="object-cover"
                fill
                sizes="96px"
                src={avatarImage}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">
                {avatar}
              </div>
            )}
          </div>

          <div className="relative flex-1 rounded-[28px] bg-white px-4 py-4 shadow-[0_18px_32px_rgba(15,23,42,0.08)]">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                {speaker ?? name}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {role}
              </span>
              <span className="text-lg">{mood}</span>
            </div>
            <p className="text-sm leading-7 text-slate-700 sm:text-base">
              {dialogue}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
