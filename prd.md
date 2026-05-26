# 📄 Product Requirements Document (PRD)

**Project Name:** Fractal Regime-Adaptive System (FRAS) Dashboard  
**Document Version:** 1.0  
**Date:** May 26, 2026  
**Product Manager:** [Your Name/Title]  
**Status:** Approved for MVP Development

---

## 1. Executive Summary & Product Vision

**Vision:** To democratize institutional-grade econophysics and fractal mathematics for algorithmic and discretionary traders, providing real-time market regime detection to eliminate strategy mismatch and optimize risk-adjusted returns.

**Summary:** FRAS is a web-based quantitative analytics dashboard that calculates the **Hurst Exponent ($H$)** via Detrended Fluctuation Analysis (DFA) to diagnose real-time market structure. By identifying whether a market is trending, mean-reverting, or operating as a random walk, FRAS acts as a "master switch," telling traders exactly which mathematical strategy to deploy and how to size their risk.

## 2. Problem Statement

Retail and prosumer traders consistently suffer from **"strategy mismatch"** and **"whipsaw drawdowns."**

- A trend-following algorithm will bleed capital in a sideways, choppy market.
- A mean-reversion algorithm will be destroyed by a sudden, persistent breakout (fat-tail event).
- Traditional technical indicators (RSI, MACD, Moving Averages) assume Gaussian (normal) distributions and lag significantly. They measure _price_, but they fail to measure _market structure and memory_.

**The Solution:** FRAS shifts the focus from predicting _price direction_ to mathematically diagnosing the _current state of market chaos_, allowing users to adapt their strategies to the actual fractal dimension of the asset.

## 3. Target Audience & User Personas

| Persona                            | Description                                                      | Pain Point                                                                  | How FRAS Solves It                                                                               |
| :--------------------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **The Quant Retail Trader**        | Codes in Python, builds custom bots, trades crypto/forex.        | Overfitting backtests; bots fail in live markets due to regime shifts.      | Provides a robust, mathematically sound regime-filter API to integrate into their bots.          |
| **The Prop Firm Trader**           | Trades institutional capital, strictly bound by drawdown limits. | Getting stopped out by choppy markets; failing evaluations due to variance. | The "Random Walk" filter forces them to sit in cash during low-edge periods, preserving capital. |
| **The Discretionary Swing Trader** | Trades manually using charts, holds positions for days/weeks.    | Entering breakouts that immediately reverse (fake-outs).                    | The Hurst Gauge visually warns them if a breakout lacks "long-term memory" (persistence).        |

## 4. Core Value Proposition

1. **Mathematical Edge:** Uses Detrended Fluctuation Analysis (DFA) instead of biased, outdated Rescaled Range (R/S) analysis.
2. **Capital Preservation:** Explicitly identifies "Random Walk" phases, advising users to halt trading and preserve capital.
3. **Dynamic Risk Sizing:** Introduces the "Conviction Multiplier," scaling position sizes based on the mathematical strength of the current regime.
4. **Zero-Lag UI:** Astro + React architecture ensures the heavy math is processed on the backend while the frontend remains buttery smooth.

---

## 5. Functional Requirements

### 5.1. Backend (The Math Engine - Python/FastAPI)

- **FR-1.1 Data Ingestion:** Fetch OHLCV (Open, High, Low, Close, Volume) data for requested assets via `ccxt` (supporting Binance, Bybit, Coinbase).
- **FR-1.2 Fractal Calculation:** Compute the rolling Hurst Exponent using DFA on log returns over a configurable window (default: 150 periods on the 4H timeframe).
- **FR-1.3 Regime Classification:** Categorize the market into three states:
  - $H > 0.55$: Trending (Persistent)
  - $H < 0.45$: Mean-Reverting (Anti-Persistent)
  - $0.45 \le H \le 0.55$: Random Walk (Noise)
- **FR-1.4 Conviction Sizing:** Calculate a risk multiplier (0.0x to 2.0x) based on the absolute distance of $H$ from 0.5.
- **FR-1.5 API Delivery:** Serve data via a low-latency RESTful JSON endpoint.

### 5.2. Frontend (The Dashboard - Astro/React)

- **FR-2.1 Regime Display:** Prominently display the current market regime with color-coded UI (Green=Trend, Blue=Mean Rev, Gray=Random).
- **FR-2.2 Hurst Gauge:** Render a visual spectrum gauge mapping the $H$ value from 0.30 to 0.70 with a real-time indicator needle.
- **FR-2.3 Charting:** Render an interactive, high-performance candlestick chart using TradingView’s `lightweight-charts`.
- **FR-2.4 Actionable Insights:** Display plain-English trading directives based on the current regime (e.g., "Deploy Bollinger/RSI Mean Reversion").
- **FR-2.5 Asset Switching:** Allow users to input different ticker symbols (e.g., ETH/USDT, SOL/USDT) and dynamically update the dashboard.

---

## 6. Non-Functional Requirements

