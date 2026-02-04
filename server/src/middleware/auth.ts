import { Context, Next } from 'hono';
import { verifyToken, JwtPayload } from '../services/auth.service.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('user', payload);
  await next();
}

export function adminOnly(c: Context, next: Next) {
  const user = c.get('user');
  if (user?.userType !== 'administrador') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  return next();
}
