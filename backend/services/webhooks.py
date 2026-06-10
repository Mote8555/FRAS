import httpx


async def send_telegram_alert(token: str, chat_id: str, message: str):
    if not token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    async with httpx.AsyncClient() as client:
        await client.post(url, json={"chat_id": chat_id, "text": message, "parse_mode": "Markdown"})


async def send_discord_alert(webhook_url: str, message: str):
    if not webhook_url:
        return
    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json={"content": message})


def build_alert_text(symbol: str, old_regime: str, new_regime: str, h_value: float, timeframe: str) -> str:
    return (
        f"Regime Flip — {symbol} ({timeframe})\n"
        f"{old_regime} -> {new_regime}\n"
        f"H: {h_value:.4f}"
    )
