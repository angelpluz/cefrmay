type DashboardMetricCardProps = {
  label: string;
  note: string;
  tone: string;
  value: string | number;
};

export default function DashboardMetricCard({
  label,
  note,
  tone,
  value,
}: DashboardMetricCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
      <p className={`text-xs font-semibold uppercase tracking-[0.26em] ${tone}`}>
        {label}
      </p>
      <p className="mt-3 text-4xl font-black">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{note}</p>
    </article>
  );
}
