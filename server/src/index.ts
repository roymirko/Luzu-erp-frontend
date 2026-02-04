import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from './routes/auth.js';
import users from './routes/users.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Routes
app.route('/api/auth', auth);
app.route('/api/users', users);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

const port = parseInt(process.env.PORT || '3001');

console.log(`Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
