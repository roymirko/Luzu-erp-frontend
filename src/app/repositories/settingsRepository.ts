import { supabase } from '../services/supabase';

const TABLE = 'app_settings';

export interface AppSettingRow {
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
}

export async function getAll(): Promise<{ data: AppSettingRow[]; error: string | null }> {
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) return { data: [], error: error.message };
  return { data: data as AppSettingRow[], error: null };
}

export async function getByKey(key: string): Promise<{ data: AppSettingRow | null; error: string | null }> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('key', key).single();
  if (error) return { data: null, error: error.message };
  return { data: data as AppSettingRow, error: null };
}

export async function upsert(key: string, value: string, updatedBy?: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from(TABLE).upsert(
    { key, value, updated_at: new Date().toISOString(), updated_by: updatedBy ?? null },
    { onConflict: 'key' }
  );
  if (error) return { error: error.message };
  return { error: null };
}
