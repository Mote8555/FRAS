import type { TimeframeResult } from '../lib/types';
import { REGIME_COLORS } from '../lib/types';

interface Props {
  results: TimeframeResult[];
}

export default function MultiTimeframeGrid({ results }: Props) {
  if (results.length <= 1) return null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Multi-Timeframe Analysis</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-800">
              <th className="text-left py-2 pr-4">Timeframe</th>
              <th className="text-right py-2 pr-4">Hurst</th>
              <th className="text-center py-2 pr-4">Regime</th>
              <th className="text-right py-2">Conviction</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const s = REGIME_COLORS[r.regime] ?? REGIME_COLORS.Random_Walk;
              return (
                <tr key={r.timeframe} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 pr-4 font-medium text-gray-300">{r.timeframe}</td>
                  <td className={`py-2 pr-4 text-right font-mono ${s.text}`}>{r.hurst_exponent.toFixed(4)}</td>
                  <td className="py-2 pr-4 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.border} ${s.text} ${s.bg}`}>
                      {r.regime.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2 text-right text-yellow-400 font-mono">{r.conviction_multiplier.toFixed(2)}x</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
