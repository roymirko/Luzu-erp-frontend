-- ============================================
-- LUZU ERP - Schema Consolidado
-- Migración única (folds 001-007)
-- ============================================

BEGIN;

-- ============================================
-- DROP EVERYTHING (dev only, not in production)
-- ============================================
DROP VIEW IF EXISTS public.gastos_full CASCADE;
DROP VIEW IF EXISTS public.comprobantes_full CASCADE;
DROP VIEW IF EXISTS public.implementacion_gastos_full CASCADE;
DROP VIEW IF EXISTS public.implementacion_comprobantes_full CASCADE;
DROP VIEW IF EXISTS public.programacion_gastos_full CASCADE;
DROP VIEW IF EXISTS public.programacion_comprobantes_full CASCADE;
DROP VIEW IF EXISTS public.experience_gastos_full CASCADE;
DROP VIEW IF EXISTS public.experience_comprobantes_full CASCADE;
DROP VIEW IF EXISTS public.implementacion_gastos CASCADE;
DROP VIEW IF EXISTS public.programacion_gastos CASCADE;
DROP VIEW IF EXISTS public.experience_gastos CASCADE;
DROP VIEW IF EXISTS public.gastos CASCADE;
DROP VIEW IF EXISTS public.proveedores CASCADE;

DROP TABLE IF EXISTS public.items_gasto_implementacion CASCADE;
DROP TABLE IF EXISTS public.gastos_implementacion CASCADE;
DROP TABLE IF EXISTS public.experience_comprobantes CASCADE;
DROP TABLE IF EXISTS public.experience_formularios CASCADE;
DROP TABLE IF EXISTS public.programacion_comprobantes CASCADE;
DROP TABLE IF EXISTS public.programacion_formularios CASCADE;
DROP TABLE IF EXISTS public.implementacion_comprobantes CASCADE;
DROP TABLE IF EXISTS public.comprobantes CASCADE;
DROP TABLE IF EXISTS public.entidades CASCADE;
DROP TABLE IF EXISTS public.items_orden_publicidad CASCADE;
DROP TABLE IF EXISTS public.ordenes_publicidad CASCADE;
DROP TABLE IF EXISTS public.usuario_area_roles CASCADE;
DROP TABLE IF EXISTS public.registros_auditoria CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.areas CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. CORE TABLES
-- ============================================

-- ROLES
CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AREAS
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

-- USUARIOS
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
  -- Auth fields
  password_hash TEXT,
  user_type TEXT DEFAULT 'administrador' CHECK (user_type IN ('administrador', 'implementacion', 'programacion', 'administracion', 'finanzas'))
);

-- USUARIO_AREA_ROLES
CREATE TABLE public.usuario_area_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  rol_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  assigned_by TEXT,
  UNIQUE(usuario_id, area_id, rol_id)
);

-- REGISTROS_AUDITORIA
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

-- ORDENES_PUBLICIDAD
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

-- ITEMS_ORDEN_PUBLICIDAD
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
-- 4. COMPROBANTES (Ingresos + Egresos)
-- Central table for all financial documents
-- ============================================

CREATE TABLE public.comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

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

  -- Consolidated context fields
  factura_emitida_a TEXT,
  acuerdo_pago TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- 5. CONTEXT TABLES (vinculan comprobantes a módulos)
-- ============================================

-- IMPLEMENTACION_COMPROBANTES
CREATE TABLE public.implementacion_comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comprobante_id UUID NOT NULL REFERENCES public.comprobantes(id) ON DELETE CASCADE,
  orden_publicidad_id UUID REFERENCES public.ordenes_publicidad(id),
  item_orden_publicidad_id UUID REFERENCES public.items_orden_publicidad(id),
  sector TEXT,
  rubro_gasto TEXT,
  sub_rubro TEXT,
  condicion_pago TEXT,
  adjuntos JSONB,
  UNIQUE(comprobante_id)
);

