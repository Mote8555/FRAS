# FRAS — Fractal Regime-Adaptive System

**Real-time market regime detection via Detrended Fluctuation Analysis (DFA).**

FRAS calculates the **Hurst Exponent (H)** to diagnose whether a market is trending, mean-reverting, or operating as a random walk — acting as a "master switch" that tells traders which strategy to deploy and how to size risk.

---

## The Math

Traditional indicators (RSI, MACD, MAs) measure *price direction* but fail to measure *market structure and memory*. FRAS uses **Detrended Fluctuation Analysis (DFA)** — a fractal time-series method from econophysics — to compute the Hurst Exponent (H):

| Hurst Range | Regime | Meaning | Suggested Strategy |
|---|---|---|---|
| H > 0.55 | **Trending** (Persistent) | Price moves have long-term memory; a move up is likely to be followed by another move up. | Momentum / Breakout |
| H < 0.45 | **Mean-Reverting** (Anti-Persistent) | Price oscillates; a move up is likely to be followed by a reversal. | Bollinger Bands / RSI Mean Reversion |
| 0.45 ≤ H ≤ 0.55 | **Random Walk** (Noise) | No statistically significant memory; price moves are unpredictable. | **Sit in cash** — preserve capital. |

The **Conviction Multiplier** scales position size linearly from **0.0x** (at H=0.5, pure noise) to **2.0x** (at H=0.0 or H=1.0, maximum structure), calculated as:

```
conviction = min(|H - 0.5| × 4, 2.0)
```

---

## Architecture

```
[Exchange API (Binance)]
       │ (OHLCV Data)
       ▼
[Python FastAPI Backend] ──(numpy/pandas)──> Calculates DFA & Hurst Exponent
       │ (JSON Payload)
       ▼
[Astro Frontend Shell] ──(React Island)──> Renders UI & Lightweight Charts
       │
       ▼
[End User Browser]
```

### Tech Stack

**Backend:** Python 3.11+, FastAPI, ccxt, pandas, numpy, Uvicorn  
**Frontend:** Astro 4, React 18, Tailwind CSS, lightweight-charts 4  
**Infrastructure:** Docker-ready (see Roadmap)

---

## Project Structure

```
fractaltrade/
├── backend/
│   ├── main.py              # FastAPI server — DFA calculation + REST endpoint
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── index.astro      # Entry page — dark shell + header
│   │   └── components/
│   │       └── FractalDashboard.tsx  # React island — all UI logic
│   ├── astro.config.mjs       # Astro config (React + Tailwind)
│   ├── tailwind.config.mjs    # Tailwind configuration
│   ├── package.json
│   └── tsconfig.json
├── prd.md                    # Product Requirements Document
├── start_backend.sh          # Backend launcher
├── start_frontend.sh         # Frontend launcher
└── README.md
```

---

## Setup & Running

### Prerequisites

- Python 3.10+
- Node.js 18+
- Internet connection (for Binance API)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:4321** in your browser.

---

## API

### `GET /api/market-structure/{symbol}`

Returns the Hurst exponent, regime classification, conviction multiplier, trading directive, and OHLCV chart data for the requested asset.

**Default symbol:** `BTC/USDT`  
**Timeframe:** 4H  
**Lookback:** 200 candles  
**DFA window:** 150 periods

**Response:**

```json
{
  "symbol": "BTC/USDT",
  "hurst_exponent": 0.5486,
  "regime": "Random_Walk",
  "conviction_multiplier": 0.19,
  "action": "FLAT. Sit in cash.",
  "chart_data": [
    { "time": 1776916800, "open": 77746.47, "high": 78339.35, "low": 77675.8, "close": 78048.62 }
  ]
}
```

**Error responses:**

| Code | Condition |
|---|---|
| 422 | Insufficient liquidity (< $10M 24h volume) |
| 502 | Exchange API unavailable / rate limited |
| 500 | Internal server error |

---

## Dashboard UI

| Feature | Implemented? |
|---|---|
| Color-coded regime display (Green=Trend, Blue=Mean Rev, Gray=Random) | Yes |
| Hurst Gauge (0.30–0.70 spectrum with needle) | Yes |
| Candlestick chart (lightweight-charts, dark theme) | Yes |
| Conviction Multiplier display | Yes |
| Plain-English trading directives | Yes |
| "Not Financial Advice" disclaimer | Yes |
| 60s auto-refresh polling | Yes |
| Asset switching (ticker input) | No |

---

## Roadmap

### Phase 1: MVP ✅ (Current)

- [x] Single asset (BTC/USDT)
- [x] 4H timeframe analysis
- [x] DFA-based Hurst calculation (custom, no external dependency)
- [x] Regime classification + conviction sizing
- [x] REST polling every 60s
- [x] Read-only dashboard
- [x] Volume filter for low-liquidity assets
- [x] Thread pool for non-blocking DFA computation
- [x] "Not Financial Advice" disclaimer

### Phase 2: Prosumer Expansion (V2)

- [ ] **Asset switching** — User-selectable ticker symbol (ETH/USDT, SOL/USDT, etc.)
- [ ] **Multi-exchange support** — Bybit, Coinbase via UI dropdown
- [ ] **WebSockets** — Real-time H updates on candle close
- [ ] **Multi-timeframe analysis** — Daily H vs 1H H side by side
- [ ] **Configurable DFA window** — User-defined rolling window size
- [ ] **Telegram/Discord webhooks** — Alerts for "Regime Flips"
- [ ] **Redis caching** — Avoid exchange rate limits, sub-250ms cached responses
- [ ] **Historical H timeline** — Plot H over time to see regime transitions
- [ ] **Volume histogram** — Sub-pane on the chart

### Phase 3: Institutional / Auto-Trading (V3)

- [ ] **MF-DFA (Multifractal Spectrum)** — Measure volatility intermittency
- [ ] **Paper trading engine** — Simulate FRAS strategy with Sharpe/Sortino tracking
- [ ] **Exchange integration** — Secure API key vault, auto-execution on regime shifts
- [ ] **Docker containerization** — Deploy via Railway / Fly.io / Render
- [ ] **Backtesting module** — Historical regime simulation against benchmark
- [ ] **Pine Script indicator** — Lightweight TradingView version linking to the web app

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Low-liquidity assets produce garbage DFA | Volume filter: rejects assets with < $10M 24h volume |
| Exchange rate limiting / IP bans | Redis caching + only fetch on new candle close (*pending V2*) |
| DFA blocks the Python event loop | ThreadPoolExecutor runs DFA off the main async loop |
| Users misinterpret as buy/sell signals | "Mathematical Regime Analysis — Not Financial Advice" disclaimer |

---

## License

MIT
