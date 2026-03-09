import { Hono } from 'hono';
import { AppDataSource } from '../db/data-source.js';
import { AppSetting } from '../db/entities/AppSetting.js';

const settings = new Hono();
const repo = () => AppDataSource.getRepository(AppSetting);

// GET /api/settings
settings.get('/', async (c) => {
  const data = await repo().find();
  return c.json(data);
});

// GET /api/settings/:key
settings.get('/:key', async (c) => {
  const row = await repo().findOneBy({ key: c.req.param('key') });
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// PUT /api/settings/:key
settings.put('/:key', async (c) => {
  const key = c.req.param('key');
  const body = await c.req.json();
  await repo().upsert(
    { key, value: body.value, updated_at: new Date().toISOString(), updated_by: body.updated_by ?? null },
    ['key']
  );
  return c.json({ success: true });
});

export default settings;
