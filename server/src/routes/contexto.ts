import { Hono } from 'hono';
import { AppDataSource } from '../db/data-source.js';
import { ContextoComprobante } from '../db/entities/ContextoComprobante.js';

const contexto = new Hono();
const repo = () => AppDataSource.getRepository(ContextoComprobante);

// GET /api/contexto
contexto.get('/', async (c) => {
  const area = c.req.query('area');
  const where: Record<string, any> = {};
  if (area) where.area_origen = area;
  const data = await repo().find({ where, order: { created_at: 'DESC' } });
  return c.json(data);
});

// GET /api/contexto/:id
contexto.get('/:id', async (c) => {
  const row = await repo().findOneBy({ id: c.req.param('id') });
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// POST /api/contexto
contexto.post('/', async (c) => {
  const body = await c.req.json();
  const row = repo().create(body);
  const saved = await repo().save(row);
  return c.json(saved, 201);
});

// PUT /api/contexto/:id
contexto.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  await repo().update(id, body);
  const updated = await repo().findOneBy({ id });
  return c.json(updated);
});

// DELETE /api/contexto/:id
contexto.delete('/:id', async (c) => {
  await repo().delete(c.req.param('id'));
  return c.json(null);
});

export default contexto;
