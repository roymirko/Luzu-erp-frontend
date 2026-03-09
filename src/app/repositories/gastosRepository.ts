import { createRepoProxy } from './_proxy';

type Impl = typeof import('./supabase/gastosRepository');

const p = createRepoProxy<Impl>(
  () => import('./supabase/gastosRepository'),
  () => import('./api/gastosRepository'),
);

export type { GastoFullRow, GastoInsertRow } from './supabase/gastosRepository';
export const findByArea = p.findByArea;
export const findById = p.findById;
export const findByOrdenId = p.findByOrdenId;
export const findByItemOrdenId = p.findByItemOrdenId;
export const findByContextoId = p.findByContextoId;
export const create = p.create;
export const createMultiple = p.createMultiple;
export const update = p.update;
export const remove = p.remove;
