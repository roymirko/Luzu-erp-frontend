import { apiGet, apiPost, apiPut, apiDelete } from './_client';
import type { RepositoryResult, RepositoryListResult } from '../types';
import type { GastoFullRow, GastoInsertRow } from '../supabase/gastosRepository';

export async function findByArea(area: string): Promise<RepositoryListResult<GastoFullRow>> {
  const res = await apiGet<GastoFullRow[]>(`/gastos?area=${area}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findById(id: string): Promise<RepositoryResult<GastoFullRow>> {
  const res = await apiGet<GastoFullRow>(`/gastos/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByOrdenId(ordenId: string, area?: string): Promise<RepositoryListResult<GastoFullRow>> {
  const params = new URLSearchParams({ orden_id: ordenId });
  if (area) params.set('area', area);
  const res = await apiGet<GastoFullRow[]>(`/gastos/by-orden?${params}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByItemOrdenId(itemId: string, area?: string): Promise<RepositoryListResult<GastoFullRow>> {
  const params = new URLSearchParams({ item_id: itemId });
  if (area) params.set('area', area);
  const res = await apiGet<GastoFullRow[]>(`/gastos/by-item?${params}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByContextoId(contextoId: string): Promise<RepositoryListResult<GastoFullRow>> {
  const res = await apiGet<GastoFullRow[]>(`/gastos/by-contexto/${contextoId}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function create(row: GastoInsertRow): Promise<RepositoryResult<GastoFullRow>> {
  const res = await apiPost<GastoFullRow>('/gastos', row);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function createMultiple(rows: GastoInsertRow[]): Promise<RepositoryListResult<GastoFullRow>> {
  const res = await apiPost<GastoFullRow[]>('/gastos/bulk', rows);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function update(id: string, fields: Record<string, unknown>): Promise<RepositoryResult<GastoFullRow>> {
  const res = await apiPut<GastoFullRow>(`/gastos/${id}`, fields);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const res = await apiDelete<null>(`/gastos/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}
