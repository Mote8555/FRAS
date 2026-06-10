import json
import pytest
from fakeredis.aioredis import FakeRedis
from services.cache import get_ohlcv, set_ohlcv, get_h_history, append_h_history


@pytest.fixture
def redis():
    return FakeRedis()


@pytest.mark.asyncio
async def test_set_get_ohlcv(redis):
    key = "binance:BTC/USDT:4h"
    data = [{"timestamp": 1000, "open": 50000}]
    await set_ohlcv(redis, key, data)
    result = await get_ohlcv(redis, key)
    assert result == data


@pytest.mark.asyncio
async def test_get_missing_ohlcv(redis):
    result = await get_ohlcv(redis, "nonexistent")
    assert result is None


@pytest.mark.asyncio
async def test_h_history(redis):
    await append_h_history(redis, "BTC/USDT", {"time": 1000, "value": 0.6})
    await append_h_history(redis, "BTC/USDT", {"time": 2000, "value": 0.55})
    history = await get_h_history(redis, "BTC/USDT")
    assert len(history) == 2
    assert history[0]["value"] == 0.55
    assert history[1]["time"] == 1000


@pytest.mark.asyncio
async def test_h_history_maxlen(redis):
    for i in range(10):
        await append_h_history(redis, "TEST", {"time": i, "value": 0.5}, maxlen=5)
    history = await get_h_history(redis, "TEST")
    assert len(history) == 5
