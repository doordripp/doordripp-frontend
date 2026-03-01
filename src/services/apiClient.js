// Simple API client using fetch with credentials included.
// Use absolute URL from env var or default to localhost backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://doordripp-backend.onrender.com';

const buildUrl = (path) => {
  if (!path) return `${API_BASE}/api`;
  // allow absolute urls
  if (path.startsWith('http')) return path;
  // ensure leading slash and /api prefix
  const pathWithSlash = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}/api${pathWithSlash}`;
};

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('auth_token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const apiGet = async (path) => {
  const res = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) {
    // Attach status to error for better handling in catch blocks
    data.status = res.status;
    throw data;
  }
  return data;
};

export const apiPost = async (path, body) => {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    // Attach status to error for better handling in catch blocks
    data.status = res.status;
    throw data;
  }
  return data;
};

export const apiPut = async (path, body) => {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    // Attach status to error for better handling in catch blocks
    data.status = res.status;
    throw data;
  }
  return data;
};

export const apiDelete = async (path) => {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    credentials: 'include',
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) {
    // Attach status to error for better handling in catch blocks
    data.status = res.status;
    throw data;
  }
  return data;
};

export const apiBlob = async (path) => {
  const res = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return await res.blob();
};

export default { apiGet, apiPost, apiPut, apiDelete, apiBlob };

// Health ping helper; returns { ok: boolean, info }
export const apiHealth = async () => {
  try {
    const res = await fetch(buildUrl('/health'), {
      credentials: 'include',
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) return { ok: false, info: `status ${res.status}` };
    const data = await res.json();
    return { ok: !!data?.ok, info: data };
  } catch (e) {
    return { ok: false, info: e?.message || 'network error' };
  }
};
