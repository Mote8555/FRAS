import { useMarketData } from '../hooks/useMarketData';
import { useSettings } from '../hooks/useSettings';
import AssetSelector from './AssetSelector';
import ExchangeSelector from './ExchangeSelector';
import TimeframeSelector from './TimeframeSelector';
import DfaWindowSlider from './DfaWindowSlider';
import RegimePanel from './RegimePanel';
import HurstGauge from './HurstGauge';
import ConvictionBadge from './ConvictionBadge';
import MultiTimeframeGrid from './MultiTimeframeGrid';
import CandlestickChart from './CandlestickChart';
import HurstTimelineChart from './HurstTimelineChart';
import WebhookSettings from './WebhookSettings';

export default function Dashboard() {
  const { settings, setSettings } = useSettings();
  const { data, loading, error } = useMarketData({
    symbol: settings.symbol,
    exchange: settings.exchange,
    timeframes: settings.timeframes,
    dfa_window: settings.dfa_window,
  });

  if (loading && !data) {
    return (
      <div className="text-center py-20 text-gray-500">
        <div className="animate-pulse text-lg">Hurst DFA Analysis in Progress...</div>
      </div>
    );
  }

  if (!data && error) {
    return (
      <div className="text-center py-20 text-red-400">
        <p className="text-lg font-bold">Backend Offline</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <p className="text-xs text-gray-600 mt-4">Start the Python server on port 8000</p>
      </div>
    );
  }

  if (!data) return null;

  const primaryResult = data.results[0];
  const showMulti = data.results.length > 1;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        <AssetSelector
          value={settings.symbol}
          onChange={(v) => setSettings({ ...settings, symbol: v })}
        />
        <ExchangeSelector
          value={settings.exchange}
          onChange={(v) => setSettings({ ...settings, exchange: v })}
        />
        <TimeframeSelector
          values={settings.timeframes}
          exchange={settings.exchange}
          onChange={(v) => setSettings({ ...settings, timeframes: v })}
        />
        <DfaWindowSlider
          value={settings.dfa_window}
          onChange={(v) => setSettings({ ...settings, dfa_window: v })}
        />
      </div>

      {showMulti && <MultiTimeframeGrid results={data.results} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 space-y-4">
          <RegimePanel result={primaryResult} />
          <HurstGauge hurst={primaryResult.hurst_exponent} />
          <ConvictionBadge multiplier={primaryResult.conviction_multiplier} />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <CandlestickChart
            symbol={data.symbol}
            candles={data.chart_data}
            volumes={data.volume_data}
          />
          <HurstTimelineChart history={data.h_history} />
        </div>
      </div>

      <WebhookSettings settings={settings} onChange={setSettings} />

      <div className="text-center text-[10px] text-gray-600 border-t border-gray-800 pt-3">
        FRAS v2.0 — Fractal Regime-Adaptive System. Mathematical Regime Analysis. Not Financial Advice. All trading involves risk.
      </div>
    </div>
  );
}
