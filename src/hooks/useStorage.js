// src/hooks/useStorage.js
// Drop-in replacement for useLocalStorage.
// Same signature: useStorage(key, defaultValue)
//
// Behaviour:
//   1. Reads from server (port 3001) on mount — server is the source of truth
//   2. Falls back to localStorage if server is unavailable
//   3. Writes to both server AND localStorage on every update
//   4. First write auto-migrates any existing localStorage value to the server

import { useState, useEffect, useCallback, useRef } from 'react';

const SERVER = process.env.REACT_APP_API_URL || 'http://localhost:3001';
let serverAvailable = null;  // null = unknown, true/false = checked

// Fire-and-forget server write — never throws
async function serverWrite(key, data) {
  try {
    await fetch(`${SERVER}/api/data/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    serverAvailable = true;
  } catch {
    serverAvailable = false;
  }
}

// Server read — returns { found: true, data } or { found: false }
async function serverRead(key) {
  try {
    const res = await fetch(`${SERVER}/api/data/${key}`);
    if (res.status === 404) { serverAvailable = true; return { found: false }; }
    if (!res.ok)            { serverAvailable = false; return { found: false }; }
    const json = await res.json();
    serverAvailable = true;
    return { found: true, data: json.data };
  } catch {
    serverAvailable = false;
    return { found: false };
  }
}

// Read from localStorage (same logic as original useLocalStorage)
function lsRead(key, defaultValue) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

// Write to localStorage (silent on quota errors)
function lsWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — server copy is the fallback
  }
}

export function useStorage(key, defaultValue) {
  const [value, setValueRaw] = useState(() => lsRead(key, defaultValue));
  const initialised = useRef(false);

  // On mount: try to load from server; migrate localStorage if server has nothing yet
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await serverRead(key);

      if (cancelled) return;

      if (result.found) {
        // Server has data — use it and sync to localStorage
        setValueRaw(result.data);
        lsWrite(key, result.data);
      } else if (serverAvailable) {
        // Server is reachable but has no file yet — migrate from localStorage
        const local = lsRead(key, defaultValue);
        await serverWrite(key, local);
      }
      // If server unreachable, we already have localStorage value from useState init

      initialised.current = true;
    })();

    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line 

  const setValue = useCallback((updater) => {
    setValueRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      // Always write to localStorage immediately (sync, so UI never lags)
      lsWrite(key, next);

      // Write to server async (fire-and-forget)
      serverWrite(key, next);

      return next;
    });
  }, [key]);

  return [value, setValue];
}

// Convenience: expose server availability for a status indicator if wanted
export function isServerAvailable() {
  return serverAvailable;
}
