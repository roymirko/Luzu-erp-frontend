-- Migration: Add admin-specific fields to comprobantes + update estado_pago values
-- These fields allow Admin/Finanzas to add payment, tax, and retention info

-- 1. Drop old constraint first
ALTER TABLE comprobantes DROP CONSTRAINT IF EXISTS comprobantes_estado_pago_check;

-- 2. Migrate existing data to new states (BEFORE adding new constraint)
UPDATE comprobantes SET estado_pago = 'creado' WHERE estado_pago = 'pendiente';
UPDATE comprobantes SET estado_pago = 'requiere_info' WHERE estado_pago = 'pedir_info';
UPDATE comprobantes SET estado_pago = 'rechazado' WHERE estado_pago = 'anulado';

-- 3. Add new constraint
ALTER TABLE comprobantes ADD CONSTRAINT comprobantes_estado_pago_check
  CHECK (estado_pago IN ('creado', 'aprobado', 'requiere_info', 'rechazado', 'pagado'));

-- Condición IVA del proveedor (por comprobante)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS condicion_iva TEXT;

-- Tipo de comprobante de pago (recibo, orden de pago, etc)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS comprobante_pago TEXT;

-- Retención Ingresos Brutos (IIBB)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS ingresos_brutos DECIMAL(15,2) DEFAULT 0;

-- Retención Ganancias
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS retencion_ganancias DECIMAL(15,2) DEFAULT 0;

-- Fecha estimada de pago (planificación)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS fecha_estimada_pago DATE;

-- Nota interna de Admin/Finanzas
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS nota_admin TEXT;

-- Indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_comprobantes_fecha_estimada ON comprobantes(fecha_estimada_pago);
CREATE INDEX IF NOT EXISTS idx_comprobantes_condicion_iva ON comprobantes(condicion_iva);

-- Drop and recreate views (they depend on comprobantes)
DROP VIEW IF EXISTS comprobantes_full CASCADE;

CREATE VIEW comprobantes_full AS
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
  ic.sector,
  ic.rubro_gasto,
  ic.sub_rubro,
  ic.factura_emitida_a as impl_factura_emitida_a,
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
  ef.mes_gestion as exp_mes_gestion
FROM comprobantes c
LEFT JOIN implementacion_comprobantes ic ON c.id = ic.comprobante_id
LEFT JOIN ordenes_publicidad op ON ic.orden_publicidad_id = op.id
LEFT JOIN programacion_comprobantes pc ON c.id = pc.comprobante_id
LEFT JOIN programacion_formularios pf ON pc.formulario_id = pf.id
LEFT JOIN experience_comprobantes ec ON c.id = ec.comprobante_id
LEFT JOIN experience_formularios ef ON ec.formulario_id = ef.id;

-- Recreate gastos_full (dropped by CASCADE)
CREATE VIEW gastos_full AS
SELECT * FROM comprobantes_full WHERE tipo_movimiento = 'egreso';

-- Grant permissions
GRANT SELECT ON comprobantes_full TO authenticated;
GRANT SELECT ON comprobantes_full TO anon;
GRANT SELECT ON gastos_full TO authenticated;
GRANT SELECT ON gastos_full TO anon;
