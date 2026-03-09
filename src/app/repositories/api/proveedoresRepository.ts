import { apiGet, apiPost, apiPut, apiDelete } from './_client';
import type {
  ProveedorRow,
  ProveedorInsert,
  ProveedorUpdate,
  RepositoryResult,
  RepositoryListResult,
} from '../types';

export async function findAll(): Promise<RepositoryListResult<ProveedorRow>> {
  const res = await apiGet<ProveedorRow[]>('/proveedores');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findActive(): Promise<RepositoryListResult<ProveedorRow>> {
  const res = await apiGet<ProveedorRow[]>('/proveedores?active=true');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findById(id: string): Promise<RepositoryResult<ProveedorRow>> {
  const res = await apiGet<ProveedorRow>(`/proveedores/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByCuit(cuit: string): Promise<RepositoryResult<ProveedorRow>> {
  const res = await apiGet<ProveedorRow | null>(`/proveedores/cuit/${cuit}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function create(proveedor: ProveedorInsert): Promise<RepositoryResult<ProveedorRow>> {
  const res = await apiPost<ProveedorRow>('/proveedores', proveedor);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function update(id: string, proveedor: ProveedorUpdate): Promise<RepositoryResult<ProveedorRow>> {
  const res = await apiPut<ProveedorRow>(`/proveedores/${id}`, proveedor);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const res = await apiDelete<null>(`/proveedores/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}

export async function search(term: string): Promise<RepositoryListResult<ProveedorRow>> {
  const res = await apiGet<ProveedorRow[]>(`/proveedores/search?q=${encodeURIComponent(term)}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}