- **Performance:**
  - API response time must be `< 250ms` for cached data, and `< 2.0s` for cold data fetches.
  - Frontend Time to Interactive (TTI) must be `< 1.5s` (leveraging Astro's static shell).
- **Scalability:** Backend must handle 1,000 concurrent API requests without degradation (via Redis caching).
- **Reliability:** 99.9% uptime for the API. Graceful degradation if the exchange API (e.g., Binance) rate-limits or fails.
- **Security:** No user authentication or API keys stored on the backend for MVP. (Users use public market data).

---

## 7. Technical Architecture & Data Flow

    [Exchange API (Binance/Bybit)]
           │ (OHLCV Data)
           ▼
    [Python FastAPI Backend] ──(nolds/pandas)──> Calculates DFA & Hurst (H)
           │ (JSON Payload)
           ▼
    [Astro Frontend Shell] ──(React Islands)──> Renders UI & TradingView Chart
           │
           ▼
    [End User Browser]

**Tech Stack:**

- **Backend:** Python 3.11+, FastAPI, `ccxt`, `pandas`, `numpy`, `nolds`, Uvicorn.
- **Frontend:** Astro (SSG/SSR hybrid), React 18 (for interactive islands), Tailwind CSS, `lightweight-charts`.
- **Infrastructure:** Dockerized containers, deployable via Vercel (Frontend) and Railway/Fly.io/Render (Backend).

---

## 8. Product Roadmap & Phasing

### Phase 1: MVP (Current Scope)

- **Goal:** Prove the concept and UI/UX.
- **Features:** Single asset (BTC/USDT), 4H timeframe, REST API polling (60s), read-only dashboard, basic DFA calculation.
- **Timeline:** 4 Weeks.

### Phase 2: Prosumer Expansion (V2)

- **Goal:** Multi-asset support and real-time data.
- **Features:**
  - WebSockets for real-time $H$ updates on candle close.
  - Multi-timeframe analysis (e.g., Daily $H$ vs 1H $H$).
  - User-defined assets and custom DFA window sizes.
  - Telegram/Discord webhook alerts for "Regime Flips".
- **Timeline:** 8 Weeks.

### Phase 3: Institutional / Auto-Trading (V3)

- **Goal:** Close the loop from analytics to execution.
- **Features:**
  - **MF-DFA (Multifractal Spectrum):** Calculate the width of the multifractal spectrum to measure volatility intermittency.
  - **Paper Trading Engine:** Simulate the FRAS strategy live and track Sharpe/Sortino ratios.
  - **Exchange Integration:** Secure OAuth/API key vault to allow the system to execute trades directly based on regime shifts.
- **Timeline:** 16 Weeks.

---

## 9. Success Metrics (KPIs)

| Category            | Metric                   | Target (MVP)    | Target (V2)          |
| :------------------ | :----------------------- | :-------------- | :------------------- |
| **System**          | API Latency (p95)        | < 500ms         | < 100ms (WebSockets) |
| **System**          | Uptime                   | 99.0%           | 99.9%                |
| **Engagement**      | Daily Active Users (DAU) | 100             | 2,500                |
| **Engagement**      | Avg. Session Duration    | > 5 mins        | > 15 mins            |
| **Trading (Paper)** | Max Drawdown Reduction   | 20% vs Baseline | 40% vs Baseline      |

---

## 10. Risks & Mitigations

| Risk                              | Impact                                                                    | Likelihood | Mitigation Strategy                                                                                                                                       |
| :-------------------------------- | :------------------------------------------------------------------------ | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Math Failure on Low Liquidity** | DFA outputs garbage data on low-volume altcoins, leading to bad trades.   | High       | Implement a strict **Volume Filter** in the backend. If 24h volume < $10M, return an "Insufficient Liquidity" error instead of an $H$ value.              |
| **Exchange Rate Limiting**        | Backend gets IP banned by Binance for fetching data too often.            | Medium     | Implement **Redis caching**. Only fetch new OHLCV data when a new candle actually closes. Serve cached data for all interim requests.                     |
| **User Financial Loss**           | Users misinterpret the dashboard and lose money, blaming the platform.    | High       | **Legal/UX Mitigation:** Prominent "Not Financial Advice" disclaimers. Default UI labels should say "Mathematical Regime" rather than "Buy/Sell Signals". |
| **Compute Bottlenecks**           | `nolds.dfa` blocks the Python event loop, crashing the server under load. | Medium     | Run the DFA calculation in a separate **thread pool** or use FastAPI's `BackgroundTasks` / Celery worker queue for heavy math.                            |

---

## 11. Go-to-Market (GTM) Strategy

1. **Open Source the Math:** Publish the Python backend logic as an open-source library on GitHub (`pip install fractal-regime`). This builds trust and authority in the quant community.
2. **Content Marketing:** Publish a deep-dive article on Medium/Substack titled: _"Why Your Moving Averages Fail: The Mathematics of Market Memory."_ Include screenshots of the FRAS dashboard.
3. **Community Integration:** Release a lightweight version of the indicator on TradingView (Pine Script) that links back to the full web app for the advanced DFA math.

---

**Sign-offs:**

- [ ] Product Management
- [ ] Engineering Lead
- [ ] Quantitative Research Lead