-- PROGRAMACION_FORMULARIOS
CREATE TABLE public.programacion_formularios (
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

-- PROGRAMACION_COMPROBANTES
CREATE TABLE public.programacion_comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comprobante_id UUID NOT NULL REFERENCES public.comprobantes(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES public.programacion_formularios(id) ON DELETE CASCADE,
  categoria TEXT,
  cliente TEXT,
  monto DECIMAL(15,2),
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,
  UNIQUE(comprobante_id)
);

-- EXPERIENCE_FORMULARIOS
CREATE TABLE public.experience_formularios (
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

-- EXPERIENCE_COMPROBANTES
CREATE TABLE public.experience_comprobantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comprobante_id UUID NOT NULL REFERENCES public.comprobantes(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES public.experience_formularios(id) ON DELETE CASCADE,
  empresa TEXT,
  empresa_programa TEXT,
  fecha_comprobante DATE,
  pais TEXT DEFAULT 'argentina',
  UNIQUE(comprobante_id)
);

-- ============================================
-- 6. LEGACY TABLES (mantener para compatibilidad)
-- ============================================

CREATE TABLE public.gastos_implementacion (
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

CREATE TABLE public.items_gasto_implementacion (
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

-- Vista implementacion_gastos (alias)
CREATE OR REPLACE VIEW public.implementacion_gastos AS
SELECT
  id,
  comprobante_id AS gasto_id,
  orden_publicidad_id,
  item_orden_publicidad_id,
  sector,
  rubro_gasto,
  sub_rubro,
  condicion_pago,
  adjuntos
FROM public.implementacion_comprobantes;

-- Vista programacion_gastos (alias)
CREATE OR REPLACE VIEW public.programacion_gastos AS
SELECT
  id,
  comprobante_id AS gasto_id,
  formulario_id,
  categoria,
  cliente,
  monto,
  valor_imponible,
  bonificacion
FROM public.programacion_comprobantes;

-- Vista experience_gastos (alias)
CREATE OR REPLACE VIEW public.experience_gastos AS
SELECT
  id,
  comprobante_id AS gasto_id,
  formulario_id,
  empresa,
  empresa_programa,
  fecha_comprobante,
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
  c.factura_emitida_a,
  ic.sector,
  ic.rubro_gasto,
  ic.sub_rubro,
  ic.condicion_pago,
  c.forma_pago,
  c.fecha_pago,
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
  c.acuerdo_pago,
  pc.cliente,
  pc.monto,
  pc.valor_imponible,
  pc.bonificacion,
  c.factura_emitida_a,
  c.forma_pago
FROM public.comprobantes c
JOIN public.programacion_comprobantes pc ON c.id = pc.comprobante_id
JOIN public.programacion_formularios pf ON pc.formulario_id = pf.id;

CREATE OR REPLACE VIEW public.programacion_gastos_full AS
SELECT * FROM public.programacion_comprobantes_full;

-- Vista completa experience
CREATE OR REPLACE VIEW public.experience_comprobantes_full AS
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
  c.factura_emitida_a,
  ec.empresa,
  ec.empresa_programa,
  ec.fecha_comprobante,
  c.acuerdo_pago,
  c.forma_pago,
  ec.pais
FROM public.comprobantes c
JOIN public.experience_comprobantes ec ON c.id = ec.comprobante_id
JOIN public.experience_formularios ef ON ec.formulario_id = ef.id;

CREATE OR REPLACE VIEW public.experience_gastos_full AS
SELECT * FROM public.experience_comprobantes_full;

-- Vista unificada comprobantes_full
CREATE OR REPLACE VIEW public.comprobantes_full AS
SELECT
  c.*,
  CASE
    WHEN ic.id IS NOT NULL THEN 'implementacion'
    WHEN pc.id IS NOT NULL THEN 'programacion'
    WHEN ec.id IS NOT NULL THEN 'experience'
    ELSE 'directo'
  END as area_origen,
  -- Implementacion context
  ic.id as implementacion_comprobante_id,
  ic.orden_publicidad_id,
  ic.item_orden_publicidad_id,
  ic.sector,
  ic.rubro_gasto,
  ic.sub_rubro,
  op.nombre_campana as impl_nombre_campana,
  op.orden_publicidad as impl_orden_publicidad,
  -- Programacion context
  pc.id as programacion_comprobante_id,
  pc.formulario_id as programacion_formulario_id,
  pf.programa as prog_programa,
  pf.mes_gestion as prog_mes_gestion,
  pf.unidad_negocio as prog_unidad_negocio,
  pf.categoria_negocio as prog_categoria_negocio,
  -- Experience context
  ec.id as experience_comprobante_id,
  ec.formulario_id as experience_formulario_id,
  ef.nombre_campana as exp_nombre_campana,
  ef.mes_gestion as exp_mes_gestion,
  -- OP vinculada para ingresos
  opi.id as ingreso_op_id,
  opi.orden_publicidad as ingreso_op_numero,
  opi.responsable as ingreso_op_responsable,
  opi.unidad_negocio as ingreso_op_unidad_negocio,
  opi.nombre_campana as ingreso_op_nombre_campana,
  opi.marca as ingreso_op_marca,
  opi.razon_social as ingreso_op_razon_social,
  opi.total_venta as ingreso_op_importe,
  opi.acuerdo_pago as ingreso_op_acuerdo_pago,
  opi.mes_servicio as ingreso_op_mes_servicio,
  -- Entidad resolved (fallback to entidades table)
  COALESCE(c.entidad_cuit, e.cuit) as entidad_cuit_efectivo,
  e.condicion_iva as entidad_condicion_iva
FROM comprobantes c
LEFT JOIN entidades e ON c.entidad_id = e.id
LEFT JOIN implementacion_comprobantes ic ON c.id = ic.comprobante_id
LEFT JOIN ordenes_publicidad op ON ic.orden_publicidad_id = op.id
LEFT JOIN programacion_comprobantes pc ON c.id = pc.comprobante_id
LEFT JOIN programacion_formularios pf ON pc.formulario_id = pf.id
LEFT JOIN experience_comprobantes ec ON c.id = ec.comprobante_id
LEFT JOIN experience_formularios ef ON ec.formulario_id = ef.id
LEFT JOIN ordenes_publicidad opi ON c.orden_publicidad_id_ingreso = opi.id;

CREATE OR REPLACE VIEW public.gastos_full AS
SELECT * FROM public.comprobantes_full WHERE tipo_movimiento = 'egreso';

-- ============================================
-- 9. FUNCTIONS
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
-- 10. INDEXES
-- ============================================

-- Usuarios
CREATE INDEX idx_usuarios_email ON public.usuarios(email);

-- Entidades
CREATE INDEX idx_entidades_tipo ON public.entidades(tipo_entidad);
CREATE INDEX idx_entidades_activo ON public.entidades(activo);
CREATE INDEX idx_entidades_cuit ON public.entidades(cuit);

-- Comprobantes
CREATE INDEX idx_comprobantes_tipo_movimiento ON public.comprobantes(tipo_movimiento);
CREATE INDEX idx_comprobantes_estado ON public.comprobantes(estado);
CREATE INDEX idx_comprobantes_estado_pago ON public.comprobantes(estado_pago);
CREATE INDEX idx_comprobantes_created ON public.comprobantes(created_at DESC);
CREATE INDEX idx_comprobantes_entidad ON public.comprobantes(entidad_id);
CREATE INDEX idx_comprobantes_fecha ON public.comprobantes(fecha_comprobante);
CREATE INDEX idx_comprobantes_forma_pago ON public.comprobantes(forma_pago);
CREATE INDEX idx_comprobantes_fecha_pago ON public.comprobantes(fecha_pago);
CREATE INDEX idx_comprobantes_fecha_estimada ON public.comprobantes(fecha_estimada_pago);
CREATE INDEX idx_comprobantes_condicion_iva ON public.comprobantes(condicion_iva);
CREATE INDEX idx_comprobantes_op_ingreso ON public.comprobantes(orden_publicidad_id_ingreso);
CREATE INDEX idx_comprobantes_fecha_vencimiento ON public.comprobantes(fecha_vencimiento);

-- Implementacion comprobantes
CREATE INDEX idx_impl_comprobantes_comprobante ON public.implementacion_comprobantes(comprobante_id);
CREATE INDEX idx_impl_comprobantes_orden ON public.implementacion_comprobantes(orden_publicidad_id);
CREATE INDEX idx_impl_comprobantes_item ON public.implementacion_comprobantes(item_orden_publicidad_id);

-- Programacion
CREATE INDEX idx_prog_formularios_mes ON public.programacion_formularios(mes_gestion);
CREATE INDEX idx_prog_formularios_programa ON public.programacion_formularios(programa);
CREATE INDEX idx_prog_formularios_estado ON public.programacion_formularios(estado);
CREATE INDEX idx_prog_comprobantes_comprobante ON public.programacion_comprobantes(comprobante_id);
CREATE INDEX idx_prog_comprobantes_formulario ON public.programacion_comprobantes(formulario_id);

-- Experience
CREATE INDEX idx_exp_formularios_estado ON public.experience_formularios(estado);
CREATE INDEX idx_exp_formularios_created ON public.experience_formularios(created_at DESC);
CREATE INDEX idx_exp_comprobantes_comprobante ON public.experience_comprobantes(comprobante_id);
CREATE INDEX idx_exp_comprobantes_formulario ON public.experience_comprobantes(formulario_id);

-- Legacy
CREATE INDEX idx_gastos_impl_item ON public.gastos_implementacion(item_orden_publicidad_id);
CREATE INDEX idx_items_gasto_gasto ON public.items_gasto_implementacion(gasto_id);

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

DROP TRIGGER IF EXISTS trigger_comprobantes_updated_at ON public.comprobantes;
CREATE TRIGGER trigger_comprobantes_updated_at
  BEFORE UPDATE ON public.comprobantes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_entidades_updated_at ON public.entidades;
CREATE TRIGGER trigger_entidades_updated_at
  BEFORE UPDATE ON public.entidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_programacion_formularios_updated_at ON public.programacion_formularios;
CREATE TRIGGER trigger_programacion_formularios_updated_at
  BEFORE UPDATE ON public.programacion_formularios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_experience_formularios_updated_at ON public.experience_formularios;
CREATE TRIGGER trigger_experience_formularios_updated_at
  BEFORE UPDATE ON public.experience_formularios
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
ALTER TABLE public.comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementacion_comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programacion_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programacion_comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_implementacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_gasto_implementacion ENABLE ROW LEVEL SECURITY;

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

-- View grants
GRANT SELECT ON comprobantes_full TO authenticated, anon;
GRANT SELECT ON gastos_full TO authenticated, anon;
GRANT SELECT ON implementacion_comprobantes_full TO authenticated, anon;
GRANT SELECT ON implementacion_gastos_full TO authenticated, anon;
GRANT SELECT ON programacion_comprobantes_full TO authenticated, anon;
GRANT SELECT ON programacion_gastos_full TO authenticated, anon;
GRANT SELECT ON experience_comprobantes_full TO authenticated, anon;
GRANT SELECT ON experience_gastos_full TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.hash_password(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.verify_password(TEXT, TEXT) TO authenticated, anon;

COMMIT;
