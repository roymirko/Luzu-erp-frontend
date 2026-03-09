import { Hono } from 'hono';
import { In, ILike } from 'typeorm';
import { AppDataSource } from '../db/data-source.js';
import { Entidad } from '../db/entities/Entidad.js';

const entidades = new Hono();
const repo = () => AppDataSource.getRepository(Entidad);

// GET /api/entidades
entidades.get('/', async (c) => {
  const active = c.req.query('active');
  const tipo = c.req.query('tipo');

  const where: Record<string, any> = {};
  if (active === 'true') where.activo = true;
  if (tipo === 'proveedor') where.tipo_entidad = In(['proveedor', 'ambos']);
  if (tipo === 'cliente') where.tipo_entidad = In(['cliente', 'ambos']);

  const data = await repo().find({ where, order: { razon_social: 'ASC' } });
  return c.json(data);
});

// GET /api/entidades/search
entidades.get('/search', async (c) => {
  const q = c.req.query('q') || '';
  const tipo = c.req.query('tipo');

  const qb = repo().createQueryBuilder('e')
    .where('e.activo = true')
    .andWhere('(e.empresa ILIKE :term OR e.razon_social ILIKE :term OR e.nombre_fantasia ILIKE :term)', { term: `%${q}%` })
    .orderBy('e.razon_social', 'ASC')
    .take(20);

  if (tipo === 'proveedor') qb.andWhere('e.tipo_entidad IN (:...tipos)', { tipos: ['proveedor', 'ambos'] });
  if (tipo === 'cliente') qb.andWhere('e.tipo_entidad IN (:...tipos)', { tipos: ['cliente', 'ambos'] });

  const data = await qb.getMany();
  return c.json(data);
});

// GET /api/entidades/cuit/:cuit
entidades.get('/cuit/:cuit', async (c) => {
  const row = await repo().findOneBy({ cuit: c.req.param('cuit') });
  return c.json(row);
});

// GET /api/entidades/:id
entidades.get('/:id', async (c) => {
  const row = await repo().findOneBy({ id: c.req.param('id') });
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// POST /api/entidades
entidades.post('/', async (c) => {
  const body = await c.req.json();
  const row = repo().create(body);
  const saved = await repo().save(row);
  return c.json(saved, 201);
});

// PUT /api/entidades/:id
entidades.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  await repo().update(id, body);
  const updated = await repo().findOneBy({ id });
  return c.json(updated);
});

// DELETE /api/entidades/:id
entidades.delete('/:id', async (c) => {
  await repo().delete(c.req.param('id'));
  return c.json(null);
});

export default entidades;
