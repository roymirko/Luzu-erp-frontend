import { createRepoProxy } from './_proxy';

type Impl = typeof import('./supabase/settingsRepository');

const p = createRepoProxy<Impl>(
  () => import('./supabase/settingsRepository'),
  () => import('./api/settingsRepository'),
);

export type { AppSettingRow } from './supabase/settingsRepository';
export const getAll = p.getAll;
export const getByKey = p.getByKey;
export const upsert = p.upsert;
