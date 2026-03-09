import { apiGet, apiPost, apiPut, apiDelete } from './_client';
import type {
  OrdenPublicidadRow,
  OrdenPublicidadWithItems,
  ItemOrdenPublicidadRow,
  OrdenPublicidadInsert,
  OrdenPublicidadUpdate,
  ItemOrdenPublicidadInsert,
  RepositoryResult,
  RepositoryListResult,
} from '../types';

export async function findAll(): Promise<RepositoryListResult<OrdenPublicidadWithItems>> {
  const res = await apiGet<OrdenPublicidadWithItems[]>('/ordenes');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findById(id: string): Promise<RepositoryResult<OrdenPublicidadWithItems>> {
  const res = await apiGet<OrdenPublicidadWithItems>(`/ordenes/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByOrdenPublicidad(ordenPublicidad: string): Promise<RepositoryResult<OrdenPublicidadWithItems>> {
  const res = await apiGet<OrdenPublicidadWithItems>(`/ordenes/by-numero/${encodeURIComponent(ordenPublicidad)}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function create(orden: OrdenPublicidadInsert): Promise<RepositoryResult<OrdenPublicidadRow>> {
  const res = await apiPost<OrdenPublicidadRow>('/ordenes', orden);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function update(id: string, orden: OrdenPublicidadUpdate): Promise<RepositoryResult<OrdenPublicidadRow>> {
  const res = await apiPut<OrdenPublicidadRow>(`/ordenes/${id}`, orden);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const res = await apiDelete<null>(`/ordenes/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}

export async function createItems(items: ItemOrdenPublicidadInsert[]): Promise<RepositoryListResult<ItemOrdenPublicidadRow>> {
  if (items.length === 0) return { data: [], error: null };
  const res = await apiPost<ItemOrdenPublicidadRow[]>('/ordenes/items', items);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function deleteItemsByOrdenId(ordenId: string): Promise<RepositoryResult<null>> {
  const res = await apiDelete<null>(`/ordenes/${ordenId}/items`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}

export async function getItemsByOrdenId(ordenId: string): Promise<RepositoryListResult<ItemOrdenPublicidadRow>> {
  const res = await apiGet<ItemOrdenPublicidadRow[]>(`/ordenes/${ordenId}/items`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function updateItem(id: string, data: Partial<ItemOrdenPublicidadRow>): Promise<RepositoryResult<null>> {
  const res = await apiPut<null>(`/ordenes/items/${id}`, data);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}

export async function deleteItemById(id: string): Promise<RepositoryResult<null>> {
  const res = await apiDelete<null>(`/ordenes/items/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}

export async function updateEstadoOp(id: string, estadoOp: string, observacionesAdmin?: string): Promise<RepositoryResult<OrdenPublicidadRow>> {
  const res = await apiPut<OrdenPublicidadRow>(`/ordenes/${id}/estado`, { estado_op: estadoOp, observaciones_admin: observacionesAdmin });
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findItemById(itemId: string): Promise<RepositoryResult<ItemOrdenPublicidadRow>> {
  const res = await apiGet<ItemOrdenPublicidadRow>(`/ordenes/items/${itemId}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}
