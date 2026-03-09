import { apiGet, apiPost, apiPut, apiDelete } from './_client';
import type {
  EntidadRow,
  EntidadInsert,
  EntidadUpdate,
  RepositoryResult,
  RepositoryListResult,
} from '../types';

export async function findAll(): Promise<RepositoryListResult<EntidadRow>> {
  const res = await apiGet<EntidadRow[]>('/entidades');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findActive(): Promise<RepositoryListResult<EntidadRow>> {
  const res = await apiGet<EntidadRow[]>('/entidades?active=true');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findProveedores(): Promise<RepositoryListResult<EntidadRow>> {
  const res = await apiGet<EntidadRow[]>('/entidades?tipo=proveedor');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findClientes(): Promise<RepositoryListResult<EntidadRow>> {
  const res = await apiGet<EntidadRow[]>('/entidades?tipo=cliente');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findById(id: string): Promise<RepositoryResult<EntidadRow>> {
  const res = await apiGet<EntidadRow>(`/entidades/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByCuit(cuit: string): Promise<RepositoryResult<EntidadRow>> {
  const res = await apiGet<EntidadRow | null>(`/entidades/cuit/${cuit}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function create(entidad: EntidadInsert): Promise<RepositoryResult<EntidadRow>> {
  const res = await apiPost<EntidadRow>('/entidades', entidad);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function update(id: string, entidad: EntidadUpdate): Promise<RepositoryResult<EntidadRow>> {
  const res = await apiPut<EntidadRow>(`/entidades/${id}`, entidad);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const res = await apiDelete<null>(`/entidades/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}

export async function search(term: string, tipoEntidad?: 'proveedor' | 'cliente'): Promise<RepositoryListResult<EntidadRow>> {
  const params = new URLSearchParams({ q: term });
  if (tipoEntidad) params.set('tipo', tipoEntidad);
  const res = await apiGet<EntidadRow[]>(`/entidades/search?${params}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}
