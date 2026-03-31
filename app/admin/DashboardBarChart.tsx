import { formatPercent } from "./dashboard-utils";

type DashboardBarChartProps = {
  emptyMessage: string;
  items: Array<{
    caption?: string;
    label: string;
    toneClassName: string;
    value: number;
    valueLabel: string;
  }>;
};

export default function DashboardBarChart({
  emptyMessage,
  items,
}: DashboardBarChartProps) {
  const maxValue = items.reduce(
    (currentMax, item) => Math.max(currentMax, item.value),
    0,
  );

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/8 bg-white/6 p-4 text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const percent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div key={item.label} className="rounded-[22px] border border-white/8 bg-white/6 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">{item.label}</p>
                {item.caption ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.caption}
                  </p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white">{item.valueLabel}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {formatPercent(percent)}
                </p>
              </div>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-900/70">
              <div
                className={`h-full rounded-full ${item.toneClassName}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
