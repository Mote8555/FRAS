import json
from redis.asyncio import Redis
from fakeredis.aioredis import FakeRedis

CACHE_TTL = 300


async def get_ohlcv(redis: Redis | FakeRedis, key: str) -> list | None:
    data = await redis.get(f"ohlcv:{key}")
    if data:
        return json.loads(data)
    return None


async def set_ohlcv(redis: Redis | FakeRedis, key: str, data: list):
    await redis.set(f"ohlcv:{key}", json.dumps(data), ex=CACHE_TTL)


async def get_h_history(redis: Redis | FakeRedis, symbol: str) -> list:
    data = await redis.lrange(f"h_hist:{symbol}", 0, -1)
    return [json.loads(item) for item in data]


async def append_h_history(redis: Redis | FakeRedis, symbol: str, point: dict, maxlen: int = 500):
    await redis.lpush(f"h_hist:{symbol}", json.dumps(point))
    await redis.ltrim(f"h_hist:{symbol}", 0, maxlen - 1)


async def get_last_candle_time(redis: Redis | FakeRedis, exchange: str, symbol: str, timeframe: str) -> int | None:
    val = await redis.get(f"last_candle:{exchange}:{symbol}:{timeframe}")
    return int(val) if val else None


async def set_last_candle_time(redis: Redis | FakeRedis, exchange: str, symbol: str, timeframe: str, timestamp: int):
    await redis.set(f"last_candle:{exchange}:{symbol}:{timeframe}", timestamp, ex=CACHE_TTL)
