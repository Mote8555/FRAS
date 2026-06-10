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
[Exchange APIs (Binance / Bybit / Coinbase)]
       │ (OHLCV Data via ccxt)
       ▼
[Python FastAPI Backend]
  ├── services/dfa.py        — DFA & Hurst computation
  ├── services/exchange.py   — Exchange factory
  ├── services/cache.py      — Redis/fakeredis caching
  ├── services/webhooks.py   — Telegram/Discord alerts
  ├── routes/analysis.py     — REST /api/v2/analyze
  └── routes/ws.py           — WebSocket /api/v2/ws
       │ (JSON over REST + WebSocket push)
       ▼
[Astro Frontend Shell] ──(React Islands)──> Renders UI & Lightweight Charts
       │
       ▼
[End User Browser]
```

### Connectivity

- **Primary:** WebSocket (`ws://localhost:8000/api/v2/ws`) — real-time push on candle close
- **Fallback:** REST polling (`GET /api/v2/analyze`) every 60s if WebSocket disconnects
- **Cache:** fakeredis (dev) / Redis (prod) reduces exchange API calls

### Tech Stack

**Backend:** Python 3.10+, FastAPI, ccxt, pandas, numpy, fakeredis, pydantic-settings, Uvicorn  
**Frontend:** Astro 4, React 18, Tailwind CSS, lightweight-charts 4

---

## Project Structure

```
fractaltrade/
├── backend/
│   ├── core/
│   │   ├── config.py           # pydantic-settings (env vars + defaults)
│   │   └── dependencies.py     # Redis singleton provider
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── services/
│   │   ├── dfa.py              # DFA & Hurst computation
│   │   ├── exchange.py         # Exchange factory (Binance, Bybit, Coinbase)
│   │   ├── cache.py            # Redis caching layer
│   │   └── webhooks.py         # Telegram & Discord alerting
│   ├── routes/
│   │   ├── analysis.py         # GET /api/v2/analyze
│   │   └── ws.py               # WS /api/v2/ws
│   ├── tests/
│   │   ├── test_dfa.py
│   │   ├── test_cache.py
│   │   └── test_routes.py
│   ├── main.py                 # FastAPI entry point
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── index.astro          # Entry page
│   │   ├── components/
│   │   │   ├── Dashboard.tsx         # Main orchestrator
│   │   │   ├── AssetSelector.tsx     # Symbol dropdown
│   │   │   ├── ExchangeSelector.tsx  # Exchange dropdown
│   │   │   ├── TimeframeSelector.tsx # Multi-select timeframe chips
│   │   │   ├── DfaWindowSlider.tsx   # DFA window slider
│   │   │   ├── RegimePanel.tsx       # Regime card
│   │   │   ├── HurstGauge.tsx        # H gauge bar
│   │   │   ├── ConvictionBadge.tsx   # Risk multiplier
│   │   │   ├── MultiTimeframeGrid.tsx # Side-by-side H table
│   │   │   ├── CandlestickChart.tsx  # OHLCV + volume histogram
│   │   │   ├── HurstTimelineChart.tsx # H-over-time line chart
│   │   │   └── WebhookSettings.tsx   # Telegram/Discord config
│   │   ├── hooks/
│   │   │   ├── useMarketData.ts      # WebSocket + REST fallback
│   │   │   └── useSettings.ts        # localStorage persistence
│   │   └── lib/
│   │       └── types.ts              # Shared TypeScript types
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   ├── package.json
│   └── tsconfig.json
├── prd.md
├── CHANGELOG.md
├── start_backend.sh
├── start_frontend.sh
└── README.md
```

---

## Setup & Running

### Prerequisites

- Python 3.10+
- Node.js 18+
- Internet connection (for exchange APIs)

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

### Running Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

---

## API (v2)

### `GET /api/v2/analyze`

Returns the Hurst exponent, regime classification, conviction multiplier, and OHLCV chart data for the requested asset.

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `symbol` | `BTC/USDT` | Trading pair |
| `exchange` | `binance` | Exchange (`binance`, `bybit`, `coinbase`) |
| `timeframes` | `4h` | Comma-separated timeframes (`1h,4h,1d`) |
| `dfa_window` | `150` | Rolling DFA window size |

