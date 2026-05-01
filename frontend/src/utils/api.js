/**
 * Local dev: leave `VITE_API_URL` unset/empty → requests use `/api/...` (Vite proxy → :4000).
 * Production: set `VITE_API_URL` to your API origin (no trailing slash).
 */
const raw = import.meta.env.VITE_API_URL;
const trimmed = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';
export const API_BASE = trimmed || '';

/** Resolve API path: relative `/api/...` when API_BASE is empty, else absolute backend URL. */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return p;
  return `${API_BASE}${p}`;
}
