import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import ccxt
import pandas as pd
import numpy as np

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

executor = ThreadPoolExecutor(max_workers=4)

async def run_blocking(fn, *args):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, fn, *args)

MIN_24H_VOLUME_USD = 10_000_000

def dfa_hurst(series, min_window=4, max_window=None):
    n = len(series)
    if max_window is None:
        max_window = n // 4
    if n < min_window * 2:
        return 0.5

    profile = np.cumsum(series - np.mean(series))
    window_sizes = np.logspace(np.log10(min_window), np.log10(max_window), num=30, dtype=int)
    window_sizes = np.unique(window_sizes)
    window_sizes = window_sizes[window_sizes >= min_window]
    window_sizes = window_sizes[window_sizes <= n // 2]

    fluctuations = []
    valid_windows = []
    for m in window_sizes:
        num_segments = n // m
        if num_segments < 2:
            continue
        segments = profile[:num_segments * m].reshape(num_segments, m)
        x = np.arange(m)
        seg_rms = []
        for seg in segments:
            coeffs = np.polyfit(x, seg, 1)
            trend = np.polyval(coeffs, x)
            residuals = seg - trend
            rms = np.sqrt(np.mean(residuals ** 2))
            seg_rms.append(rms)
        fluctuations.append(np.mean(seg_rms))
        valid_windows.append(m)

    if len(valid_windows) < 2:
        return 0.5
    coeffs = np.polyfit(np.log(valid_windows), np.log(fluctuations), 1)
    return coeffs[0]

def calculate_hurst_dfa(prices, window=150):
    log_returns = np.log(prices / prices.shift(1)).dropna()
    if len(log_returns) < window:
        return 0.5, "Random_Walk"

    recent_returns = log_returns.iloc[-window:].values
    h_value = dfa_hurst(recent_returns)

    if h_value > 0.55: regime = "Trending"
    elif h_value < 0.45: regime = "Mean_Reverting"
    else: regime = "Random_Walk"

    return round(h_value, 4), regime

def fetch_market_data(symbol, timeframe='4h', limit=200):
    exchange = ccxt.binance()
    ohlcv = exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
    df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])

    recent_volume = df['volume'].tail(6).sum()
    recent_close = df['close'].iloc[-1]
    volume_usd = recent_volume * recent_close
    if volume_usd < MIN_24H_VOLUME_USD:
        raise ValueError(f"Insufficient liquidity: 24h volume ${volume_usd:,.0f} < ${MIN_24H_VOLUME_USD:,}")

    h_value, regime = calculate_hurst_dfa(df['close'])
    conviction = min(abs(h_value - 0.5) * 4, 2.0)

    chart_data = [
        {"time": int(row['timestamp'] / 1000), "open": row['open'], "high": row['high'], "low": row['low'], "close": row['close']}
        for _, row in df.iterrows()
    ]

    action = "FLAT. Sit in cash."
    if regime == "Trending": action = "Deploy Momentum/Breakout Strategy."
    elif regime == "Mean_Reverting": action = "Deploy Bollinger/RSI Mean Reversion."

    return {
        "symbol": symbol, "hurst_exponent": h_value, "regime": regime,
        "conviction_multiplier": round(conviction, 2), "action": action, "chart_data": chart_data
    }

@app.get("/api/market-structure/{symbol:path}")
async def get_market_structure(symbol: str = "BTC/USDT"):
    try:
        result = await run_blocking(fetch_market_data, symbol)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except ccxt.NetworkError as e:
        raise HTTPException(status_code=502, detail=f"Exchange API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
