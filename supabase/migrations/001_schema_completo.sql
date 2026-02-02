-- ============================================
-- LUZU ERP - Schema Consolidado
-- Migración única que reemplaza todas las anteriores
-- ============================================

BEGIN;

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. CORE TABLES (sin cambios)
-- ============================================

-- ROLES
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AREAS
CREATE TABLE IF NOT EXISTS public.areas (
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

-- USUARIOS
CREATE TABLE IF NOT EXISTS public.usuarios (
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
  metadata JSONB DEFAULT '{}'::jsonb
);

-- USUARIO_AREA_ROLES
CREATE TABLE IF NOT EXISTS public.usuario_area_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  rol_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  assigned_by TEXT,
  UNIQUE(usuario_id, area_id, rol_id)
);

-- REGISTROS_AUDITORIA
CREATE TABLE IF NOT EXISTS public.registros_auditoria (
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
-- 2. COMERCIAL TABLES (sin cambios)
-- ============================================

-- ORDENES_PUBLICIDAD
CREATE TABLE IF NOT EXISTS public.ordenes_publicidad (
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

-- ITEMS_ORDEN_PUBLICIDAD
CREATE TABLE IF NOT EXISTS public.items_orden_publicidad (
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
-- 3. ENTIDADES (reemplaza proveedores)
-- Soporta proveedores, clientes, o ambos
-- ============================================

CREATE TABLE IF NOT EXISTS public.entidades (
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
-- 4. COMPROBANTES (reemplaza gastos)
-- Tabla central para ingresos y egresos
-- ============================================

CREATE TABLE IF NOT EXISTS public.comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Dirección del movimiento
  tipo_movimiento TEXT DEFAULT 'egreso' CHECK (tipo_movimiento IN ('ingreso', 'egreso')),

  -- Entidad (denormalizado para histórico)
  entidad_id UUID REFERENCES public.entidades(id),
  entidad_nombre TEXT NOT NULL,
  entidad_cuit TEXT,

  -- Datos factura argentina
  tipo_comprobante TEXT CHECK (tipo_comprobante IN (
    'FA', 'FB', 'FC', 'FE',           -- Facturas A, B, C, E
    'NCA', 'NCB', 'NCC',              -- Notas de crédito
    'NDA', 'NDB', 'NDC',              -- Notas de débito
    'REC', 'TKT', 'OTR'               -- Recibo, Ticket, Otro
  )),
  punto_venta TEXT,
  numero_comprobante TEXT,
  fecha_comprobante DATE,

  -- AFIP (manual)
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
  estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'anulado')),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- 5. CONTEXT TABLES (vinculan comprobantes a módulos)
-- ============================================

-- IMPLEMENTACION_COMPROBANTES (era implementacion_gastos)
CREATE TABLE IF NOT EXISTS public.implementacion_comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comprobante_id UUID NOT NULL REFERENCES public.comprobantes(id) ON DELETE CASCADE,
  orden_publicidad_id UUID REFERENCES public.ordenes_publicidad(id),
  item_orden_publicidad_id UUID REFERENCES public.items_orden_publicidad(id),
  factura_emitida_a TEXT,
  sector TEXT,
  rubro_gasto TEXT,
  sub_rubro TEXT,
  condicion_pago TEXT,
  forma_pago TEXT,
  fecha_pago DATE,
  adjuntos JSONB,
  UNIQUE(comprobante_id)
);

-- PROGRAMACION_FORMULARIOS (sin cambios, header)
CREATE TABLE IF NOT EXISTS public.programacion_formularios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_gestion VARCHAR(7),
  mes_venta VARCHAR(7),
  mes_inicio VARCHAR(7),
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  programa TEXT,
  ejecutivo TEXT,
  sub_rubro_empresa TEXT,
  detalle_campana TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- PROGRAMACION_COMPROBANTES (era programacion_gastos)
CREATE TABLE IF NOT EXISTS public.programacion_comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comprobante_id UUID NOT NULL REFERENCES public.comprobantes(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES public.programacion_formularios(id) ON DELETE CASCADE,
  categoria TEXT,
  acuerdo_pago TEXT,
  cliente TEXT,
  monto DECIMAL(15,2),
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,
  factura_emitida_a TEXT,
  forma_pago TEXT,
  UNIQUE(comprobante_id)
);

-- EXPERIENCE_FORMULARIOS (sin cambios, header)
CREATE TABLE IF NOT EXISTS public.experience_formularios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes_gestion VARCHAR(7),
  nombre_campana TEXT,
  detalle_campana TEXT,
  subrubro TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- EXPERIENCE_COMPROBANTES (era experience_gastos)
CREATE TABLE IF NOT EXISTS public.experience_comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comprobante_id UUID NOT NULL REFERENCES public.comprobantes(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES public.experience_formularios(id) ON DELETE CASCADE,
  factura_emitida_a TEXT,
  empresa TEXT,
  empresa_programa TEXT,
  fecha_comprobante DATE,
  acuerdo_pago TEXT,
  forma_pago TEXT,
  pais TEXT DEFAULT 'argentina',
  UNIQUE(comprobante_id)
);

-- ============================================
-- 6. LEGACY TABLES (mantener para compatibilidad)
-- Estas se borrarán en migración futura
-- ============================================

-- gastos_implementacion (legacy header)
CREATE TABLE IF NOT EXISTS public.gastos_implementacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fecha_registro DATE NOT NULL,
  orden_publicidad TEXT NOT NULL,
  responsable TEXT NOT NULL,
  unidad_negocio TEXT NOT NULL,
  categoria_negocio TEXT,
  nombre_campana TEXT NOT NULL,
  anio INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  id_formulario_comercial UUID,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  item_orden_publicidad_id UUID,
  acuerdo_pago TEXT,
  presupuesto DECIMAL(15,2),
  cantidad_programas INTEGER,
  programas_disponibles JSONB DEFAULT '[]'::jsonb,
  sector TEXT,
  rubro_gasto TEXT,
  sub_rubro TEXT,
  factura_emitida_a TEXT,
  empresa TEXT,
  concepto_gasto TEXT,
  observaciones TEXT,
  creado_por TEXT,
  actualizado_por TEXT
);

