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
      className="group flex min-h-18 w-full items-center gap-3 rounded-[24px] bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-500 px-4 py-4 text-left text-white shadow-[0_18px_40px_rgba(91,33,182,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(91,33,182,0.36)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-55"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/16 text-sm font-bold ring-1 ring-white/20">
        {index}
      </span>
      <span className="flex-1 text-base font-semibold leading-6">{text}</span>
      <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
        &gt;
      </span>
    </button>
  );
}
