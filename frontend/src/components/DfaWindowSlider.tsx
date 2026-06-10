interface Props {
  value: number;
  onChange: (val: number) => void;
}

export default function DfaWindowSlider({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">
        DFA Window: <span className="text-emerald-400 font-bold">{value}</span>
      </label>
      <input
        type="range"
        min={50}
        max={500}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
        <span>50</span>
        <span>500</span>
      </div>
    </div>
  );
}