-- items_gasto_implementacion (legacy items)
CREATE TABLE IF NOT EXISTS public.items_gasto_implementacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gasto_id UUID REFERENCES public.gastos_implementacion(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  tipo_proveedor TEXT NOT NULL,
  proveedor TEXT NOT NULL,
  razon_social TEXT,
  descripcion TEXT,
  rubro_gasto TEXT NOT NULL,
  sub_rubro TEXT,
  sector TEXT NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'ARS',
  neto DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva DECIMAL(5,2) DEFAULT 21,
  importe_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  tipo_factura TEXT,
  numero_factura TEXT,
  fecha_factura DATE,
  condicion_pago TEXT,
  fecha_pago DATE,
  estado_pago TEXT NOT NULL DEFAULT 'pendiente',
  adjuntos JSONB
);

-- ============================================
-- 7. BACKWARD COMPATIBILITY VIEWS
-- Permiten que código legacy siga funcionando
-- ============================================

-- Vista proveedores (legacy) -> entidades tipo proveedor
CREATE OR REPLACE VIEW public.proveedores AS
SELECT
  id,
  razon_social,
  cuit,
  direccion,
  empresa,
  activo,
  created_at AS fecha_creacion,
  created_by AS creado_por
FROM public.entidades
WHERE tipo_entidad IN ('proveedor', 'ambos');

-- Vista gastos (legacy) -> comprobantes tipo egreso
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
  moneda,
  neto,
  iva_alicuota AS iva,
  total AS importe_total,
  empresa,
  concepto AS concepto_gasto,
  observaciones,
  estado,
  estado_pago,
  created_at,
  updated_at,
  created_by
