from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    default_exchange: str = "binance"
    default_symbol: str = "BTC/USDT"
    default_timeframes: str = "4h"
    default_dfa_window: int = 150

    use_fake_redis: bool = True
    redis_url: str = "redis://localhost:6379"

    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    discord_webhook_url: str = ""

    cors_origins: list[str] = ["*"]

    poll_interval_seconds: int = 60
    min_24h_volume_usd: float = 10_000_000
    h_history_max: int = 500


settings = Settings()