**Response:**

```json
{
  "symbol": "BTC/USDT",
  "exchange": "binance",
  "dfa_window": 150,
  "results": [
    {
      "timeframe": "1h",
      "hurst_exponent": 0.42,
      "regime": "Mean_Reverting",
      "conviction_multiplier": 0.32,
      "action": "Deploy Bollinger/RSI Mean Reversion."
    },
    {
      "timeframe": "4h",
      "hurst_exponent": 0.61,
      "regime": "Trending",
      "conviction_multiplier": 0.44,
      "action": "Deploy Momentum/Breakout Strategy."
    }
  ],
  "chart_data": [
    { "time": 1776916800, "open": 77746.47, "high": 78339.35, "low": 77675.8, "close": 78048.62 }
  ],
  "volume_data": [
    { "time": 1776916800, "value": 1234.5, "color": "#10B981" }
  ],
  "h_history": [
    { "time": 1776916800, "value": 0.58 }
  ]
}
```

### `WS /api/v2/ws`

WebSocket endpoint for real-time updates.

**Subscribe:**

```json
{
  "action": "subscribe",
  "symbol": "BTC/USDT",
  "exchange": "binance",
  "timeframes": ["1h", "4h"],
  "dfa_window": 150
}
```

**Server push:**

```json
{
  "type": "analysis",
  "data": { /* same shape as REST response */ }
}
```

---

## Dashboard UI

| Feature | Status |
|---|---|
| Color-coded regime display (Green=Trend, Blue=Mean Rev, Gray=Random) | ✅ |
| Hurst Gauge (0.30–0.70 spectrum with needle) | ✅ |
| Candlestick chart (lightweight-charts, dark theme) | ✅ |
| Volume histogram sub-pane | ✅ |
| Conviction Multiplier display | ✅ |
| Plain-English trading directives | ✅ |
| Asset switching (BTC/USDT, ETH/USDT, SOL/USDT) | ✅ |
| Multi-exchange support (Binance, Bybit, Coinbase) | ✅ |
| Multi-timeframe analysis (side-by-side H table) | ✅ |
| Configurable DFA window slider | ✅ |
| Historical H timeline chart | ✅ |
| WebSocket real-time updates | ✅ |
| Redis/fakeredis caching | ✅ |
| Telegram/Discord webhook alerts | ✅ |
| 60s REST polling fallback | ✅ |
| "Not Financial Advice" disclaimer | ✅ |

---

## Roadmap

### Phase 1: MVP ✅

- [x] Single asset (BTC/USDT)
- [x] 4H timeframe analysis
- [x] DFA-based Hurst calculation (custom, no external dependency)
- [x] Regime classification + conviction sizing
- [x] REST polling every 60s
- [x] Read-only dashboard
- [x] Volume filter for low-liquidity assets
- [x] Thread pool for non-blocking DFA computation
- [x] "Not Financial Advice" disclaimer

### Phase 2: Prosumer Expansion ✅ (Current)

- [x] **Asset switching** — User-selectable ticker symbol (ETH/USDT, SOL/USDT, etc.)
- [x] **Multi-exchange support** — Bybit, Coinbase via UI dropdown
- [x] **WebSockets** — Real-time H updates on candle close
- [x] **Multi-timeframe analysis** — Daily H vs 1H H side by side
- [x] **Configurable DFA window** — User-defined rolling window size
- [x] **Telegram/Discord webhooks** — Alerts for "Regime Flips"
- [x] **Redis caching** — Avoid exchange rate limits, sub-250ms cached responses
- [x] **Historical H timeline** — Plot H over time to see regime transitions
- [x] **Volume histogram** — Sub-pane on the chart

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
| Exchange rate limiting / IP bans | Redis caching + only fetch on new candle close (implemented in V2) |
| DFA blocks the Python event loop | ThreadPoolExecutor runs DFA off the main async loop (V1); non-blocking async design (V2) |
| Users misinterpret as buy/sell signals | "Mathematical Regime Analysis — Not Financial Advice" disclaimer |

---

## License

MIT