FROM public.comprobantes
WHERE tipo_movimiento = 'egreso';

-- Vista implementacion_gastos (alias a implementacion_comprobantes)
CREATE OR REPLACE VIEW public.implementacion_gastos AS
SELECT
  id,
  comprobante_id AS gasto_id,
  orden_publicidad_id,
  item_orden_publicidad_id,
  factura_emitida_a,
  sector,
  rubro_gasto,
  sub_rubro,
  condicion_pago,
  forma_pago,
  fecha_pago,
  adjuntos
FROM public.implementacion_comprobantes;

-- Vista programacion_gastos (alias a programacion_comprobantes)
CREATE OR REPLACE VIEW public.programacion_gastos AS
SELECT
  id,
  comprobante_id AS gasto_id,
  formulario_id,
  categoria,
  acuerdo_pago,
  cliente,
  monto,
  valor_imponible,
  bonificacion,
  factura_emitida_a,
  forma_pago
FROM public.programacion_comprobantes;

-- Vista experience_gastos (alias a experience_comprobantes)
CREATE OR REPLACE VIEW public.experience_gastos AS
SELECT
  id,
  comprobante_id AS gasto_id,
  formulario_id,
  factura_emitida_a,
  empresa,
  empresa_programa,
  fecha_comprobante,
  acuerdo_pago,
  forma_pago,
  pais
FROM public.experience_comprobantes;

-- ============================================
-- 8. FULL VIEWS (para UI)
-- ============================================

-- Vista completa implementación
CREATE OR REPLACE VIEW public.implementacion_comprobantes_full AS
SELECT
  c.id,
  c.entidad_nombre AS proveedor,
  c.entidad_nombre AS razon_social,
  c.tipo_comprobante AS tipo_factura,
  CASE
    WHEN c.punto_venta IS NOT NULL AND c.numero_comprobante IS NOT NULL
    THEN CONCAT(c.punto_venta, '-', c.numero_comprobante)
    ELSE c.numero_comprobante
  END AS numero_factura,
  c.fecha_comprobante AS fecha_factura,
  c.moneda,
  c.neto,
  c.iva_alicuota AS iva,
  c.total AS importe_total,
  c.empresa,
  c.concepto AS concepto_gasto,
  c.observaciones,
  c.estado,
  c.estado_pago,
  c.created_at,
  c.updated_at,
  c.created_by,
  -- Contexto implementacion
  ic.id AS implementacion_gasto_id,
  ic.orden_publicidad_id,
  ic.item_orden_publicidad_id,
  ic.factura_emitida_a,
  ic.sector,
  ic.rubro_gasto,
  ic.sub_rubro,
  ic.condicion_pago,
  ic.forma_pago,
  ic.fecha_pago,
  ic.adjuntos,
  -- Datos de orden publicidad (joined)
  op.orden_publicidad,
  op.responsable,
  op.unidad_negocio,
  op.categoria_negocio,
  op.nombre_campana,
  op.razon_social AS orden_razon_social,
  op.marca,
  op.mes_servicio,
  op.acuerdo_pago AS orden_acuerdo_pago
FROM public.comprobantes c
JOIN public.implementacion_comprobantes ic ON c.id = ic.comprobante_id
LEFT JOIN public.ordenes_publicidad op ON ic.orden_publicidad_id = op.id;

-- Alias para código legacy
CREATE OR REPLACE VIEW public.implementacion_gastos_full AS
SELECT * FROM public.implementacion_comprobantes_full;

