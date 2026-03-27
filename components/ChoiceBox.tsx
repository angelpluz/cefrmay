type ChoiceBoxProps = {
  disabled?: boolean;
  index: number;
  text: string;
  onClick: () => void;
};

export default function ChoiceBox({
  disabled = false,
  index,
  text,
  onClick,
}: ChoiceBoxProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-[24px] bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 px-4 py-4 text-left text-white shadow-[0_18px_40px_rgba(14,116,144,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(14,116,144,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/22 text-sm font-semibold ring-1 ring-white/20">
        {index}
      </span>
      <span className="flex-1 text-sm font-semibold leading-6 sm:text-base">
        {text}
      </span>
      <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
        &gt;
      </span>
    </button>
  );
}
