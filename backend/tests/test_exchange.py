import pandas as pd
import pytest

from services.exchange import get_volume_usd, parse_timeframe_to_minutes


@pytest.mark.parametrize(
    "timeframe,expected",
    [
        ("15m", 15),
        ("1h", 60),
        ("4h", 240),
        ("1d", 1440),
        ("2d", 2880),
    ],
)
def test_parse_timeframe_to_minutes(timeframe, expected):
    assert parse_timeframe_to_minutes(timeframe) == expected


def test_get_volume_usd_uses_24h_window_for_4h():
    df = pd.DataFrame({
        "timestamp": [i for i in range(6)],
        "open": [100] * 6,
        "high": [101] * 6,
        "low": [99] * 6,
        "close": [100] * 6,
        "volume": [10] * 6,
    })

    assert get_volume_usd(df, "4h") == 6 * 10 * 100


def test_get_volume_usd_uses_24h_window_for_15m():
    df = pd.DataFrame({
        "timestamp": [i for i in range(100)],
        "open": [100] * 100,
        "high": [101] * 100,
        "low": [99] * 100,
        "close": [200] * 100,
        "volume": [1] * 100,
    })

    assert get_volume_usd(df, "15m") == 96 * 1 * 200


def test_get_volume_usd_returns_zero_for_empty_df():
    df = pd.DataFrame(columns=["timestamp", "open", "high", "low", "close", "volume"])
    assert get_volume_usd(df, "1h") == 0.0


def test_parse_timeframe_to_minutes_invalid():
    with pytest.raises(ValueError):
        parse_timeframe_to_minutes("unknown")