-- Vista completa programación
CREATE OR REPLACE VIEW public.programacion_comprobantes_full AS
SELECT
  c.id,
  c.entidad_nombre AS proveedor,
  c.entidad_nombre AS razon_social,
  c.tipo_comprobante AS tipo_factura,
  CASE
    WHEN c.punto_venta IS NOT NULL AND c.numero_comprobante IS NOT NULL
    THEN CONCAT(c.punto_venta, '-', c.numero_comprobante)
    ELSE c.numero_comprobante
  END AS numero_factura,
  c.fecha_comprobante AS fecha_factura,
  c.moneda,
  c.neto,
  c.iva_alicuota AS iva,
  c.total AS importe_total,
  c.empresa,
  c.concepto AS concepto_gasto,
  c.observaciones,
  c.estado,
  c.estado_pago,
  c.created_at,
  c.updated_at,
  c.created_by,
  -- Formulario fields
  pf.id AS formulario_id,
  pf.mes_gestion,
  pf.mes_venta,
  pf.mes_inicio,
  pf.unidad_negocio,
  pf.categoria_negocio,
  pf.programa,
  pf.ejecutivo,
  pf.sub_rubro_empresa,
  pf.detalle_campana,
  pf.estado AS formulario_estado,
  pf.created_at AS formulario_created_at,
  -- Context fields
  pc.id AS programacion_gasto_id,
  pc.categoria,
  pc.acuerdo_pago,
  pc.cliente,
  pc.monto,
  pc.valor_imponible,
  pc.bonificacion,
  pc.factura_emitida_a,
  pc.forma_pago
FROM public.comprobantes c
JOIN public.programacion_comprobantes pc ON c.id = pc.comprobante_id
JOIN public.programacion_formularios pf ON pc.formulario_id = pf.id;

-- Alias para código legacy
CREATE OR REPLACE VIEW public.programacion_gastos_full AS
SELECT * FROM public.programacion_comprobantes_full;

-- Vista completa experience
CREATE OR REPLACE VIEW public.experience_comprobantes_full AS
SELECT
  -- Comprobante fields
  c.id,
  c.entidad_nombre AS proveedor,
  c.entidad_nombre AS razon_social,
  c.tipo_comprobante AS tipo_factura,
  CASE
    WHEN c.punto_venta IS NOT NULL AND c.numero_comprobante IS NOT NULL
    THEN CONCAT(c.punto_venta, '-', c.numero_comprobante)
    ELSE c.numero_comprobante
  END AS numero_factura,
  c.fecha_comprobante AS fecha_factura,
  c.moneda,
  c.neto,
  c.iva_alicuota AS iva,
  c.total AS importe_total,
  c.empresa AS gasto_empresa,
  c.concepto AS concepto_gasto,
  c.observaciones,
  c.estado,
  c.estado_pago,
  c.created_at,
  c.updated_at,
  c.created_by,
  -- Formulario fields
  ef.id AS formulario_id,
  ef.mes_gestion,
  ef.nombre_campana,
  ef.detalle_campana,
  ef.subrubro,
  ef.estado AS formulario_estado,
  ef.created_at AS formulario_created_at,
  ef.created_by AS formulario_created_by,
  -- Context fields
  ec.id AS experience_gasto_id,
  ec.factura_emitida_a,
  ec.empresa,
  ec.empresa_programa,
  ec.fecha_comprobante,
  ec.acuerdo_pago,
  ec.forma_pago,
  ec.pais
FROM public.comprobantes c
JOIN public.experience_comprobantes ec ON c.id = ec.comprobante_id
JOIN public.experience_formularios ef ON ec.formulario_id = ef.id;

-- Alias para código legacy
CREATE OR REPLACE VIEW public.experience_gastos_full AS
SELECT * FROM public.experience_comprobantes_full;

-- Vista unificada de todos los gastos
CREATE OR REPLACE VIEW public.comprobantes_full AS
SELECT
  c.*,
  'implementacion' AS tipo_gasto,
  ic.orden_publicidad_id,
  ic.factura_emitida_a,
  ic.sector,
  ic.rubro_gasto,
  ic.sub_rubro,
  op.nombre_campana,
  op.unidad_negocio AS unidad_negocio_efectiva,
  op.categoria_negocio AS categoria_negocio_efectiva,
  NULL::VARCHAR(7) AS mes_gestion,
  NULL::TEXT AS programa,
  NULL::UUID AS formulario_programacion_id
