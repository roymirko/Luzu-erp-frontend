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
