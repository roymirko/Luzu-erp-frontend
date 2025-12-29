-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- ROLES
-- ============================================
create table public.roles (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- AREAS
-- ============================================
create table public.areas (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null unique,
  description text,
  manager_id text, -- Can be linked to users.id later, but keep flexible for now as users can be external or complex
  active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by text,
  metadata jsonb default '{}'::jsonb
);

-- ============================================
-- USERS
-- ============================================
create table public.users (
  id uuid default uuid_generate_v4() primary key, -- Use UUID to match Supabase Auth if needed, or keep generic
  email text not null unique,
  first_name text not null,
  last_name text not null,
  avatar text,
  active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  created_by text,
  metadata jsonb default '{}'::jsonb
);

-- ============================================
-- USER_AREA_ROLES (RELATIONS)
-- ============================================
create table public.user_area_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  assigned_by text,
  unique(user_id, area_id, role_id)
);

-- ============================================
-- AUDIT LOGS
-- ============================================
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id text not null, -- Keep text to allow system or external IDs
  user_email text,
  user_role text,
  action text not null,
  entity text not null,
  entity_id text not null,
  entity_name text,
  details text,
  result text not null check (result in ('success', 'error', 'warning')),
  metadata jsonb,
  ip_address text,
  user_agent text
);

-- Triggers removed as requested

-- ============================================
-- RLS (Row Level Security) - Permissive for initial dev
-- ============================================
alter table public.roles enable row level security;
alter table public.areas enable row level security;
alter table public.users enable row level security;
alter table public.user_area_roles enable row level security;
alter table public.audit_logs enable row level security;

create policy "Enable all access for all users" on public.roles for all using (true) with check (true);
create policy "Enable all access for all users" on public.areas for all using (true) with check (true);
create policy "Enable all access for all users" on public.users for all using (true) with check (true);
create policy "Enable all access for all users" on public.user_area_roles for all using (true) with check (true);
create policy "Enable all access for all users" on public.audit_logs for all using (true) with check (true);

-- ============================================
-- FORMS
-- ============================================
create table public.forms (
  id uuid default uuid_generate_v4() primary key,
  fecha text, -- Storing as text to match original format "DD/MM/YYYY" or ISO. Ideally date, but keeping text for compatibility first
  mes_servicio text,
  responsable text,
  orden_publicidad text,
  total_venta text,
  unidad_negocio text,
  categoria_negocio text,
  proyecto text,
  razon_social text,
  categoria text,
  empresa_agencia text,
  marca text,
  nombre_campana text,
  acuerdo_pago text,
  tipo_importe text check (tipo_importe in ('canje', 'factura')),
  observaciones text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by text
);

-- ============================================
-- FORM ITEMS (Child rows)
-- ============================================
create table public.form_items (
  id uuid default uuid_generate_v4() primary key,
  form_id uuid not null references public.forms(id) on delete cascade,
  programa text,
  monto text,
  nc_programa text,
  nc_porcentaje text,
  proveedor_fee text,
  fee_programa text,
  fee_porcentaje text,
  implementacion text,
  talentos text,
  tecnica text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.forms enable row level security;
alter table public.form_items enable row level security;

create policy "Enable all for forms" on public.forms for all using (true) with check (true);
create policy "Enable all for form_items" on public.form_items for all using (true) with check (true);
