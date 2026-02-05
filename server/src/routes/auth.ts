import { Hono } from 'hono';
import { findUserByEmail, findUserById, updateLastLogin } from '../services/user.service.js';
import { verifyPassword, generateToken } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.js';

const auth = new Hono();

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const user = await findUserByEmail(email);

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  if (!user.active) {
    return c.json({ error: 'User account is inactive' }, 401);
  }

  if (!user.password_hash) {
    return c.json({ error: 'Password not set. Contact admin.' }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Update last login
  await updateLastLogin(user.id);

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    userType: user.user_type
  });

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      avatar: user.avatar,
      metadata: user.metadata
    }
  });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/auth/me - Get current user
auth.get('/me', authMiddleware, async (c) => {
  const payload = c.get('user');
  const user = await findUserById(payload.userId);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    userType: user.user_type,
    avatar: user.avatar,
    active: user.active,
    metadata: user.metadata
  });
});

export default auth;
