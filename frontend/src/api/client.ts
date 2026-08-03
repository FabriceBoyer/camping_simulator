// In production (Docker/nginx) requests default to a relative "/api" path,
// proxied to the backend container. In dev, default to the local Go server.
const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8787');

export interface SaveMeta {
  id: string;
  name: string;
  updatedAt: string;
}

export interface SaveRecord extends SaveMeta {
  state: unknown;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function listCloudSaves(): Promise<SaveMeta[]> {
  return request('/api/saves');
}

export function createCloudSave(name: string, state: unknown): Promise<SaveRecord> {
  return request('/api/saves', { method: 'POST', body: JSON.stringify({ name, state }) });
}

export function getCloudSave(id: string): Promise<SaveRecord> {
  return request(`/api/saves/${id}`);
}

export function deleteCloudSave(id: string): Promise<void> {
  return request(`/api/saves/${id}`, { method: 'DELETE' });
}
