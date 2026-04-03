import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { getBackendBaseUrl } from '../config.js';

const MAX_HISTORY = 10;

/**
 * Normalizes API/socket payload to { id, speed, created_at }.
 */
function normalizeRow(row) {
  if (!row || typeof row.speed !== 'number') return null;
  return {
    id: row.id,
    speed: row.speed,
    created_at: row.created_at,
  };
}

/**
 * Keeps last N readings in chronological order (oldest → newest).
 */
function pushHistory(prev, row) {
  const next = [...prev, row];
  if (next.length > MAX_HISTORY) {
    return next.slice(-MAX_HISTORY);
  }
  return next;
}

/**
 * Loads initial chart data from REST, then streams updates over Socket.IO.
 */
export function useSpeedData() {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [history, setHistory] = useState([]);
  const [connection, setConnection] = useState('connecting');
  const [lastError, setLastError] = useState(null);

  const socketRef = useRef(null);

  const base = getBackendBaseUrl();
  const restPrefix = base ? `${base}` : '';

  const loadRecent = useCallback(async () => {
    try {
      const { data: rows } = await axios.get(`${restPrefix}/speed/recent`, {
        params: { limit: MAX_HISTORY },
      });
      const normalized = (Array.isArray(rows) ? rows : []).map(normalizeRow).filter(Boolean);
      if (normalized.length) {
        setHistory(normalized);
        setCurrentSpeed(normalized[normalized.length - 1].speed);
      }
      setLastError(null);
    } catch (e) {
      console.warn('Failed to load recent speeds', e);
      const message =
        axios.isAxiosError(e) && e.response
          ? `HTTP ${e.response.status}`
          : e instanceof Error
            ? e.message
            : 'Failed to load history';
      setLastError(message);
    }
  }, [restPrefix]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    setConnection('connecting');
    setLastError(null);

    const socket = io(base || undefined, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const onConnect = () => {
      setConnection('connected');
      setLastError(null);
    };

    const onDisconnect = (reason) => {
      setConnection('disconnected');
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    };

    const onConnectError = (err) => {
      setConnection('error');
      setLastError(err.message || 'Connection failed');
    };

    const onSpeedUpdate = (payload) => {
      const row = normalizeRow(payload);
      if (!row) return;
      setCurrentSpeed(row.speed);
      setHistory((prev) => pushHistory(prev, row));
    };

    const onReconnectAttempt = () => setConnection('connecting');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.on('speed_update', onSpeedUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.off('speed_update', onSpeedUpdate);
      socket.close();
      socketRef.current = null;
    };
  }, [base]);

  return {
    currentSpeed,
    history,
    connection,
    lastError,
    retry: loadRecent,
  };
}
