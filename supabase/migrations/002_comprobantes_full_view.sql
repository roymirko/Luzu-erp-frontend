-- Migration: Add 'pedir_info' to estado_pago + Create comprobantes_full view
-- =====================================================================

-- 1. Update estado_pago constraint to include 'pedir_info'
ALTER TABLE comprobantes DROP CONSTRAINT IF EXISTS comprobantes_estado_pago_check;
ALTER TABLE comprobantes ADD CONSTRAINT comprobantes_estado_pago_check
  CHECK (estado_pago IN ('pendiente', 'pagado', 'pedir_info', 'anulado'));

-- 2. Drop existing view and dependents (column names changed)
DROP VIEW IF EXISTS comprobantes_full CASCADE;

-- 3. Create comprobantes_full view with context from all modules
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

-- 4. Recreate gastos_full (dropped by CASCADE)
CREATE VIEW gastos_full AS
SELECT * FROM comprobantes_full WHERE tipo_movimiento = 'egreso';

-- 5. Grant permissions (for dev allow_all)
GRANT SELECT ON comprobantes_full TO authenticated;
GRANT SELECT ON comprobantes_full TO anon;
GRANT SELECT ON gastos_full TO authenticated;
GRANT SELECT ON gastos_full TO anon;
