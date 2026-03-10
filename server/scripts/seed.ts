import 'reflect-metadata';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlDir = join(__dirname, '../sql');

// Cloud SQL SSL workaround
if (process.env.DATABASE_URL?.includes('ssl=true')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const args = process.argv.slice(2);
const resetMode = args.includes('--reset');

async function run() {
  const { AppDataSource } = await import('../src/db/data-source.js');
  await AppDataSource.initialize();
  console.log('Connected to database');

  const qr = AppDataSource.createQueryRunner();

  if (resetMode) {
    console.log('Running schema (full reset)...');
    const schema = readFileSync(join(sqlDir, 'schema.sql'), 'utf-8');
    await qr.query(schema);
    console.log('Schema created');
  }

  console.log('Running seed...');
  const seed = readFileSync(join(sqlDir, 'seed.sql'), 'utf-8');
  await qr.query(seed);
  console.log('Seed complete');

  // Summary
  const counts = await Promise.all([
    qr.query('SELECT count(*) FROM usuarios'),
    qr.query('SELECT count(*) FROM ordenes_publicidad'),
    qr.query('SELECT count(*) FROM comprobantes'),
    qr.query('SELECT count(*) FROM entidades'),
    qr.query('SELECT count(*) FROM contexto_comprobante'),
  ]);
  console.log(`\nSummary:`);
  console.log(`  Usuarios: ${counts[0][0].count}`);
  console.log(`  Ordenes: ${counts[1][0].count}`);
  console.log(`  Comprobantes: ${counts[2][0].count}`);
  console.log(`  Entidades: ${counts[3][0].count}`);
  console.log(`  Contextos: ${counts[4][0].count}`);
  console.log(`\nDefault password: ${process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'}`);

  await qr.release();
  await AppDataSource.destroy();
}

run().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
