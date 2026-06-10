import numpy as np


def dfa_hurst(series, min_window=4, max_window=None):
    n = len(series)
    if max_window is None:
        max_window = n // 4
    if n < min_window * 2:
        return 0.5

    profile = np.cumsum(series - np.mean(series))
    window_sizes = np.logspace(np.log10(min_window), np.log10(max_window), num=30, dtype=int)
    window_sizes = np.unique(window_sizes)
    window_sizes = window_sizes[window_sizes >= min_window]
    window_sizes = window_sizes[window_sizes <= n // 2]

    fluctuations = []
    valid_windows = []
    for m in window_sizes:
        num_segments = n // m
        if num_segments < 2:
            continue
        segments = profile[:num_segments * m].reshape(num_segments, m)
        x = np.arange(m)
        seg_rms = []
        for seg in segments:
            coeffs = np.polyfit(x, seg, 1)
            trend = np.polyval(coeffs, x)
            residuals = seg - trend
            rms = np.sqrt(np.mean(residuals ** 2))
            seg_rms.append(rms)
        fluctuations.append(np.mean(seg_rms))
        valid_windows.append(m)

    if len(valid_windows) < 2:
        return 0.5
    coeffs = np.polyfit(np.log(valid_windows), np.log(fluctuations), 1)
    return coeffs[0]


def calculate_hurst_dfa(prices, window=150):
    log_returns = np.log(prices / prices.shift(1)).dropna()
    if len(log_returns) < window:
        return 0.5

    recent_returns = log_returns.iloc[-window:].values
    h_value = dfa_hurst(recent_returns)

    return round(h_value, 4)


def classify_regime(h: float) -> str:
    if h > 0.55:
        return "Trending"
    elif h < 0.45:
        return "Mean_Reverting"
    return "Random_Walk"


def conviction_multiplier(h: float) -> float:
    return min(abs(h - 0.5) * 4, 2.0)


def action_text(regime: str) -> str:
    if regime == "Trending":
        return "Deploy Momentum/Breakout Strategy."
    elif regime == "Mean_Reverting":
        return "Deploy Bollinger/RSI Mean Reversion."
    return "FLAT. Sit in cash."