FROM public.comprobantes c
JOIN public.implementacion_comprobantes ic ON c.id = ic.comprobante_id
LEFT JOIN public.ordenes_publicidad op ON ic.orden_publicidad_id = op.id
UNION ALL
SELECT
  c.*,
  'programacion' AS tipo_gasto,
  NULL::UUID AS orden_publicidad_id,
  pc.factura_emitida_a,
  NULL::TEXT AS sector,
  NULL::TEXT AS rubro_gasto,
  NULL::TEXT AS sub_rubro,
  pf.detalle_campana AS nombre_campana,
  pf.unidad_negocio AS unidad_negocio_efectiva,
  pf.categoria_negocio AS categoria_negocio_efectiva,
  pf.mes_gestion,
  pf.programa,
  pf.id AS formulario_programacion_id
FROM public.comprobantes c
JOIN public.programacion_comprobantes pc ON c.id = pc.comprobante_id
JOIN public.programacion_formularios pf ON pc.formulario_id = pf.id
UNION ALL
SELECT
  c.*,
  'experience' AS tipo_gasto,
  NULL::UUID AS orden_publicidad_id,
  ec.factura_emitida_a,
  NULL::TEXT AS sector,
  NULL::TEXT AS rubro_gasto,
  NULL::TEXT AS sub_rubro,
  ef.nombre_campana,
  NULL::TEXT AS unidad_negocio_efectiva,
  NULL::TEXT AS categoria_negocio_efectiva,
  ef.mes_gestion,
  NULL::TEXT AS programa,
  ef.id AS formulario_programacion_id
FROM public.comprobantes c
JOIN public.experience_comprobantes ec ON c.id = ec.comprobante_id
JOIN public.experience_formularios ef ON ec.formulario_id = ef.id;

-- Alias legacy
CREATE OR REPLACE VIEW public.gastos_full AS
SELECT * FROM public.comprobantes_full WHERE tipo_movimiento = 'egreso';

-- ============================================
-- 9. INDEXES
-- ============================================

-- Entidades
CREATE INDEX IF NOT EXISTS idx_entidades_tipo ON public.entidades(tipo_entidad);
CREATE INDEX IF NOT EXISTS idx_entidades_activo ON public.entidades(activo);
CREATE INDEX IF NOT EXISTS idx_entidades_cuit ON public.entidades(cuit);

