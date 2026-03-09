import { createRepoProxy } from './_proxy';

type Impl = typeof import('./supabase/comprobantesRepository');

const p = createRepoProxy<Impl>(
  () => import('./supabase/comprobantesRepository'),
  () => import('./api/comprobantesRepository'),
);

export const findAll = p.findAll;
export const findEgresos = p.findEgresos;
export const findIngresos = p.findIngresos;
export const findById = p.findById;
export const findByEntidad = p.findByEntidad;
export const create = p.create;
export const update = p.update;
export const remove = p.remove;
export const findByEstadoPago = p.findByEstadoPago;
export const search = p.search;
export const findByIdWithContext = p.findByIdWithContext;
export const findAllWithContext = p.findAllWithContext;
export const findWithContextByTipo = p.findWithContextByTipo;
export const searchWithContext = p.searchWithContext;
