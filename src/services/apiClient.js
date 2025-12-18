// Simple API client using fetch with credentials included.
// Default to relative `/api` so Vite dev proxy (if configured) is used
// and the browser sees the same origin for cookies.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const buildUrl = (path) => {
  if (!path) return API_BASE;
  // allow absolute urls
  if (path.startsWith('http')) return path;
  // ensure leading slash
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

export const apiGet = async (path) => {
  const res = await fetch(buildUrl(path), { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const apiPost = async (path, body) => {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const apiPut = async (path, body) => {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const apiDelete = async (path) => {
  const res = await fetch(buildUrl(path), { method: 'DELETE', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export default { apiGet, apiPost, apiPut, apiDelete };

// Health ping helper; returns { ok: boolean, info }
export const apiHealth = async () => {
  try {
    const res = await fetch(buildUrl('/health'), { credentials: 'include' });
    if (!res.ok) return { ok: false, info: `status ${res.status}` };
    const data = await res.json();
    return { ok: !!data?.ok, info: data };
  } catch (e) {
    return { ok: false, info: e?.message || 'network error' };
  }
};
