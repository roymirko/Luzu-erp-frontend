import { apiGet, apiPost, apiPut, apiDelete } from './_client';
import type {
  ComprobanteRow,
  ComprobanteFullRow,
  ComprobanteInsert,
  ComprobanteUpdate,
  RepositoryResult,
  RepositoryListResult,
} from '../types';

export async function findAll(): Promise<RepositoryListResult<ComprobanteRow>> {
  const res = await apiGet<ComprobanteRow[]>('/comprobantes');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findEgresos(): Promise<RepositoryListResult<ComprobanteRow>> {
  const res = await apiGet<ComprobanteRow[]>('/comprobantes?tipo=egreso');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findIngresos(): Promise<RepositoryListResult<ComprobanteRow>> {
  const res = await apiGet<ComprobanteRow[]>('/comprobantes?tipo=ingreso');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findById(id: string): Promise<RepositoryResult<ComprobanteRow>> {
  const res = await apiGet<ComprobanteRow>(`/comprobantes/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByEntidad(entidadId: string): Promise<RepositoryListResult<ComprobanteRow>> {
  const res = await apiGet<ComprobanteRow[]>(`/comprobantes?entidad_id=${entidadId}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function create(comprobante: ComprobanteInsert): Promise<RepositoryResult<ComprobanteRow>> {
  const res = await apiPost<ComprobanteRow>('/comprobantes', comprobante);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function update(id: string, comprobante: ComprobanteUpdate): Promise<RepositoryResult<ComprobanteRow>> {
  const res = await apiPut<ComprobanteRow>(`/comprobantes/${id}`, comprobante);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const res = await apiDelete<null>(`/comprobantes/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: null, error: null };
}

export async function findByEstadoPago(estadoPago: string): Promise<RepositoryListResult<ComprobanteRow>> {
  const res = await apiGet<ComprobanteRow[]>(`/comprobantes?estado_pago=${estadoPago}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function search(term: string, tipoMovimiento?: 'ingreso' | 'egreso'): Promise<RepositoryListResult<ComprobanteRow>> {
  const params = new URLSearchParams({ q: term });
  if (tipoMovimiento) params.set('tipo', tipoMovimiento);
  const res = await apiGet<ComprobanteRow[]>(`/comprobantes/search?${params}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findByIdWithContext(id: string): Promise<RepositoryResult<ComprobanteFullRow>> {
  const res = await apiGet<ComprobanteFullRow>(`/comprobantes/full/${id}`);
  if (res.error) return { data: null, error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findAllWithContext(): Promise<RepositoryListResult<ComprobanteFullRow>> {
  const res = await apiGet<ComprobanteFullRow[]>('/comprobantes/full');
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function findWithContextByTipo(tipoMovimiento: 'ingreso' | 'egreso'): Promise<RepositoryListResult<ComprobanteFullRow>> {
  const res = await apiGet<ComprobanteFullRow[]>(`/comprobantes/full?tipo=${tipoMovimiento}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}

export async function searchWithContext(term: string, tipoMovimiento?: 'ingreso' | 'egreso'): Promise<RepositoryListResult<ComprobanteFullRow>> {
  const params = new URLSearchParams({ q: term });
  if (tipoMovimiento) params.set('tipo', tipoMovimiento);
  const res = await apiGet<ComprobanteFullRow[]>(`/comprobantes/full/search?${params}`);
  if (res.error) return { data: [], error: { code: 'API', message: res.error } };
  return { data: res.data, error: null };
}
