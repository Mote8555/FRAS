import { useState, useEffect, useRef, useCallback } from 'react';
import type { AnalysisResponse } from '../lib/types';

const WS_URL = 'ws://localhost:8000/api/v2/ws';
const REST_URL = 'http://localhost:8000/api/v2/analyze';

export function useMarketData(params: {
  symbol: string;
  exchange: string;
  timeframes: string[];
  dfa_window: number;
}) {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stableKey = `${params.symbol}|${params.exchange}|${params.timeframes.join(',')}|${params.dfa_window}`;

  const fetchRest = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        symbol: params.symbol,
        exchange: params.exchange,
        timeframes: params.timeframes.join(','),
        dfa_window: String(params.dfa_window),
      });
      const res = await fetch(`${REST_URL}?${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [stableKey]);

  useEffect(() => {
    setLoading(true);
    fetchRest();

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        symbol: params.symbol,
        exchange: params.exchange,
        timeframes: params.timeframes,
        dfa_window: params.dfa_window,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'analysis') {
          setData(msg.data);
          setError(null);
        }
      } catch {
        /* ignore parse errors */
      }
      setLoading(false);
    };

    ws.onerror = () => {
      if (intervalRef.current === null) {
        intervalRef.current = window.setInterval(fetchRest, 60000);
      }
    };

    ws.onclose = () => {
      if (intervalRef.current === null) {
        intervalRef.current = window.setInterval(fetchRest, 60000);
      }
    };

    return () => {
      ws.close();
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchRest, stableKey]);

  return { data, loading, error };
}
