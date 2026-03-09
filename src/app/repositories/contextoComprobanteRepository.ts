import { createRepoProxy } from './_proxy';

type Impl = typeof import('./supabase/contextoComprobanteRepository');

const p = createRepoProxy<Impl>(
  () => import('./supabase/contextoComprobanteRepository'),
  () => import('./api/contextoComprobanteRepository'),
);

export type { ContextoComprobanteRow, ContextoComprobanteInsert, ContextoComprobanteUpdate } from './supabase/contextoComprobanteRepository';
export const findAll = p.findAll;
export const findByArea = p.findByArea;
export const findById = p.findById;
export const create = p.create;
export const update = p.update;
export const remove = p.remove;
