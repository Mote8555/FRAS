# Changelog

## v2.0.0 — 2026-06-10

Major rewrite from monolithic v1 to modular v2 (Phase 2 of the roadmap). Deprecates the single-endpoint v1 API.

### Backend (Modular Restructure)

- **Package structure** — Split monolithic `main.py` into `core/`, `models/`, `services/`, `routes/`
- **Multi-exchange support** — Added Bybit and Coinbase alongside Binance via a factory pattern
- **Multi-timeframe analysis** — `GET /api/v2/analyze` accepts comma-separated timeframes (`1h,4h,1d`)
- **Configurable DFA window** — `dfa_window` query parameter (50–500)
- **WebSocket endpoint** — `WS /api/v2/ws` for real-time push on 60s server-side poll
- **Redis caching** — fakeredis for development (swap to real Redis via `.env`)
- **Historical H timeline** — H values stored in Redis, returned as `h_history[]`
- **Webhook alerts** — Telegram Bot API + Discord webhook integration
- **Pydantic models** — Formal request/response schemas
- **Environment config** — `pydantic-settings` with `.env` file support
- **Test suite** — 14 pytest tests covering DFA, cache, and API routes

### Frontend (Component Architecture)

- **Component decomposition** — Split single `FractalDashboard.tsx` into 12 focused components
- **AssetSelector** — Dropdown for BTC/USDT, ETH/USDT, SOL/USDT
- **ExchangeSelector** — Dropdown for Binance, Bybit, Coinbase
- **TimeframeSelector** — Multi-select pill buttons
- **DfaWindowSlider** — Range slider for configurable DFA window
- **MultiTimeframeGrid** — Side-by-side H value comparison table
- **CandlestickChart** — OHLCV chart with volume histogram sub-pane
- **HurstTimelineChart** — H-over-time line chart
- **WebhookSettings** — Inline collapsible Telegram/Discord configuration
- **useMarketData hook** — WebSocket primary with REST polling fallback
- **useSettings hook** — localStorage persistence for user preferences
- **TypeScript types** — Shared interfaces in `lib/types.ts`

### Fixes

- Fixed `class` → `className` in all React components (invalid DOM property warning)
- Fixed `data must be asc ordered by time` assertion (sortDedup utility in chart components)
- Fixed `Object is disposed` error on React StrictMode double-mounting (null refs after remove)
- Fixed tuple/float type mismatch in `calculate_hurst_dfa` early return
- Fixed `h_history` sort order (ascending for lightweight-charts)
- Fixed duplicate timestamp appends (skip if candle unchanged)
- Added `pytest.ini` with `asyncio_mode = auto` for reliable test runs

### Removed

- v1 endpoint `GET /api/market-structure/{symbol}` — replaced by `GET /api/v2/analyze`
- v1 hardcoded BTC/USDT logic
- Legacy `FractalDashboard.tsx` component

---

## v1.0.0 — 2026-05-XX

Initial MVP release (Phase 1). Single asset (BTC/USDT), 4H timeframe, REST polling, read-only dashboard.
