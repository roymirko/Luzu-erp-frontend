import { createRepoProxy } from './_proxy';

type Impl = typeof import('./supabase/ordenesPublicidadRepository');

const p = createRepoProxy<Impl>(
  () => import('./supabase/ordenesPublicidadRepository'),
  () => import('./api/ordenesPublicidadRepository'),
);

export const findAll = p.findAll;
export const findById = p.findById;
export const findByOrdenPublicidad = p.findByOrdenPublicidad;
export const create = p.create;
export const update = p.update;
export const remove = p.remove;
export const createItems = p.createItems;
export const deleteItemsByOrdenId = p.deleteItemsByOrdenId;
export const getItemsByOrdenId = p.getItemsByOrdenId;
export const updateItem = p.updateItem;
export const deleteItemById = p.deleteItemById;
export const updateEstadoOp = p.updateEstadoOp;
export const findItemById = p.findItemById;
