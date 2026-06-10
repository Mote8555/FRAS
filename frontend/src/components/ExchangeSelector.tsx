import { EXCHANGES } from '../lib/types';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function ExchangeSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Exchange</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:border-emerald-500"
      >
        {EXCHANGES.map((ex) => (
          <option key={ex} value={ex}>{ex.charAt(0).toUpperCase() + ex.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}
