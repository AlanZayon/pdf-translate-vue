import { ref, onUnmounted } from 'vue';
import { API_URL, fetchSessionSnapshot } from '../services/campaignApi.js';
import { getAuthHeaders, isDevAuth } from './useAuth.js';

async function authToken() {
  const headers = await getAuthHeaders();
  const auth = headers.Authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

function wsBase() {
  const base = API_URL.replace(/\/$/, '');
  if (base.startsWith('https://')) return base.replace(/^https/, 'wss');
  if (base.startsWith('http://')) return base.replace(/^http/, 'ws');
  return `ws://${base}`;
}

/**
 * Live GameSession sync: WS for events + HTTP snapshot fallback on reconnect.
 */
export function useGameSessionSocket(sessionIdRef, handlers = {}) {
  const connected = ref(false);
  const lastSeq = ref(0);
  const error = ref('');
  let socket = null;
  let closed = false;
  let pingTimer = null;

  function handleEnvelope(msg) {
    if (typeof msg.seq === 'number' && msg.seq > lastSeq.value) {
      lastSeq.value = msg.seq;
    }
    if (msg.type === 'snapshot' && msg.payload) {
      if (typeof msg.payload.last_seq === 'number') {
        lastSeq.value = Math.max(lastSeq.value, msg.payload.last_seq);
      }
      handlers.onSnapshot?.(msg.payload);
      return;
    }
    handlers.onEvent?.(msg);
  }

  async function connect() {
    closed = false;
    error.value = '';
    const sessionId = typeof sessionIdRef === 'function' ? sessionIdRef() : sessionIdRef.value;
    if (!sessionId) return;

    try {
      const token = await authToken();
      const url = `${wsBase()}/ws/sessions/${sessionId}?token=${encodeURIComponent(token)}&after_seq=${lastSeq.value}`;
      socket = new WebSocket(url);
      socket.onopen = () => {
        connected.value = true;
        pingTimer = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };
      socket.onmessage = (ev) => {
        try {
          handleEnvelope(JSON.parse(ev.data));
        } catch {
          /* ignore */
        }
      };
      socket.onerror = () => {
        error.value = 'WebSocket error';
      };
      socket.onclose = () => {
        connected.value = false;
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = null;
        if (!closed) {
          // HTTP fallback resync — table stays playable via REST actions
          fetchSessionSnapshot(sessionId, lastSeq.value)
            .then((snap) => {
              if (typeof snap.last_seq === 'number') {
                lastSeq.value = Math.max(lastSeq.value, snap.last_seq);
              }
              handlers.onSnapshot?.(snap);
            })
            .catch(() => {});
          setTimeout(() => {
            if (!closed) connect();
          }, 3000);
        }
      };
    } catch (e) {
      error.value = e.message || 'Could not open WebSocket';
      // Still hydrate via HTTP
      try {
        const snap = await fetchSessionSnapshot(sessionId, lastSeq.value);
        handlers.onSnapshot?.(snap);
      } catch {
        /* ignore */
      }
    }
  }

  function disconnect() {
    closed = true;
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = null;
    if (socket) {
      socket.close();
      socket = null;
    }
    connected.value = false;
  }

  onUnmounted(disconnect);

  return { connected, lastSeq, error, connect, disconnect };
}
