export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeBar {
  time: number;
  value: number;
  color: string;
}

export interface HPoint {
  time: number;
  value: number;
}

export interface TimeframeResult {
  timeframe: string;
  hurst_exponent: number;
  regime: string;
  conviction_multiplier: number;
  action: string;
}

export interface AnalysisResponse {
  symbol: string;
  exchange: string;
  dfa_window: number;
  results: TimeframeResult[];
  chart_data: Candle[];
  volume_data: VolumeBar[];
  h_history: HPoint[];
}

export interface FrasSettings {
  symbol: string;
  exchange: string;
  timeframes: string[];
  dfa_window: number;
  telegram_token: string;
  telegram_chat_id: string;
  discord_webhook_url: string;
}

export const DEFAULT_SETTINGS: FrasSettings = {
  symbol: 'BTC/USDT',
  exchange: 'kraken',
  timeframes: ['4h'],
  dfa_window: 150,
  telegram_token: '',
  telegram_chat_id: '',
  discord_webhook_url: '',
};

export const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];

export const EXCHANGES = ['kraken', 'coinbase'];

export const TIMEFRAMES = ['15m', '1h', '4h', '1d'];

export const EXCHANGE_TIMEFRAMES: Record<string, string[]> = {
  kraken: ['15m', '1h', '4h', '1d'],
  coinbase: ['15m', '1h', '2h', '6h', '1d'],
};

export const REGIME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Trending: {
    bg: 'rgba(16, 185, 129, 0.1)',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
  },
  Mean_Reverting: {
    bg: 'rgba(59, 130, 246, 0.1)',
    text: 'text-blue-400',
    border: 'border-blue-500',
  },
  Random_Walk: {
    bg: 'rgba(107, 114, 128, 0.1)',
    text: 'text-gray-400',
    border: 'border-gray-500',
  },
  Low_Liquidity: {
    bg: 'rgba(251, 191, 36, 0.1)',
    text: 'text-yellow-400',
    border: 'border-yellow-500',
  },
};
