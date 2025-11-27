// Simple API client using fetch with credentials included.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

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
