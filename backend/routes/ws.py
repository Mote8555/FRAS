import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from routes.analysis import run_analysis
from core.dependencies import get_redis

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: dict[WebSocket, dict] = {}

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active[ws] = {}

    def disconnect(self, ws: WebSocket):
        self.active.pop(ws, None)


manager = ConnectionManager()


@router.websocket("/api/v2/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    redis = await get_redis()
    params = {}
    poll_task = None

    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)

            if msg.get("action") == "subscribe":
                if poll_task:
                    poll_task.cancel()
                    poll_task = None

                params = {
                    "symbol": msg.get("symbol", "BTC/USDT"),
                    "exchange": msg.get("exchange", "binance"),
                    "timeframes": ",".join(msg.get("timeframes", ["4h"])),
                    "dfa_window": msg.get("dfa_window", 150),
                }
                manager.active[ws] = params

                result = await run_analysis(redis=redis, **params)
                payload = json.dumps({"type": "analysis", "data": result.model_dump(mode="json")})
                await ws.send_text(payload)

                async def poll():
                    try:
                        while True:
                            await asyncio.sleep(60)
                            if ws not in manager.active:
                                break
                            result = await run_analysis(redis=redis, **manager.active[ws])
                            payload = json.dumps({"type": "analysis", "data": result.model_dump(mode="json")})
                            await ws.send_text(payload)
                    except asyncio.CancelledError:
                        pass

                poll_task = asyncio.create_task(poll())

    except (WebSocketDisconnect, asyncio.CancelledError):
        pass
    except Exception:
        pass
    finally:
        if poll_task:
            poll_task.cancel()
        manager.disconnect(ws)