-- Comprobantes
CREATE INDEX IF NOT EXISTS idx_comprobantes_tipo_movimiento ON public.comprobantes(tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_comprobantes_estado ON public.comprobantes(estado);
CREATE INDEX IF NOT EXISTS idx_comprobantes_estado_pago ON public.comprobantes(estado_pago);
CREATE INDEX IF NOT EXISTS idx_comprobantes_created ON public.comprobantes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comprobantes_entidad ON public.comprobantes(entidad_id);
CREATE INDEX IF NOT EXISTS idx_comprobantes_fecha ON public.comprobantes(fecha_comprobante);

-- Implementacion comprobantes
CREATE INDEX IF NOT EXISTS idx_impl_comprobantes_comprobante ON public.implementacion_comprobantes(comprobante_id);
CREATE INDEX IF NOT EXISTS idx_impl_comprobantes_orden ON public.implementacion_comprobantes(orden_publicidad_id);
CREATE INDEX IF NOT EXISTS idx_impl_comprobantes_item ON public.implementacion_comprobantes(item_orden_publicidad_id);

-- Programacion
CREATE INDEX IF NOT EXISTS idx_prog_formularios_mes ON public.programacion_formularios(mes_gestion);
CREATE INDEX IF NOT EXISTS idx_prog_formularios_programa ON public.programacion_formularios(programa);
CREATE INDEX IF NOT EXISTS idx_prog_formularios_estado ON public.programacion_formularios(estado);
CREATE INDEX IF NOT EXISTS idx_prog_comprobantes_comprobante ON public.programacion_comprobantes(comprobante_id);
CREATE INDEX IF NOT EXISTS idx_prog_comprobantes_formulario ON public.programacion_comprobantes(formulario_id);

-- Experience
CREATE INDEX IF NOT EXISTS idx_exp_formularios_estado ON public.experience_formularios(estado);
CREATE INDEX IF NOT EXISTS idx_exp_formularios_created ON public.experience_formularios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exp_comprobantes_comprobante ON public.experience_comprobantes(comprobante_id);
CREATE INDEX IF NOT EXISTS idx_exp_comprobantes_formulario ON public.experience_comprobantes(formulario_id);

-- Legacy
CREATE INDEX IF NOT EXISTS idx_gastos_impl_item ON public.gastos_implementacion(item_orden_publicidad_id);
CREATE INDEX IF NOT EXISTS idx_items_gasto_gasto ON public.items_gasto_implementacion(gasto_id);

-- ============================================
-- 10. TRIGGERS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to comprobantes
DROP TRIGGER IF EXISTS trigger_comprobantes_updated_at ON public.comprobantes;
CREATE TRIGGER trigger_comprobantes_updated_at
  BEFORE UPDATE ON public.comprobantes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Apply to entidades
DROP TRIGGER IF EXISTS trigger_entidades_updated_at ON public.entidades;
CREATE TRIGGER trigger_entidades_updated_at
  BEFORE UPDATE ON public.entidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Apply to programacion_formularios
DROP TRIGGER IF EXISTS trigger_programacion_formularios_updated_at ON public.programacion_formularios;
CREATE TRIGGER trigger_programacion_formularios_updated_at
  BEFORE UPDATE ON public.programacion_formularios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Apply to experience_formularios
DROP TRIGGER IF EXISTS trigger_experience_formularios_updated_at ON public.experience_formularios;
CREATE TRIGGER trigger_experience_formularios_updated_at
  BEFORE UPDATE ON public.experience_formularios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 11. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_area_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_publicidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_orden_publicidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementacion_comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programacion_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programacion_comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_implementacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_gasto_implementacion ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for dev (allow all)
DROP POLICY IF EXISTS "allow_all" ON public.roles;
DROP POLICY IF EXISTS "allow_all" ON public.areas;
DROP POLICY IF EXISTS "allow_all" ON public.usuarios;
DROP POLICY IF EXISTS "allow_all" ON public.usuario_area_roles;
DROP POLICY IF EXISTS "allow_all" ON public.registros_auditoria;
DROP POLICY IF EXISTS "allow_all" ON public.ordenes_publicidad;
DROP POLICY IF EXISTS "allow_all" ON public.items_orden_publicidad;
DROP POLICY IF EXISTS "allow_all" ON public.entidades;
DROP POLICY IF EXISTS "allow_all" ON public.comprobantes;
DROP POLICY IF EXISTS "allow_all" ON public.implementacion_comprobantes;
DROP POLICY IF EXISTS "allow_all" ON public.programacion_formularios;
DROP POLICY IF EXISTS "allow_all" ON public.programacion_comprobantes;
DROP POLICY IF EXISTS "allow_all" ON public.experience_formularios;
DROP POLICY IF EXISTS "allow_all" ON public.experience_comprobantes;
DROP POLICY IF EXISTS "allow_all" ON public.gastos_implementacion;
DROP POLICY IF EXISTS "allow_all" ON public.items_gasto_implementacion;

CREATE POLICY "allow_all" ON public.roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.usuario_area_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.registros_auditoria FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.ordenes_publicidad FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.items_orden_publicidad FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.entidades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.comprobantes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.implementacion_comprobantes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.programacion_formularios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.programacion_comprobantes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.experience_formularios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.experience_comprobantes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.gastos_implementacion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.items_gasto_implementacion FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 12. GRANTS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

COMMIT;
