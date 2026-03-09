import { Hono } from 'hono';
import { AppDataSource } from '../db/data-source.js';
import { Comprobante } from '../db/entities/Comprobante.js';

const comprobantes = new Hono();
const repo = () => AppDataSource.getRepository(Comprobante);

// GET /api/comprobantes/search
comprobantes.get('/search', async (c) => {
  const q = c.req.query('q') || '';
  const tipo = c.req.query('tipo');
  let sql = `SELECT * FROM comprobantes WHERE (entidad_nombre ILIKE $1 OR concepto ILIKE $1 OR numero_comprobante ILIKE $1)`;
  const params: any[] = [`%${q}%`];
  if (tipo) {
    params.push(tipo);
    sql += ` AND tipo_movimiento = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC LIMIT 50';
  const data = await AppDataSource.query(sql, params);
  return c.json(data);
});

// GET /api/comprobantes/full/search
comprobantes.get('/full/search', async (c) => {
  const q = c.req.query('q') || '';
  const tipo = c.req.query('tipo');
  let sql = `SELECT * FROM comprobantes_full WHERE (entidad_nombre ILIKE $1 OR concepto ILIKE $1 OR numero_comprobante ILIKE $1 OR nombre_campana ILIKE $1 OR ctx_programa ILIKE $1 OR op_nombre_campana ILIKE $1)`;
  const params: any[] = [`%${q}%`];
  if (tipo) {
    params.push(tipo);
    sql += ` AND tipo_movimiento = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC LIMIT 100';
  const data = await AppDataSource.query(sql, params);
  return c.json(data);
});

// GET /api/comprobantes/full/:id
comprobantes.get('/full/:id', async (c) => {
  const rows = await AppDataSource.query('SELECT * FROM comprobantes_full WHERE id = $1', [c.req.param('id')]);
  if (!rows[0]) return c.json({ error: 'Not found' }, 404);
  return c.json(rows[0]);
});

// GET /api/comprobantes/full
comprobantes.get('/full', async (c) => {
  const tipo = c.req.query('tipo');
  let sql = 'SELECT * FROM comprobantes_full';
  const params: any[] = [];
  if (tipo) {
    params.push(tipo);
    sql += ` WHERE tipo_movimiento = $1`;
  }
  sql += ' ORDER BY created_at DESC';
  const data = await AppDataSource.query(sql, params);
  return c.json(data);
});

// GET /api/comprobantes
comprobantes.get('/', async (c) => {
  const tipo = c.req.query('tipo');
  const estadoPago = c.req.query('estado_pago');
  const entidadId = c.req.query('entidad_id');

  const where: Record<string, any> = {};
  if (tipo) where.tipo_movimiento = tipo;
  if (estadoPago) where.estado_pago = estadoPago;
  if (entidadId) where.entidad_id = entidadId;

  const data = await repo().find({ where, order: { created_at: 'DESC' } });
  return c.json(data);
});

// GET /api/comprobantes/:id
comprobantes.get('/:id', async (c) => {
  const row = await repo().findOneBy({ id: c.req.param('id') });
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// POST /api/comprobantes
comprobantes.post('/', async (c) => {
  const body = await c.req.json();
  const row = repo().create(body);
  const saved = await repo().save(row);
  return c.json(saved, 201);
});

// PUT /api/comprobantes/:id
comprobantes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  await repo().update(id, body);
  const updated = await repo().findOneBy({ id });
  return c.json(updated);
});

// DELETE /api/comprobantes/:id
comprobantes.delete('/:id', async (c) => {
  await repo().delete(c.req.param('id'));
  return c.json(null);
});

export default comprobantes;
