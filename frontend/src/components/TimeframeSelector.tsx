import { TIMEFRAMES, EXCHANGE_TIMEFRAMES } from '../lib/types';

interface Props {
  values: string[];
  exchange: string;
  onChange: (vals: string[]) => void;
}

export default function TimeframeSelector({ values, exchange, onChange }: Props) {
  const supported = EXCHANGE_TIMEFRAMES[exchange] ?? TIMEFRAMES;

  const toggle = (tf: string) => {
    if (values.includes(tf)) {
      const next = values.filter((v) => v !== tf);
      onChange(next.length ? next : [tf]);
    } else {
      onChange([...values, tf]);
    }
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Timeframes</label>
      <div className="flex gap-1 flex-wrap">
        {TIMEFRAMES.map((tf) => {
          const active = values.includes(tf);
          const isSupported = supported.includes(tf);
          return (
            <button
              key={tf}
              onClick={() => isSupported && toggle(tf)}
              disabled={!isSupported}
              title={!isSupported ? `Not supported by ${exchange}` : undefined}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                active
                  ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
                  : isSupported
                    ? 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
                    : 'bg-gray-850 text-gray-600 border border-gray-800 cursor-not-allowed line-through opacity-50'
              }`}
            >
              {tf}
            </button>
          );
        })}
      </div>
    </div>
  );
}
