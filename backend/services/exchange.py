import math
import re

import ccxt
import pandas as pd

SUPPORTED_EXCHANGES = {
    "kraken": ccxt.kraken,
    "coinbase": ccxt.coinbase,
}

EXCHANGE_TIMEFRAMES = {
    "kraken": None,
    "coinbase": {"15m", "1h", "2h", "6h", "1d"},
}


class ExchangeError(Exception):
    pass


def fetch_ohlcv(exchange_id: str, symbol: str, timeframe: str, limit: int = 200) -> pd.DataFrame:
    if exchange_id not in SUPPORTED_EXCHANGES:
        raise ExchangeError(f"Unsupported exchange: {exchange_id}")

    supported = EXCHANGE_TIMEFRAMES.get(exchange_id)
    if supported is not None and timeframe not in supported:
        available = ", ".join(sorted(supported))
        raise ExchangeError(
            f"{exchange_id} does not support timeframe '{timeframe}'. "
            f"Available timeframes: {available}"
        )

    exchange_class = SUPPORTED_EXCHANGES[exchange_id]
    exchange = exchange_class({"enableRateLimit": True})

    try:
        ohlcv = exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
    except ccxt.NetworkError as e:
        raise ExchangeError(f"Network error fetching from {exchange_id}: {e}")
    except ccxt.ExchangeError as e:
        raise ExchangeError(f"Exchange error from {exchange_id}: {e}")

    df = pd.DataFrame(ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"])
    return df


def parse_timeframe_to_minutes(timeframe: str) -> int:
    match = re.fullmatch(r"(\d+)([mhd])", timeframe.strip().lower())
    if not match:
        raise ValueError(f"Unsupported timeframe: {timeframe}")

    value, unit = match.groups()
    value = int(value)
    if unit == "m":
        return value
    if unit == "h":
        return value * 60
    if unit == "d":
        return value * 24 * 60
    raise ValueError(f"Unsupported timeframe: {timeframe}")


def get_volume_usd(df: pd.DataFrame, timeframe: str) -> float:
    if df.empty:
        return 0.0

    timeframe_minutes = parse_timeframe_to_minutes(timeframe)
    candles_required = max(1, math.ceil(1440 / timeframe_minutes))
    recent = df.tail(candles_required)
    volume_usd = (recent["volume"] * recent["close"]).sum()
    return float(volume_usd)
