import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from './routes/auth.js';
import users from './routes/users.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '../../dist');

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// API Routes
app.route('/api/auth', auth);
app.route('/api/users', users);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// Serve static files from dist (production build)
if (existsSync(distPath)) {
  // Serve static assets
  app.use('/*', serveStatic({
    root: '../dist',
    onNotFound: () => {} // Suppress not found logs, SPA fallback handles it
  }));

  // SPA fallback - serve index.html for all non-API routes
  app.use('*', async (c, next) => {
    if (c.req.path.startsWith('/api/')) {
      return next();
    }
    const indexPath = join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      const html = readFileSync(indexPath, 'utf-8');
      return c.html(html);
    }
    return next();
  });
}

const port = parseInt(process.env.PORT || '3001');

console.log(`Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
