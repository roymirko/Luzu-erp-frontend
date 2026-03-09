import { apiGet, apiPost, apiPut, apiDelete } from './_client';
import type { RepositoryResult, RepositoryListResult } from '../types';
import type { ContextoComprobanteRow, ContextoComprobanteInsert, ContextoComprobanteUpdate } from '../supabase/contextoComprobanteRepository';

export async function findAll(): Promise<RepositoryListResult<ContextoComprobanteRow>> {
  const res = await apiGet<ContextoComprobanteRow[]>('/contexto');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByArea(area: string): Promise<RepositoryListResult<ContextoComprobanteRow>> {
  const res = await apiGet<ContextoComprobanteRow[]>(`/contexto?area=${area}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findById(id: string): Promise<RepositoryResult<ContextoComprobanteRow>> {
  const res = await apiGet<ContextoComprobanteRow>(`/contexto/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function create(row: ContextoComprobanteInsert): Promise<RepositoryResult<ContextoComprobanteRow>> {
  const res = await apiPost<ContextoComprobanteRow>('/contexto', row);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function update(id: string, row: ContextoComprobanteUpdate): Promise<RepositoryResult<ContextoComprobanteRow>> {
  const res = await apiPut<ContextoComprobanteRow>(`/contexto/${id}`, row);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const res = await apiDelete<null>(`/contexto/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}
