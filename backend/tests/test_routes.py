import numpy as np
import pandas as pd
import pytest
from unittest.mock import patch


@pytest.fixture
def mock_ohlcv():
    np.random.seed(42)
    n = 200
    base = 50000 + np.cumsum(np.random.randn(n) * 100)
    return pd.DataFrame({
        "timestamp": [i * 3600000 for i in range(n)],
        "open": base,
        "high": base + np.random.rand(n) * 200,
        "low": base - np.random.rand(n) * 200,
        "close": base + np.random.randn(n) * 50,
        "volume": np.random.rand(n) * 1000 + 100,
    })


@pytest.mark.asyncio
async def test_analyze_endpoint(async_client, mock_ohlcv):
    with patch("routes.analysis.fetch_ohlcv", return_value=mock_ohlcv):
        response = await async_client.get(
            "/api/v2/analyze",
            params={"symbol": "BTC/USDT", "exchange": "binance", "timeframes": "4h", "dfa_window": 150},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "BTC/USDT"
    assert data["exchange"] == "binance"
    assert data["dfa_window"] == 150
    assert len(data["results"]) == 1
    assert data["results"][0]["timeframe"] == "4h"
    assert 0 < data["results"][0]["hurst_exponent"] < 1
    assert data["results"][0]["regime"] in ("Trending", "Mean_Reverting", "Random_Walk")
    assert len(data["chart_data"]) == 200
    assert len(data["volume_data"]) == 200
    assert "h_history" in data


@pytest.mark.asyncio
async def test_analyze_multi_timeframe(async_client, mock_ohlcv):
    with patch("routes.analysis.fetch_ohlcv", return_value=mock_ohlcv):
        response = await async_client.get(
            "/api/v2/analyze",
            params={"symbol": "ETH/USDT", "exchange": "binance", "timeframes": "1h,4h,1d", "dfa_window": 100},
        )
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 3
    timeframes = [r["timeframe"] for r in data["results"]]
    assert "1h" in timeframes
    assert "4h" in timeframes
    assert "1d" in timeframes


@pytest.mark.asyncio
async def test_analyze_unsupported_exchange(async_client, mock_ohlcv):
    from services.exchange import ExchangeError
    with patch("routes.analysis.fetch_ohlcv", side_effect=ExchangeError("Unsupported exchange: kraken")):
        response = await async_client.get(
            "/api/v2/analyze",
            params={"symbol": "BTC/USDT", "exchange": "kraken", "timeframes": "4h"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["results"][0]["regime"] == "Error"


@pytest.mark.asyncio
async def test_health_check(async_client):
    response = await async_client.get("/api/v2/analyze", params={"symbol": "BTC/USDT", "exchange": "binance", "timeframes": "4h"})
    assert response.status_code in (200, 422, 500)
