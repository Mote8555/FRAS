from fakeredis.aioredis import FakeRedis
from redis.asyncio import Redis
from core.config import settings

redis_client: Redis | FakeRedis | None = None


async def get_redis() -> Redis | FakeRedis:
    global redis_client
    if redis_client is None:
        if settings.use_fake_redis:
            redis_client = FakeRedis()
        else:
            redis_client = Redis.from_url(settings.redis_url)
    return redis_client


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.aclose()
        redis_client = None
