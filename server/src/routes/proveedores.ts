import { Hono } from 'hono';
import { AppDataSource } from '../db/data-source.js';

const proveedores = new Hono();

// proveedores is a VIEW — we query entidades filtered by tipo_entidad
// For mutations we also operate on entidades

function query() {
  return AppDataSource.query.bind(AppDataSource);
}

// GET /api/proveedores
proveedores.get('/', async (c) => {
  const active = c.req.query('active');
  let sql = 'SELECT * FROM proveedores';
  if (active === 'true') sql += ' WHERE activo = true';
  sql += ' ORDER BY razon_social';
  const data = await AppDataSource.query(sql);
  return c.json(data);
});

// GET /api/proveedores/search
proveedores.get('/search', async (c) => {
  const q = c.req.query('q') || '';
  const data = await AppDataSource.query(
    `SELECT * FROM proveedores WHERE activo = true AND (empresa ILIKE $1 OR razon_social ILIKE $1) ORDER BY razon_social LIMIT 20`,
    [`%${q}%`]
  );
  return c.json(data);
});

// GET /api/proveedores/cuit/:cuit
proveedores.get('/cuit/:cuit', async (c) => {
  const rows = await AppDataSource.query('SELECT * FROM proveedores WHERE cuit = $1 LIMIT 1', [c.req.param('cuit')]);
  return c.json(rows[0] ?? null);
});

// GET /api/proveedores/:id
proveedores.get('/:id', async (c) => {
  const rows = await AppDataSource.query('SELECT * FROM proveedores WHERE id = $1', [c.req.param('id')]);
  if (!rows[0]) return c.json({ error: 'Not found' }, 404);
  return c.json(rows[0]);
});

// POST /api/proveedores — insert into entidades with tipo_entidad='proveedor'
proveedores.post('/', async (c) => {
  const body = await c.req.json();
  const { razon_social, cuit, direccion, empresa, activo, creado_por } = body;
  const rows = await AppDataSource.query(
    `INSERT INTO entidades (razon_social, cuit, tipo_entidad, condicion_iva, direccion, empresa, activo, created_by)
     VALUES ($1, $2, 'proveedor', 'responsable_inscripto', $3, $4, $5, $6)
     RETURNING *`,
    [razon_social, cuit, direccion, empresa, activo ?? true, creado_por]
  );
  return c.json(rows[0], 201);
});

// PUT /api/proveedores/:id
proveedores.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const sets: string[] = [];
  const vals: any[] = [];
  let idx = 1;
  for (const [k, v] of Object.entries(body)) {
    sets.push(`${k} = $${idx++}`);
    vals.push(v);
  }
  vals.push(id);
  await AppDataSource.query(`UPDATE entidades SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
  const rows = await AppDataSource.query('SELECT * FROM proveedores WHERE id = $1', [id]);
  return c.json(rows[0]);
});

// DELETE /api/proveedores/:id
proveedores.delete('/:id', async (c) => {
  await AppDataSource.query('DELETE FROM entidades WHERE id = $1', [c.req.param('id')]);
  return c.json(null);
});

export default proveedores;
