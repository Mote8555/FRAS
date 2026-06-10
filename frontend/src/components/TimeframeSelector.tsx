import { TIMEFRAMES } from '../lib/types';

interface Props {
  values: string[];
  onChange: (vals: string[]) => void;
}

export default function TimeframeSelector({ values, onChange }: Props) {
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
          return (
            <button
              key={tf}
              onClick={() => toggle(tf)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                active
                  ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
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
