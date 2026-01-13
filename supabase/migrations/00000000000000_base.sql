-- Base migration generated from Spanish supabase/schema.sql

BEGIN;

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ROLES
create table if not exists public.roles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  permissions jsonb not null default '[]'::jsonb,
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AREAS
create table if not exists public.areas (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,
  description text,
  manager_id text,
  active boolean default true not null,
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null,
  fecha_actualizacion timestamp with time zone default timezone('utc'::text, now()) not null,
  creado_por text,
  metadata jsonb default '{}'::jsonb
);

-- USUARIOS
create table if not exists public.usuarios (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  avatar text,
  active boolean default true not null,
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null,
  fecha_actualizacion timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  creado_por text,
  metadata jsonb default '{}'::jsonb
);

-- USUARIO_AREA_ROLES
create table if not exists public.usuario_area_roles (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete cascade,
  rol_id uuid not null references public.roles(id) on delete restrict,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  assigned_by text,
  unique(usuario_id, area_id, rol_id)
);

-- REGISTROS_AUDITORIA
create table if not exists public.registros_auditoria (
  id uuid default gen_random_uuid() primary key,
  fecha timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id text not null,
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

-- ORDENES_PUBLICIDAD (Comercial)
create table if not exists public.ordenes_publicidad (
  id uuid default gen_random_uuid() primary key,
  fecha text,
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
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null,
  fecha_actualizacion timestamp with time zone default timezone('utc'::text, now()) not null,
  creado_por text
);

-- ITEMS_ORDEN_PUBLICIDAD
create table if not exists public.items_orden_publicidad (
  id uuid default gen_random_uuid() primary key,
  orden_publicidad_id uuid not null references public.ordenes_publicidad(id) on delete cascade,
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
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLIENTES (Spanish-native table)
DO $$
BEGIN
  -- Drop only if an object named clientes exists and is a view
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'clientes' AND c.relkind IN ('v','m')
  ) THEN
    EXECUTE 'DROP VIEW IF EXISTS public.proveedores CASCADE';
  END IF;
END $$;
create table if not exists public.proveedores (
  id uuid default gen_random_uuid() primary key,
  razon_social text not null,
  cuit text not null unique,
  direccion text,
  empresa text,
  activo boolean default true not null,
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null,
  creado_por text
);

-- IMPLEMENTACIÓN: Headers
create table if not exists public.gastos_implementacion (
  id uuid default gen_random_uuid() primary key,
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null,
  fecha_actualizacion timestamp with time zone default timezone('utc'::text, now()) not null,
  fecha_registro date not null,
  orden_publicidad text not null,
  responsable text not null,
  unidad_negocio text not null,
  categoria_negocio text,
  nombre_campana text not null,
  anio integer not null,
  mes integer not null,
  id_formulario_comercial uuid,
  estado text not null default 'pendiente',
  item_orden_publicidad_id uuid,
  acuerdo_pago text,
  presupuesto decimal(15,2),
  cantidad_programas integer,
  programas_disponibles jsonb default '[]'::jsonb,
  sector text,
  rubro_gasto text,
  sub_rubro text,
  factura_emitida_a text,
  empresa text,
  concepto_gasto text,
  observaciones text,
  creado_por text,
  actualizado_por text
);

-- IMPLEMENTACIÓN: Items
create table if not exists public.items_gasto_implementacion (
  id uuid default gen_random_uuid() primary key,
  gasto_id uuid references public.gastos_implementacion(id) on delete cascade,
  fecha_creacion timestamp with time zone default timezone('utc'::text, now()) not null,
  tipo_proveedor text not null,
  proveedor text not null,
  razon_social text,
  descripcion text,
  rubro_gasto text not null,
  sub_rubro text,
  sector text not null,
  moneda text not null default 'ARS',
  neto decimal(15,2) not null default 0,
  iva decimal(5,2) default 21,
  importe_total decimal(15,2) not null default 0,
  tipo_factura text,
  numero_factura text,
  fecha_factura date,
  condicion_pago text,
  fecha_pago date,
  estado_pago text not null default 'pendiente',
  adjuntos jsonb
);

-- FK: gastos_implementacion.item_orden_publicidad_id -> items_orden_publicidad(id)
DO $$
BEGIN
  IF to_regclass('public.items_orden_publicidad') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'gastos_item_form_item_fk'
    ) THEN
      ALTER TABLE public.gastos_implementacion
        ADD CONSTRAINT gastos_item_form_item_fk
        FOREIGN KEY (item_orden_publicidad_id)
        REFERENCES public.items_orden_publicidad(id)
        ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Helpful indexes
create index if not exists idx_gastos_item_orden_publicidad_id on public.gastos_implementacion(item_orden_publicidad_id);
create index if not exists idx_items_gasto_gasto_id on public.items_gasto_implementacion(gasto_id);

-- Enable RLS on all relevant tables
alter table public.roles enable row level security;
alter table public.areas enable row level security;
alter table public.usuarios enable row level security;
alter table public.usuario_area_roles enable row level security;
alter table public.registros_auditoria enable row level security;
alter table public.ordenes_publicidad enable row level security;
alter table public.items_orden_publicidad enable row level security;
alter table public.proveedores enable row level security;
alter table public.gastos_implementacion enable row level security;
alter table public.items_gasto_implementacion enable row level security;

-- Drop existing policies (idempotent) and create permissive policies for dev
-- Core tables
drop policy if exists "allow_all" on public.roles;
drop policy if exists "allow_all" on public.areas;
drop policy if exists "allow_all" on public.usuarios;
drop policy if exists "allow_all" on public.usuario_area_roles;
drop policy if exists "allow_all" on public.registros_auditoria;
create policy "allow_all" on public.roles for all using (true) with check (true);
create policy "allow_all" on public.areas for all using (true) with check (true);
create policy "allow_all" on public.usuarios for all using (true) with check (true);
create policy "allow_all" on public.usuario_area_roles for all using (true) with check (true);
create policy "allow_all" on public.registros_auditoria for all using (true) with check (true);

-- Comercial tables
drop policy if exists "allow_all" on public.ordenes_publicidad;
drop policy if exists "allow_all" on public.items_orden_publicidad;
create policy "allow_all" on public.ordenes_publicidad for all using (true) with check (true);
create policy "allow_all" on public.items_orden_publicidad for all using (true) with check (true);

-- Clientes: drop both explicit and generic policy names before creating allow_all
drop policy if exists "clientes_select_all" on public.proveedores;
drop policy if exists "clientes_insert_all" on public.proveedores;
drop policy if exists "clientes_update_all" on public.proveedores;
drop policy if exists "clientes_delete_all" on public.proveedores;
drop policy if exists "allow_all" on public.proveedores;
create policy "allow_all" on public.proveedores for all using (true) with check (true);

-- Implementación tables: drop any previous named policies then create permissive ones
drop policy if exists "Enable read access for authenticated users" on public.gastos_implementacion;
drop policy if exists "Enable read access for authenticated users" on public.items_gasto_implementacion;
drop policy if exists "Enable insert for authenticated users" on public.gastos_implementacion;
drop policy if exists "Enable insert for authenticated users" on public.items_gasto_implementacion;
drop policy if exists "Enable update for authenticated users" on public.gastos_implementacion;
drop policy if exists "Enable update for authenticated users" on public.items_gasto_implementacion;
drop policy if exists "allow_all" on public.gastos_implementacion;
drop policy if exists "allow_all" on public.items_gasto_implementacion;
create policy "allow_all" on public.gastos_implementacion for all using (true) with check (true);
create policy "allow_all" on public.items_gasto_implementacion for all using (true) with check (true);

COMMIT;
