import type { AlbumProject, NewAlbumInput, PhaseRun, ProviderStatus } from '@/src/types';

const BASE_URL = 'http://localhost:8000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: customHeaders, ...rest } = options ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...customHeaders },
    ...rest,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  // Don't try to parse JSON for empty responses (204, etc.)
  const contentLength = res.headers.get('content-length');
  if (contentLength === '0' || res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Albums
  listAlbums: () => request<AlbumProject[]>('/albums'),
  getAlbum: (id: string) => request<AlbumProject>(`/albums/${id}`),
  createAlbum: (input: NewAlbumInput) => request<AlbumProject>('/albums', { method: 'POST', body: JSON.stringify(input) }),
  deleteAlbum: (id: string) => request<void>(`/albums/${id}`, { method: 'DELETE' }),

  // Providers
  getProviderStatus: () => request<ProviderStatus>('/providers/status'),

  // Workflow
  startPhase: (albumId: string, phase: string) =>
    request<PhaseRun>(`/albums/${albumId}/phases/${phase}/start`, { method: 'POST' }),
  executePhase1: (albumId: string) =>
    request<any>(`/albums/${albumId}/phases/phase1/execute`, { method: 'POST' }),
  getPhases: (albumId: string) => request<PhaseRun[]>(`/albums/${albumId}/phases`),
  getTrackRounds: (albumId: string, trackId: string) =>
    request<any>(`/albums/${albumId}/tracks/${trackId}/rounds`),
  getGenerationQueue: (albumId: string) => request<any>(`/albums/${albumId}/generation-queue`),
  confirmConcept: (albumId: string, approved: boolean) =>
    request<{ status: string }>(`/albums/${albumId}/decisions/concept`, { method: 'POST', body: JSON.stringify({ approved }) }),

  // Config
  getConfig: () => request<any>('/config'),
  updateConfig: (data: Record<string, unknown>) => request<any>('/config', { method: 'POST', body: JSON.stringify(data) }),

  // Takes (Phase 5)
  listTakes: (albumId: string) => request<any>(`/albums/${albumId}/takes`),
  selectTake: (albumId: string, trackId: string, version: string) =>
    request<any>(`/albums/${albumId}/takes/select?track_id=${trackId}&version=${version}`, { method: 'POST' }),

  // Deliverables (Phase 6)
  listDeliverables: (albumId: string) => request<any>(`/albums/${albumId}/deliverables`),
};
