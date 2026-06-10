import { SYMBOLS } from '../lib/types';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function AssetSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Asset</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:border-emerald-500"
      >
        {SYMBOLS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
