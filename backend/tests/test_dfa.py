import numpy as np
import pandas as pd
import pytest
from services.dfa import dfa_hurst, calculate_hurst_dfa, classify_regime, conviction_multiplier


def test_dfa_hurst_random_walk():
    np.random.seed(42)
    rw = np.random.randn(500)
    h = dfa_hurst(rw)
    assert 0.3 < h < 0.7


def test_dfa_hurst_trending():
    t = np.linspace(0, 10, 500) + np.random.randn(500) * 0.1
    h = dfa_hurst(t)
    assert h > 0.5


def test_dfa_hurst_too_short():
    h = dfa_hurst(np.array([1.0, 2.0, 3.0]))
    assert h == 0.5


def test_calculate_hurst_dfa():
    np.random.seed(42)
    prices = pd.Series(np.cumprod(1 + np.random.randn(300) * 0.02) * 100)
    h = calculate_hurst_dfa(prices, window=150)
    assert isinstance(h, float)
    assert 0 < h < 1


def test_classify_regime():
    assert classify_regime(0.6) == "Trending"
    assert classify_regime(0.4) == "Mean_Reverting"
    assert classify_regime(0.5) == "Random_Walk"
    assert classify_regime(0.55) == "Random_Walk"
    assert classify_regime(0.45) == "Random_Walk"
    assert classify_regime(0.551) == "Trending"
    assert classify_regime(0.449) == "Mean_Reverting"


def test_conviction_multiplier():
    assert conviction_multiplier(0.5) == 0.0
    assert conviction_multiplier(0.7) == pytest.approx(0.8)
    assert conviction_multiplier(0.3) == pytest.approx(0.8)
    assert conviction_multiplier(1.0) == pytest.approx(2.0)
    assert conviction_multiplier(0.0) == pytest.approx(2.0)
