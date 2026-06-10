interface Props {
  multiplier: number;
}

export default function ConvictionBadge({ multiplier }: Props) {
  return (
    <div className="p-5 bg-gray-900 rounded-xl border border-gray-800">
      <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Position Conviction</h2>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-yellow-400">{multiplier.toFixed(2)}x</span>
        <span className="text-sm text-gray-500 mb-1">Risk Multiplier</span>
      </div>
    </div>
  );
}
