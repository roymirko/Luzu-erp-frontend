-- ============================================
-- LUZU ERP - Schema Consolidado v2
-- 2 tablas principales: contexto_comprobante + comprobantes (flattened)
-- ============================================

BEGIN;

-- ============================================
-- DROP EVERYTHING (dev only, clean-slate reset)
-- Order: views first, then tables (respect FK deps)
-- ============================================
DROP VIEW IF EXISTS public.gastos_full CASCADE;
DROP VIEW IF EXISTS public.comprobantes_full CASCADE;
DROP VIEW IF EXISTS public.gastos CASCADE;
DROP VIEW IF EXISTS public.proveedores CASCADE;

DROP TABLE IF EXISTS public.comprobantes CASCADE;
DROP TABLE IF EXISTS public.contexto_comprobante CASCADE;
DROP TABLE IF EXISTS public.entidades CASCADE;
DROP TABLE IF EXISTS public.items_orden_publicidad CASCADE;
DROP TABLE IF EXISTS public.ordenes_publicidad CASCADE;
DROP TABLE IF EXISTS public.usuario_area_roles CASCADE;
DROP TABLE IF EXISTS public.registros_auditoria CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.areas CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- ============================================
-- EXTENSIONS (suppress "already exists" notices)
-- ============================================
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 1. CORE TABLES
-- ============================================

CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  creado_por TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE public.usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login TIMESTAMPTZ,
  creado_por TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  password_hash TEXT,
  user_type TEXT DEFAULT 'administrador' CHECK (user_type IN ('administrador', 'implementacion', 'programacion', 'administracion', 'finanzas'))
);

CREATE TABLE public.usuario_area_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  rol_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  assigned_by TEXT,
  UNIQUE(usuario_id, area_id, rol_id)
);

CREATE TABLE public.registros_auditoria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  details TEXT,
  result TEXT NOT NULL CHECK (result IN ('success', 'error', 'warning')),
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT
);

-- ============================================
-- 2. COMERCIAL TABLES
-- ============================================

CREATE TABLE public.ordenes_publicidad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha TEXT,
  mes_servicio TEXT,
  responsable TEXT,
  orden_publicidad TEXT,
  total_venta TEXT,
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  proyecto TEXT,
  razon_social TEXT,
  categoria TEXT,
  empresa_agencia TEXT,
  marca TEXT,
  nombre_campana TEXT,
  acuerdo_pago TEXT,
  tipo_importe TEXT CHECK (tipo_importe IN ('canje', 'factura')),
  observaciones TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  creado_por TEXT
);

CREATE TABLE public.items_orden_publicidad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_publicidad_id UUID NOT NULL REFERENCES public.ordenes_publicidad(id) ON DELETE CASCADE,
  programa TEXT,
  monto TEXT,
  nc_programa TEXT,
  nc_porcentaje TEXT,
  proveedor_fee TEXT,
  fee_programa TEXT,
  fee_porcentaje TEXT,
  implementacion TEXT,
  talentos TEXT,
  tecnica TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 3. ENTIDADES (Proveedores + Clientes)
-- ============================================

CREATE TABLE public.entidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  cuit TEXT NOT NULL UNIQUE,
  tipo_entidad TEXT DEFAULT 'proveedor' CHECK (tipo_entidad IN ('proveedor', 'cliente', 'ambos')),
  condicion_iva TEXT DEFAULT 'responsable_inscripto' CHECK (condicion_iva IN (
    'responsable_inscripto', 'monotributista', 'exento', 'consumidor_final', 'no_responsable'
  )),
  direccion TEXT,
  localidad TEXT,
  provincia TEXT,
  email TEXT,
  telefono TEXT,
  empresa TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- 4. CONTEXTO_COMPROBANTE (unified header for prog/exp/prod)
-- Replaces: programacion_formularios, experience_formularios, productora_formularios
-- ============================================

