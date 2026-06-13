import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import type { Time } from 'lightweight-charts';
import type { Candle, VolumeBar } from '../lib/types';

function sortDedup<T extends { time: Time }>(data: T[]): T[] {
  const map = new Map<Time, T>();
  for (const item of data) map.set(item.time, item);
  return Array.from(map.values()).sort((a, b) => Number(a.time) - Number(b.time));
}

interface Props {
  symbol: string;
  candles: Candle[];
  volumes: VolumeBar[];
  height?: number;
}

export default function CandlestickChart({ symbol, candles, volumes, height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!containerRef.current || !candles.length) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const sortedCandles = sortDedup(candles);

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#030712' }, textColor: '#9CA3AF' },
      grid: { vertLines: { color: '#1F2937' }, horzLines: { color: '#1F2937' } },
      width: containerRef.current.clientWidth,
      height,
      crosshair: { mode: 0 },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });
    candleSeries.setData(sortedCandles);

    candleSeries.priceScale().applyOptions({
      scaleMargins: { top: 0, bottom: 0.25 },
    });

    const sortedVolumes = sortDedup(volumes);
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volumeSeries.setData(sortedVolumes);

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

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
  }, [candles, volumes, height]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">
          {symbol}{' '}
          <span className="text-sm text-gray-500 font-normal">Macro Chart</span>
        </h2>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
