import ccxt
import pandas as pd

SUPPORTED_EXCHANGES = {
    "binance": ccxt.binance,
    "bybit": ccxt.bybit,
    "coinbase": ccxt.coinbase,
}


class ExchangeError(Exception):
    pass


def fetch_ohlcv(exchange_id: str, symbol: str, timeframe: str, limit: int = 200) -> pd.DataFrame:
    if exchange_id not in SUPPORTED_EXCHANGES:
        raise ExchangeError(f"Unsupported exchange: {exchange_id}")

    exchange_class = SUPPORTED_EXCHANGES[exchange_id]
    exchange = exchange_class()

    try:
        ohlcv = exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
    except ccxt.NetworkError as e:
        raise ExchangeError(f"Network error fetching from {exchange_id}: {e}")
    except ccxt.ExchangeError as e:
        raise ExchangeError(f"Exchange error from {exchange_id}: {e}")

    df = pd.DataFrame(ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"])
    return df


def get_volume_usd(df: pd.DataFrame) -> float:
    recent_volume = df["volume"].tail(6).sum()
    recent_close = df["close"].iloc[-1]
    return float(recent_volume * recent_close)
