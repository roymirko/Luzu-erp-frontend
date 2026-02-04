import { supabase } from '../utils/supabase.js';
import { hashPassword } from './auth.service.js';

export interface DbUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  active: boolean;
  password_hash: string | null;
  user_type: string;
  avatar?: string;
  metadata?: Record<string, any>;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  last_login?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  userType?: string;
  active?: boolean;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .ilike('email', email)
    .maybeSingle();

  if (error) {
    console.error('findUserByEmail error:', error);
    return null;
  }
  return data;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('findUserById error:', error);
    return null;
  }
  return data;
}

export async function getAllUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('getAllUsers error:', error);
    return [];
  }
  return data || [];
}

export async function createUser(input: CreateUserInput): Promise<DbUser | null> {
  const passwordHash = await hashPassword(input.password);

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      email: input.email.toLowerCase(),
      first_name: input.firstName,
      last_name: input.lastName,
      password_hash: passwordHash,
      user_type: input.userType || 'editor',
      active: true,
      creado_por: 'system'
    })
    .select()
    .single();

  if (error) {
    console.error('createUser error:', error);
    return null;
  }
  return data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<DbUser | null> {
  const updates: Record<string, any> = {
    fecha_actualizacion: new Date().toISOString()
  };

  if (input.firstName !== undefined) updates.first_name = input.firstName;
  if (input.lastName !== undefined) updates.last_name = input.lastName;
  if (input.userType !== undefined) updates.user_type = input.userType;
  if (input.active !== undefined) updates.active = input.active;

  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updateUser error:', error);
    return null;
  }
  return data;
}

export async function resetPassword(id: string, newPassword: string): Promise<boolean> {
  const passwordHash = await hashPassword(newPassword);

  const { error } = await supabase
    .from('usuarios')
    .update({
      password_hash: passwordHash,
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('resetPassword error:', error);
    return false;
  }
  return true;
}

export async function updateLastLogin(id: string): Promise<void> {
  await supabase
    .from('usuarios')
    .update({ last_login: new Date().toISOString() })
    .eq('id', id);
}
