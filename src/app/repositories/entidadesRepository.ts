import { createRepoProxy } from './_proxy';

type Impl = typeof import('./supabase/entidadesRepository');

const p = createRepoProxy<Impl>(
  () => import('./supabase/entidadesRepository'),
  () => import('./api/entidadesRepository'),
);

export const findAll = p.findAll;
export const findActive = p.findActive;
export const findProveedores = p.findProveedores;
export const findClientes = p.findClientes;
export const findById = p.findById;
export const findByCuit = p.findByCuit;
export const create = p.create;
export const update = p.update;
export const remove = p.remove;
export const search = p.search;
