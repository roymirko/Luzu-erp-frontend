import { supabase } from '../services/supabase';
import type { RepositoryResult, RepositoryListResult, RepositoryError } from './types';

const TABLE = 'contexto_comprobante';

export interface ContextoComprobanteRow {
  id: string;
  area_origen: 'programacion' | 'experience' | 'productora';
  mes_gestion: string | null;
  detalle_campana: string | null;
  estado: string;
  nombre_campana: string | null;
  unidad_negocio: string | null;
  categoria_negocio: string | null;
  mes_venta: string | null;
  mes_inicio: string | null;
  programa: string | null;
  ejecutivo: string | null;
  rubro: string | null;
  sub_rubro: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type ContextoComprobanteInsert = Omit<ContextoComprobanteRow, 'id' | 'created_at' | 'updated_at'>;
export type ContextoComprobanteUpdate = Partial<Omit<ContextoComprobanteRow, 'id' | 'created_at'>>;

function mapErr(error: { code?: string; message: string; details?: string }): RepositoryError {
  return { code: error.code || 'UNKNOWN', message: error.message, details: error.details };
}

export async function findAll(): Promise<RepositoryListResult<ContextoComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) return { data: [], error: mapErr(error) };
  return { data: data as ContextoComprobanteRow[], error: null };
}

export async function findByArea(area: string): Promise<RepositoryListResult<ContextoComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE).select('*').eq('area_origen', area).order('created_at', { ascending: false });
  if (error) return { data: [], error: mapErr(error) };
  return { data: data as ContextoComprobanteRow[], error: null };
}

export async function findById(id: string): Promise<RepositoryResult<ContextoComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE).select('*').eq('id', id).single();
  if (error) return { data: null, error: mapErr(error) };
  return { data: data as ContextoComprobanteRow, error: null };
}

export async function create(row: ContextoComprobanteInsert): Promise<RepositoryResult<ContextoComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE).insert(row).select().single();
  if (error) return { data: null, error: mapErr(error) };
  return { data: data as ContextoComprobanteRow, error: null };
}

export async function update(id: string, row: ContextoComprobanteUpdate): Promise<RepositoryResult<ContextoComprobanteRow>> {
  const { data, error } = await supabase
    .from(TABLE).update(row).eq('id', id).select().single();
  if (error) return { data: null, error: mapErr(error) };
  return { data: data as ContextoComprobanteRow, error: null };
}

export async function remove(id: string): Promise<RepositoryResult<null>> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) return { data: null, error: mapErr(error) };
  return { data: null, error: null };
}
