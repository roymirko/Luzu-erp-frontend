const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('erp_auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<{ data: T; error: null } | { data: null; error: string }> {
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error || `HTTP ${res.status}` };
  return { data: json as T, error: null };
}

export async function apiGet<T>(path: string): Promise<{ data: T; error: null } | { data: null; error: string }> {
  const res = await fetch(`${API_BASE}${path}`, { headers: getHeaders() });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<{ data: T; error: null } | { data: null; error: string }> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: getHeaders(), body: body ? JSON.stringify(body) : undefined });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<{ data: T; error: null } | { data: null; error: string }> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: getHeaders(), body: body ? JSON.stringify(body) : undefined });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<{ data: T; error: null } | { data: null; error: string }> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PATCH', headers: getHeaders(), body: body ? JSON.stringify(body) : undefined });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<{ data: T; error: null } | { data: null; error: string }> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: getHeaders() });
  return handleResponse<T>(res);
}
