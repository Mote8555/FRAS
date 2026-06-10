import type { TimeframeResult } from '../lib/types';
import { REGIME_COLORS } from '../lib/types';

interface Props {
  result: TimeframeResult;
}

export default function RegimePanel({ result }: Props) {
  const style = REGIME_COLORS[result.regime] ?? REGIME_COLORS.Random_Walk;

  return (
    <div className={`p-5 rounded-xl border ${style.border} ${style.bg}`}>
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xs uppercase tracking-wider text-gray-500">Current Market Regime</h2>
        <span className="text-[10px] text-gray-600">{result.timeframe}</span>
      </div>
      <h1 className={`text-3xl font-bold ${style.text}`}>
        {result.regime.replace(/_/g, ' ')}
      </h1>
      <p className="text-sm text-gray-400 mt-3 leading-relaxed">
        {result.action}
      </p>
    </div>
  );
}
