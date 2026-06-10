from pydantic import BaseModel
from typing import Optional


class Candle(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float


class VolumeBar(BaseModel):
    time: int
    value: float
    color: str


class HPoint(BaseModel):
    time: int
    value: float


class TimeframeResult(BaseModel):
    timeframe: str
    hurst_exponent: float
    regime: str
    conviction_multiplier: float
    action: str


class AnalysisResponse(BaseModel):
    symbol: str
    exchange: str
    dfa_window: int
    results: list[TimeframeResult]
    chart_data: list[Candle]
    volume_data: list[VolumeBar]
    h_history: list[HPoint]
