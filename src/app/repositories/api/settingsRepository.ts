import { apiGet, apiPut } from './_client';

interface AppSettingRow {
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
}

export async function getAll(): Promise<{ data: AppSettingRow[]; error: string | null }> {
  const res = await apiGet<AppSettingRow[]>('/settings');
  if (res.error) return { data: [], error: res.error };
  return { data: res.data, error: null };
}

export async function getByKey(key: string): Promise<{ data: AppSettingRow | null; error: string | null }> {
  const res = await apiGet<AppSettingRow>(`/settings/${key}`);
  if (res.error) return { data: null, error: res.error };
  return { data: res.data, error: null };
}

export async function upsert(key: string, value: string, updatedBy?: string): Promise<{ error: string | null }> {
  const res = await apiPut(`/settings/${key}`, { value, updated_by: updatedBy });
  if (res.error) return { error: res.error };
  return { error: null };
}
