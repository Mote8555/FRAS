import pandas as pd
from fastapi import APIRouter, Query, Depends
from redis.asyncio import Redis

from core.dependencies import get_redis, close_redis
from core.config import settings
from models.schemas import AnalysisResponse, Candle, VolumeBar, HPoint, TimeframeResult
from services.dfa import calculate_hurst_dfa, classify_regime, conviction_multiplier, action_text
from services.exchange import fetch_ohlcv, get_volume_usd, ExchangeError
from services.cache import get_ohlcv, set_ohlcv, get_h_history, append_h_history

router = APIRouter(prefix="/api/v2", tags=["v2"])


async def run_analysis(
    symbol: str,
    exchange: str,
    timeframes: str,
    dfa_window: int,
    redis: Redis,
) -> AnalysisResponse:
    timeframe_list = [t.strip() for t in timeframes.split(",") if t.strip()]
    if not timeframe_list:
        timeframe_list = [settings.default_timeframes]

    results = []
    chart_data = []
    volume_data = []
    latest_df = None

    for tf in timeframe_list:
        cache_key = f"{exchange}:{symbol}:{tf}"
        cached = await get_ohlcv(redis, cache_key)
        if cached:
            df = pd.DataFrame(cached)
        else:
            try:
                df = fetch_ohlcv(exchange, symbol, timeframe=tf, limit=200)
            except ExchangeError as e:
                results.append(TimeframeResult(
                    timeframe=tf, hurst_exponent=0.5, regime="Error",
                    conviction_multiplier=0.0, action=str(e),
                ))
                continue
            await set_ohlcv(redis, cache_key, df.to_dict("records"))

        vol_usd = get_volume_usd(df)
        if vol_usd < settings.min_24h_volume_usd:
            results.append(TimeframeResult(
                timeframe=tf, hurst_exponent=0.5, regime="Low_Liquidity",
                conviction_multiplier=0.0,
                action=f"Insufficient volume ${vol_usd:,.0f} < ${settings.min_24h_volume_usd:,}",
            ))
            continue

        h_value = calculate_hurst_dfa(df["close"], window=dfa_window)
        regime = classify_regime(h_value)
        cv = conviction_multiplier(h_value)
        action = action_text(regime)

        results.append(TimeframeResult(
            timeframe=tf, hurst_exponent=h_value,
            regime=regime, conviction_multiplier=round(cv, 2),
            action=action,
        ))

        if latest_df is None:
            latest_df = df
            chart_data = [
                Candle(
                    time=int(row["timestamp"] / 1000),
                    open=row["open"], high=row["high"],
                    low=row["low"], close=row["close"],
                )
                for _, row in df.iterrows()
            ]
            volume_data = [
                VolumeBar(
                    time=int(row["timestamp"] / 1000),
                    value=row["volume"],
                    color="#10B981" if row["close"] >= row["open"] else "#EF4444",
                )
                for _, row in df.iterrows()
            ]

    h_hist = await get_h_history(redis, symbol)
    if results and chart_data:
        new_point = {"time": chart_data[-1].time, "value": results[0].hurst_exponent}
        if not h_hist or h_hist[0]["time"] != new_point["time"]:
            await append_h_history(redis, symbol, new_point)
            h_hist = [new_point] + h_hist

    ascending = list(reversed(h_hist[:100]))
    return AnalysisResponse(
        symbol=symbol, exchange=exchange, dfa_window=dfa_window,
        results=results, chart_data=chart_data,
        volume_data=volume_data,
        h_history=[HPoint(**p) for p in ascending],
    )


@router.get("/analyze", response_model=AnalysisResponse)
async def analyze_endpoint(
    symbol: str = Query(settings.default_symbol),
    exchange: str = Query(settings.default_exchange),
    timeframes: str = Query(settings.default_timeframes),
    dfa_window: int = Query(settings.default_dfa_window),
    redis: Redis = Depends(get_redis),
):
    return await run_analysis(symbol, exchange, timeframes, dfa_window, redis)
