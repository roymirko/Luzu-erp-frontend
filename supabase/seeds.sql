-- ============================================
-- SEED DATA
-- ============================================

-- 1. ROLES
-- We use static UUIDs or let them generate, but for foreign keys in seed, variables or returning clauses are needed.
-- Since this is a raw SQL script for the SQL editor, we will try to use DO block or specific static IDs if possible, 
-- but `uuid_generate_v4()` is random. 
-- STRATEGY: We will insert and assume the names are unique, then look them up for relations.

-- Insert Roles
INSERT INTO public.roles (name, description, permissions)
VALUES 
  ('Administrador', 'Control total del sistema, puede crear, editar y eliminar usuarios y áreas', 
   '[
      {"resource": "users", "actions": ["create", "read", "update", "delete"]},
      {"resource": "areas", "actions": ["create", "read", "update", "delete"]},
      {"resource": "roles", "actions": ["read"]},
      {"resource": "logs", "actions": ["read"]},
      {"resource": "forms", "actions": ["create", "read", "update", "delete"]},
      {"resource": "tasks", "actions": ["create", "read", "update", "delete"]}
    ]'::jsonb),
  ('Editor', 'Puede editar contenido y gestionar tareas, pero no usuarios ni áreas', 
   '[
      {"resource": "users", "actions": ["read"]},
      {"resource": "areas", "actions": ["read"]},
      {"resource": "forms", "actions": ["create", "read", "update"]},
      {"resource": "tasks", "actions": ["create", "read", "update", "delete"]}
    ]'::jsonb),
  ('Visualizador', 'Solo puede ver información, sin permisos de edición', 
   '[
      {"resource": "users", "actions": ["read"]},
      {"resource": "areas", "actions": ["read"]},
      {"resource": "forms", "actions": ["read"]},
      {"resource": "tasks", "actions": ["read"]}
    ]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 2. USERS
INSERT INTO public.users (email, first_name, last_name, active, created_by, metadata)
VALUES
  ('gaby@luzutv.com.ar', 'Gabriela', 'Riero', true, 'system', '{"position": "CEO"}'::jsonb),
  ('gestion@luzutv.com.ar', 'Felicitas', 'Carelli', true, 'system', '{"position": "Project Manager"}'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- 3. AREAS
INSERT INTO public.areas (name, code, description, active, created_by, metadata)
VALUES
  ('Comercial', 'COM', 'Gestión de propuestas y estrategias comerciales', true, 'system', '{"color": "#fb2c36", "icon": "Briefcase"}'::jsonb),
  ('Implementación', 'IMP', 'Implementación y gestión de proyectos técnicos', true, 'system', '{"color": "#3b82f6", "icon": "Settings"}'::jsonb),
  ('Dir. de Programación', 'PRG', 'Planificación y dirección de programación de contenidos', true, 'system', '{"color": "#10b981", "icon": "TrendingUp"}'::jsonb),
  ('Master', 'MST', 'Super administradores del sistema', true, 'system', '{"color": "#8b5cf6", "icon": "Users"}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- 4. ASSIGNMENTS via DO block to lookup IDs
DO $$
DECLARE
  v_role_admin uuid;
  v_user_gaby uuid;
  v_user_feli uuid;
  v_area_com uuid;
  v_area_imp uuid;
  v_area_prg uuid;
  v_area_mst uuid;
BEGIN
  -- Get IDs
  SELECT id INTO v_role_admin FROM public.roles WHERE name = 'Administrador';
  
  SELECT id INTO v_user_gaby FROM public.users WHERE email = 'gaby@luzutv.com.ar';
  SELECT id INTO v_user_feli FROM public.users WHERE email = 'gestion@luzutv.com.ar';
  
  SELECT id INTO v_area_com FROM public.areas WHERE code = 'COM';
  SELECT id INTO v_area_imp FROM public.areas WHERE code = 'IMP';
  SELECT id INTO v_area_prg FROM public.areas WHERE code = 'PRG';
  SELECT id INTO v_area_mst FROM public.areas WHERE code = 'MST';

  -- Assignments for Gabriela (CEO) - Admin in all areas
  IF v_user_gaby IS NOT NULL AND v_role_admin IS NOT NULL THEN
    INSERT INTO public.user_area_roles (user_id, area_id, role_id, assigned_by)
    VALUES 
      (v_user_gaby, v_area_com, v_role_admin, 'system'),
      (v_user_gaby, v_area_imp, v_role_admin, 'system'),
      (v_user_gaby, v_area_prg, v_role_admin, 'system'),
      (v_user_gaby, v_area_mst, v_role_admin, 'system')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Assignments for Felicitas (PM) - Admin in all except Master
  IF v_user_feli IS NOT NULL AND v_role_admin IS NOT NULL THEN
    INSERT INTO public.user_area_roles (user_id, area_id, role_id, assigned_by)
    VALUES 
      (v_user_feli, v_area_com, v_role_admin, 'system'),
      (v_user_feli, v_area_imp, v_role_admin, 'system'),
      (v_user_feli, v_area_prg, v_role_admin, 'system')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
