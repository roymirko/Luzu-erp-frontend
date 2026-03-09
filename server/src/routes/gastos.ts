import { Hono } from 'hono';
import { AppDataSource } from '../db/data-source.js';
import { Comprobante } from '../db/entities/Comprobante.js';

const gastos = new Hono();
const comprobanteRepo = () => AppDataSource.getRepository(Comprobante);

async function findFullById(id: string) {
  const rows = await AppDataSource.query('SELECT * FROM comprobantes_full WHERE id = $1', [id]);
  return rows[0] ?? null;
}

// GET /api/gastos?area=xxx
gastos.get('/', async (c) => {
  const area = c.req.query('area');
  let sql = "SELECT * FROM comprobantes_full WHERE tipo_movimiento = 'egreso'";
  const params: any[] = [];
  if (area) {
    params.push(area);
    sql += ` AND area_origen = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const data = await AppDataSource.query(sql, params);
  return c.json(data);
});

// GET /api/gastos/by-orden?orden_id=xxx&area=xxx
gastos.get('/by-orden', async (c) => {
  const ordenId = c.req.query('orden_id');
  const area = c.req.query('area');
  let sql = "SELECT * FROM comprobantes_full WHERE tipo_movimiento = 'egreso' AND orden_publicidad_id = $1";
  const params: any[] = [ordenId];
  if (area) {
    params.push(area);
    sql += ` AND area_origen = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const data = await AppDataSource.query(sql, params);
  return c.json(data);
});

// GET /api/gastos/by-item?item_id=xxx&area=xxx
gastos.get('/by-item', async (c) => {
  const itemId = c.req.query('item_id');
  const area = c.req.query('area');
  let sql = "SELECT * FROM comprobantes_full WHERE tipo_movimiento = 'egreso' AND item_orden_publicidad_id = $1";
  const params: any[] = [itemId];
  if (area) {
    params.push(area);
    sql += ` AND area_origen = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const data = await AppDataSource.query(sql, params);
  return c.json(data);
});

// GET /api/gastos/by-contexto/:id
gastos.get('/by-contexto/:id', async (c) => {
  const data = await AppDataSource.query(
    "SELECT * FROM comprobantes_full WHERE tipo_movimiento = 'egreso' AND contexto_comprobante_id = $1 ORDER BY created_at DESC",
    [c.req.param('id')]
  );
  return c.json(data);
});

// GET /api/gastos/:id
gastos.get('/:id', async (c) => {
  const row = await findFullById(c.req.param('id'));
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// POST /api/gastos
gastos.post('/', async (c) => {
  const body = await c.req.json();
  const row = comprobanteRepo().create(body);
  const saved = await comprobanteRepo().save(row);
  const full = await findFullById(saved.id);
  return c.json(full, 201);
});

// POST /api/gastos/bulk
gastos.post('/bulk', async (c) => {
  const rows = await c.req.json();
  const results = [];
  for (const r of rows) {
    const row = comprobanteRepo().create(r);
    const saved = await comprobanteRepo().save(row);
    const full = await findFullById(saved.id);
    if (full) results.push(full);
  }
  return c.json(results, 201);
});

// PUT /api/gastos/:id
gastos.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  await comprobanteRepo().update(id, body);
  const full = await findFullById(id);
  return c.json(full);
});

// DELETE /api/gastos/:id
gastos.delete('/:id', async (c) => {
  await comprobanteRepo().delete(c.req.param('id'));
  return c.json(null);
});

export default gastos;
