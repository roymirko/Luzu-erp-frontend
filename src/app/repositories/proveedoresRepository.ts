import { createRepoProxy } from './_proxy';

type Impl = typeof import('./supabase/proveedoresRepository');

const p = createRepoProxy<Impl>(
  () => import('./supabase/proveedoresRepository'),
  () => import('./api/proveedoresRepository'),
);

export const findAll = p.findAll;
export const findActive = p.findActive;
export const findById = p.findById;
export const findByCuit = p.findByCuit;
export const create = p.create;
export const update = p.update;
export const remove = p.remove;
export const search = p.search;
