import { useState, useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

interface MarketData {
  symbol: string;
  hurst_exponent: number;
  regime: string;
  conviction_multiplier: number;
  action: string;
  chart_data: any[];
}

const REGIME_COLORS = {
  Trending: {
    bg: "rgba(16, 185, 129, 0.1)",
    text: "text-emerald-400",
    border: "border-emerald-500",
  },
  Mean_Reverting: {
    bg: "rgba(59, 130, 246, 0.1)",
    text: "text-blue-400",
    border: "border-blue-500",
  },
  Random_Walk: {
    bg: "rgba(107, 114, 128, 0.1)",
    text: "text-gray-400",
    border: "border-gray-500",
  },
};

export default function FractalDashboard() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/market-structure/BTC/USDT",
        );
        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error("Backend offline", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data || !chartContainerRef.current) return;
    if (chartRef.current) chartRef.current.remove();

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: "#030712" }, textColor: "#9CA3AF" },
      grid: {
        vertLines: { color: "#1F2937" },
        horzLines: { color: "#1F2937" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    // Using standard v4 API for maximum compatibility
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#10B981",
      downColor: "#EF4444",
      borderVisible: false,
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
    });

    candlestickSeries.setData(data.chart_data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () =>
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  if (loading)
    return (
      <div className="text-center p-10 text-gray-500">
        Calculating Fractal Dimension...
      </div>
    );
  if (!data)
    return (
      <div className="text-center p-10 text-red-500">
        Backend Offline. Please start Python server.
      </div>
    );

  const regimeStyle = REGIME_COLORS[data.regime as keyof typeof REGIME_COLORS];
  const gaugePercent = Math.max(
    0,
    Math.min(100, ((data.hurst_exponent - 0.3) / 0.4) * 100),
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div
          className={`p-6 rounded-xl border ${regimeStyle.border} ${regimeStyle.bg}`}
        >
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            Current Market Regime
          </h2>
          <h1 className={`text-3xl font-bold ${regimeStyle.text}`}>
            {data.regime.replace("_", " ")}
          </h1>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed">
            {data.action}
          </p>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-xs uppercase tracking-wider text-gray-500">
              Hurst Exponent (H)
            </h2>
            <span className="text-2xl font-bold text-white">
              {data.hurst_exponent}
            </span>
          </div>
          <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-gray-500 to-emerald-500 w-full opacity-30"></div>
            <div
              className="absolute top-0 h-full w-1 bg-white shadow-lg shadow-white/50 transition-all duration-500"
              style={{ left: `${gaugePercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>0.30 (Mean Rev)</span>
            <span>0.50 (Random)</span>
            <span>0.70 (Trend)</span>
          </div>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            Position Conviction
          </h2>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-yellow-400">
              {data.conviction_multiplier}x
            </span>
            <span className="text-sm text-gray-500 mb-1">Risk Multiplier</span>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3 bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {data.symbol}{" "}
            <span className="text-sm text-gray-500 font-normal">
              4H Macro Chart
            </span>
          </h2>
        </div>
        <div ref={chartContainerRef} className="w-full" />
      </div>
      <div className="lg:col-span-4 text-center text-[10px] text-gray-600 border-t border-gray-800 pt-3 mt-2">
        FRAS v1.0 — Mathematical Regime Analysis. Not Financial Advice. All trading involves risk.
      </div>
    </div>
  );
}
