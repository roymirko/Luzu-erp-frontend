import { Hono } from 'hono';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import {
  getAllUsers,
  findUserById,
  createUser,
  updateUser,
  resetPassword
} from '../services/user.service.js';

const users = new Hono();

// All routes require auth
users.use('*', authMiddleware);

// GET /api/users - List all users
users.get('/', async (c) => {
  const allUsers = await getAllUsers();

  return c.json(allUsers.map(u => ({
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    userType: u.user_type,
    active: u.active,
    avatar: u.avatar,
    createdAt: u.fecha_creacion,
    lastLogin: u.last_login
  })));
});

// POST /api/users - Create user (admin only)
users.post('/', adminOnly, async (c) => {
  const body = await c.req.json();
  const { email, password, firstName, lastName, userType } = body;

  if (!email || !password || !firstName || !lastName) {
    return c.json({ error: 'email, password, firstName, lastName required' }, 400);
  }

  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }

  const user = await createUser({ email, password, firstName, lastName, userType });

  if (!user) {
    return c.json({ error: 'Failed to create user. Email may already exist.' }, 400);
  }

  return c.json({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    userType: user.user_type,
    active: user.active
  }, 201);
});

// PUT /api/users/:id - Update user (admin only)
users.put('/:id', adminOnly, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const user = await updateUser(id, body);

  if (!user) {
    return c.json({ error: 'Failed to update user' }, 400);
  }

  return c.json({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    userType: user.user_type,
    active: user.active
  });
});

// POST /api/users/:id/reset-password - Reset password (admin only)
users.post('/:id/reset-password', adminOnly, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { password } = body;

  if (!password || password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }

  const success = await resetPassword(id, password);

  if (!success) {
    return c.json({ error: 'Failed to reset password' }, 400);
  }

  return c.json({ success: true });
});

export default users;
