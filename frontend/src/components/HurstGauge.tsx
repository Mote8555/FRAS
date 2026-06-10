interface Props {
  hurst: number;
}

export default function HurstGauge({ hurst }: Props) {
  const pct = Math.max(0, Math.min(100, ((hurst - 0.3) / 0.4) * 100));

  return (
    <div className="p-5 bg-gray-900 rounded-xl border border-gray-800">
      <div className="flex justify-between items-baseline mb-3">
        <h2 className="text-xs uppercase tracking-wider text-gray-500">Hurst Exponent (H)</h2>
        <span className="text-2xl font-bold text-white">{hurst.toFixed(4)}</span>
      </div>
      <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-gray-500 to-emerald-500 w-full opacity-30" />
        <div
          className="absolute top-0 h-full w-1 bg-white shadow-lg shadow-white/50 transition-all duration-500"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>0.30 (Mean Rev)</span>
        <span>0.50 (Random)</span>
        <span>0.70 (Trend)</span>
      </div>
    </div>
  );
}