CREATE TABLE public.contexto_comprobante (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_origen TEXT NOT NULL CHECK (area_origen IN ('programacion','experience','productora')),
  -- Shared
  mes_gestion VARCHAR(7),
  detalle_campana TEXT,
  estado TEXT DEFAULT 'activo',
  nombre_campana TEXT,
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  -- Programacion-specific
  mes_venta VARCHAR(7),
  mes_inicio VARCHAR(7),
  programa TEXT,
  ejecutivo TEXT,
  -- Productora-specific
  rubro TEXT,
  sub_rubro TEXT,
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- 5. COMPROBANTES (Ingresos + Egresos + flattened context)
-- Central table. Context columns nullable, discriminated by area_origen.
-- ============================================

CREATE TABLE public.comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dirección del movimiento
  tipo_movimiento TEXT DEFAULT 'egreso' CHECK (tipo_movimiento IN ('ingreso', 'egreso')),

  -- Entidad (denormalizado para histórico)
  entidad_id UUID REFERENCES public.entidades(id),
  entidad_nombre TEXT NOT NULL,
  entidad_cuit TEXT,

  -- Datos factura argentina
  tipo_comprobante TEXT CHECK (tipo_comprobante IN (
    'FA', 'FB', 'FC', 'FE',
    'NCA', 'NCB', 'NCC',
    'NDA', 'NDB', 'NDC',
    'REC', 'TKT', 'OTR'
  )),
  punto_venta TEXT,
  numero_comprobante TEXT,
  fecha_comprobante DATE,

  -- AFIP
  cae TEXT,
  fecha_vencimiento_cae DATE,

  -- Montos
  moneda TEXT DEFAULT 'ARS',
  neto DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_alicuota DECIMAL(5,2) DEFAULT 21,
  iva_monto DECIMAL(15,2) DEFAULT 0,
  percepciones DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- Concepto
  empresa TEXT,
  concepto TEXT,
  observaciones TEXT,

  -- Estado
  estado TEXT DEFAULT 'pendiente',
  estado_pago TEXT DEFAULT 'creado' CHECK (estado_pago IN ('creado', 'aprobado', 'requiere_info', 'rechazado', 'pagado')),

  -- Payment/collection fields
  forma_pago TEXT,
  cotizacion DECIMAL(15,4),
  banco TEXT,
  numero_operacion TEXT,
  fecha_pago DATE,

  -- Admin fields
  condicion_iva TEXT,
  comprobante_pago TEXT,
  ingresos_brutos DECIMAL(15,2) DEFAULT 0,
  retencion_ganancias DECIMAL(15,2) DEFAULT 0,
  fecha_estimada_pago DATE,
  nota_admin TEXT,

  -- Ingreso-specific fields
  retencion_iva DECIMAL(15,2) DEFAULT 0,
  retencion_suss DECIMAL(15,2) DEFAULT 0,
  fecha_vencimiento DATE,
  fecha_ingreso_cheque DATE,
  certificacion_enviada_fecha DATE,
  portal TEXT,
  contacto TEXT,
  fecha_envio DATE,
  orden_publicidad_id_ingreso UUID REFERENCES public.ordenes_publicidad(id),

  -- Consolidated context fields (were always on comprobantes)
  factura_emitida_a TEXT,
  acuerdo_pago TEXT,

  -- ============================================
  -- NEW: Flattened context columns (replaces 6 context tables)
  -- ============================================
  area_origen TEXT, -- 'implementacion','tecnica','talentos','programacion','experience','productora','directo'
  contexto_comprobante_id UUID REFERENCES public.contexto_comprobante(id),
  orden_publicidad_id UUID REFERENCES public.ordenes_publicidad(id),
  item_orden_publicidad_id UUID REFERENCES public.items_orden_publicidad(id),

  -- Impl/Tec/Talentos shared
  sector TEXT,
  rubro_contexto TEXT,
  sub_rubro_contexto TEXT,
  condicion_pago TEXT,
  adjuntos JSONB,

  -- Tec/Talentos standalone (when no OP linked)
  nombre_campana TEXT,
  unidad_negocio TEXT,
  categoria_negocio TEXT,

  -- Prog-specific
  categoria TEXT,
  cliente TEXT,
  monto_prog DECIMAL(15,2),
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,

  -- Exp/Prod-specific
  empresa_programa TEXT,
  pais TEXT DEFAULT 'argentina',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- 6. BACKWARD COMPATIBILITY VIEWS
-- ============================================

CREATE OR REPLACE VIEW public.proveedores AS
SELECT
  id, razon_social, cuit, direccion, empresa, activo,
  created_at AS fecha_creacion, created_by AS creado_por
FROM public.entidades
WHERE tipo_entidad IN ('proveedor', 'ambos');

CREATE OR REPLACE VIEW public.gastos AS
SELECT
  id,
  entidad_nombre AS proveedor,
  entidad_nombre AS razon_social,
  tipo_comprobante AS tipo_factura,
  CASE
    WHEN punto_venta IS NOT NULL AND numero_comprobante IS NOT NULL
    THEN CONCAT(punto_venta, '-', numero_comprobante)
    ELSE numero_comprobante
  END AS numero_factura,
  fecha_comprobante AS fecha_factura,
  moneda, neto, iva_alicuota AS iva, total AS importe_total,
  empresa, concepto AS concepto_gasto, observaciones,
  estado, estado_pago, created_at, updated_at, created_by
FROM public.comprobantes
WHERE tipo_movimiento = 'egreso';

-- ============================================
-- 7. SIMPLIFIED FULL VIEWS
-- ============================================

-- Main unified view: comprobantes + contexto_comprobante + OP
CREATE OR REPLACE VIEW public.comprobantes_full AS
SELECT
  c.*,
  -- Contexto comprobante (header for prog/exp/prod)
  cc.mes_gestion AS ctx_mes_gestion,
  cc.detalle_campana AS ctx_detalle_campana,
  cc.programa AS ctx_programa,
  cc.ejecutivo AS ctx_ejecutivo,
  cc.mes_venta AS ctx_mes_venta,
  cc.mes_inicio AS ctx_mes_inicio,
  cc.nombre_campana AS ctx_nombre_campana,
  cc.unidad_negocio AS ctx_unidad_negocio,
  cc.categoria_negocio AS ctx_categoria_negocio,
  cc.rubro AS ctx_rubro,
  cc.sub_rubro AS ctx_sub_rubro,
  cc.estado AS ctx_estado,
  cc.created_at AS ctx_created_at,
  cc.created_by AS ctx_created_by,
  -- OP vinculada (egresos)
  op.orden_publicidad AS op_numero_orden,
  op.responsable AS op_responsable,
  op.unidad_negocio AS op_unidad_negocio,
  op.categoria_negocio AS op_categoria_negocio,
  op.nombre_campana AS op_nombre_campana,
  op.razon_social AS op_razon_social,
  op.marca AS op_marca,
  op.mes_servicio AS op_mes_servicio,
  op.acuerdo_pago AS op_acuerdo_pago,
  -- OP vinculada (ingresos)
  opi.id AS ingreso_op_id,
  opi.orden_publicidad AS ingreso_op_numero,
  opi.responsable AS ingreso_op_responsable,
  opi.unidad_negocio AS ingreso_op_unidad_negocio,
  opi.nombre_campana AS ingreso_op_nombre_campana,
  opi.marca AS ingreso_op_marca,
  opi.razon_social AS ingreso_op_razon_social,
  opi.total_venta AS ingreso_op_importe,
  opi.acuerdo_pago AS ingreso_op_acuerdo_pago,
  opi.mes_servicio AS ingreso_op_mes_servicio,
  -- Entidad resolved
  COALESCE(c.entidad_cuit, e.cuit) AS entidad_cuit_efectivo,
  e.condicion_iva AS entidad_condicion_iva
FROM comprobantes c
LEFT JOIN contexto_comprobante cc ON c.contexto_comprobante_id = cc.id
LEFT JOIN ordenes_publicidad op ON c.orden_publicidad_id = op.id
LEFT JOIN ordenes_publicidad opi ON c.orden_publicidad_id_ingreso = opi.id
LEFT JOIN entidades e ON c.entidad_id = e.id;

-- Gastos full = egresos only
CREATE OR REPLACE VIEW public.gastos_full AS
SELECT * FROM public.comprobantes_full WHERE tipo_movimiento = 'egreso';

-- ============================================
-- 8. FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions;

CREATE OR REPLACE FUNCTION public.verify_password(input_email TEXT, input_password TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM public.usuarios
  WHERE email = input_email
    AND active = true
    AND password_hash IS NOT NULL
    AND crypt(input_password, password_hash) = password_hash;
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, extensions;

-- ============================================
-- 9. INDEXES
-- ============================================

-- Usuarios
CREATE INDEX idx_usuarios_email ON public.usuarios(email);

-- Entidades
CREATE INDEX idx_entidades_tipo ON public.entidades(tipo_entidad);
CREATE INDEX idx_entidades_activo ON public.entidades(activo);
CREATE INDEX idx_entidades_cuit ON public.entidades(cuit);

-- Contexto comprobante
CREATE INDEX idx_ctx_comp_area ON public.contexto_comprobante(area_origen);
CREATE INDEX idx_ctx_comp_estado ON public.contexto_comprobante(estado);
CREATE INDEX idx_ctx_comp_created ON public.contexto_comprobante(created_at DESC);

-- Comprobantes
CREATE INDEX idx_comprobantes_tipo_movimiento ON public.comprobantes(tipo_movimiento);
CREATE INDEX idx_comprobantes_area_origen ON public.comprobantes(area_origen);
CREATE INDEX idx_comprobantes_estado ON public.comprobantes(estado);
CREATE INDEX idx_comprobantes_estado_pago ON public.comprobantes(estado_pago);
CREATE INDEX idx_comprobantes_created ON public.comprobantes(created_at DESC);
CREATE INDEX idx_comprobantes_entidad ON public.comprobantes(entidad_id);
CREATE INDEX idx_comprobantes_fecha ON public.comprobantes(fecha_comprobante);
CREATE INDEX idx_comprobantes_forma_pago ON public.comprobantes(forma_pago);
CREATE INDEX idx_comprobantes_fecha_pago ON public.comprobantes(fecha_pago);
CREATE INDEX idx_comprobantes_fecha_estimada ON public.comprobantes(fecha_estimada_pago);
CREATE INDEX idx_comprobantes_condicion_iva ON public.comprobantes(condicion_iva);
CREATE INDEX idx_comprobantes_op ON public.comprobantes(orden_publicidad_id);
CREATE INDEX idx_comprobantes_item_op ON public.comprobantes(item_orden_publicidad_id);
CREATE INDEX idx_comprobantes_contexto ON public.comprobantes(contexto_comprobante_id);
CREATE INDEX idx_comprobantes_op_ingreso ON public.comprobantes(orden_publicidad_id_ingreso);
CREATE INDEX idx_comprobantes_fecha_vencimiento ON public.comprobantes(fecha_vencimiento);

-- ============================================
-- 10. TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comprobantes_updated_at
  BEFORE UPDATE ON public.comprobantes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_entidades_updated_at
  BEFORE UPDATE ON public.entidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_contexto_comprobante_updated_at
  BEFORE UPDATE ON public.contexto_comprobante
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 11. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_area_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_publicidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_orden_publicidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contexto_comprobante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON public.roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.usuario_area_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.registros_auditoria FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.ordenes_publicidad FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.items_orden_publicidad FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.entidades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.contexto_comprobante FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.comprobantes FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 12. GRANTS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

GRANT SELECT ON comprobantes_full TO authenticated, anon;
GRANT SELECT ON gastos_full TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.hash_password(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.verify_password(TEXT, TEXT) TO authenticated, anon;

COMMIT;
