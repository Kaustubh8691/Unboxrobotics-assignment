/**
 * Backend base URL for REST + Socket.IO.
 * Empty string = same origin (Vite dev proxy forwards /speed and /socket.io).
 */
export function getBackendBaseUrl() {
  const v = import.meta.env.VITE_BACKEND_URL;
  return typeof v === 'string' ? v.replace(/\/$/, '') : '';
}
