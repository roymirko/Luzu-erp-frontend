import { Hono } from 'hono';
import { AppDataSource } from '../db/data-source.js';
import { OrdenPublicidad } from '../db/entities/OrdenPublicidad.js';
import { ItemOrdenPublicidad } from '../db/entities/ItemOrdenPublicidad.js';

const ordenes = new Hono();
const opRepo = () => AppDataSource.getRepository(OrdenPublicidad);
const itemRepo = () => AppDataSource.getRepository(ItemOrdenPublicidad);

// GET /api/ordenes
ordenes.get('/', async (c) => {
  const data = await opRepo().find({
    relations: ['items_orden_publicidad'],
    order: { fecha_creacion: 'DESC' },
  });
  return c.json(data);
});

// GET /api/ordenes/by-numero/:numero
ordenes.get('/by-numero/:numero', async (c) => {
  const row = await opRepo().findOne({
    where: { orden_publicidad: c.req.param('numero') },
    relations: ['items_orden_publicidad'],
  });
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// GET /api/ordenes/items/:itemId
ordenes.get('/items/:itemId', async (c) => {
  const row = await itemRepo().findOneBy({ id: c.req.param('itemId') });
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// GET /api/ordenes/:id/items
ordenes.get('/:id/items', async (c) => {
  const data = await itemRepo().findBy({ orden_publicidad_id: c.req.param('id') });
  return c.json(data);
});

// GET /api/ordenes/:id
ordenes.get('/:id', async (c) => {
  const row = await opRepo().findOne({
    where: { id: c.req.param('id') },
    relations: ['items_orden_publicidad'],
  });
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// POST /api/ordenes
ordenes.post('/', async (c) => {
  const body = await c.req.json();
  const row = opRepo().create(body);
  const saved = await opRepo().save(row);
  return c.json(saved, 201);
});

// POST /api/ordenes/items
ordenes.post('/items', async (c) => {
  const items = await c.req.json();
  if (!Array.isArray(items) || items.length === 0) return c.json([], 200);
  const rows = itemRepo().create(items);
  const saved = await itemRepo().save(rows);
  return c.json(saved, 201);
});

// PUT /api/ordenes/items/:itemId
ordenes.put('/items/:itemId', async (c) => {
  const id = c.req.param('itemId');
  const body = await c.req.json();
  await itemRepo().update(id, body);
  return c.json(null);
});

// PUT /api/ordenes/:id/estado
ordenes.put('/:id/estado', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const updateData: Record<string, unknown> = {
    estado_op: body.estado_op,
    fecha_actualizacion: new Date().toISOString(),
  };
  if (body.observaciones_admin !== undefined) updateData.observaciones_admin = body.observaciones_admin;
  await opRepo().update(id, updateData);
  const updated = await opRepo().findOneBy({ id });
  return c.json(updated);
});

// PUT /api/ordenes/:id
ordenes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  body.fecha_actualizacion = new Date().toISOString();
  await opRepo().update(id, body);
  const updated = await opRepo().findOneBy({ id });
  return c.json(updated);
});

// DELETE /api/ordenes/items/:itemId
ordenes.delete('/items/:itemId', async (c) => {
  await itemRepo().delete(c.req.param('itemId'));
  return c.json(null);
});

// DELETE /api/ordenes/:id/items
ordenes.delete('/:id/items', async (c) => {
  await itemRepo().delete({ orden_publicidad_id: c.req.param('id') });
  return c.json(null);
});

// DELETE /api/ordenes/:id
ordenes.delete('/:id', async (c) => {
  await opRepo().delete(c.req.param('id'));
  return c.json(null);
});

export default ordenes;
