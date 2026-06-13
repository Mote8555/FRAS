import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import type { Time } from 'lightweight-charts';
import type { HPoint } from '../lib/types';

function sortDedup(data: HPoint[]): HPoint[] {
  const map = new Map<Time, HPoint>();
  for (const item of data) map.set(item.time, item);
  return Array.from(map.values()).sort((a, b) => Number(a.time) - Number(b.time));
}

interface Props {
  history: HPoint[];
  height?: number;
}

export default function HurstTimelineChart({ history, height = 120 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!containerRef.current || !history.length) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const sorted = sortDedup(history);

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#030712' }, textColor: '#9CA3AF' },
      grid: { vertLines: { color: '#1F2937' }, horzLines: { color: '#1F2937' } },
      width: containerRef.current.clientWidth,
      height,
    });

    const lineSeries = chart.addLineSeries({
      color: '#F59E0B',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 3,
    });
    lineSeries.setData(sorted);

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [history, height]);

  if (!history.length) return null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Hurst Timeline</h2>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
