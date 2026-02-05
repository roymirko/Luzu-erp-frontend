-- Migration: Add admin-specific fields for ingresos (cobros)
-- Additional retention fields, dates, and optional OP linking for income tracking

-- Retenciones adicionales para ingresos
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS retencion_iva DECIMAL(15,2) DEFAULT 0;
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS retencion_suss DECIMAL(15,2) DEFAULT 0;

-- Fechas de cobro
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS fecha_ingreso_cheque DATE;

-- Certificación y envío
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS certificacion_enviada_fecha DATE;
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS portal TEXT;
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS contacto TEXT;
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS fecha_envio DATE;

-- Vinculación OP para ingresos (opcional, múltiples ingresos por OP)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS orden_publicidad_id_ingreso UUID REFERENCES ordenes_publicidad(id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comprobantes_op_ingreso ON comprobantes(orden_publicidad_id_ingreso);
CREATE INDEX IF NOT EXISTS idx_comprobantes_fecha_vencimiento ON comprobantes(fecha_vencimiento);

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
  ic.item_orden_publicidad_id,
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
  ef.mes_gestion as exp_mes_gestion,
  -- OP vinculada para ingresos (datos de la OP)
  opi.id as ingreso_op_id,
  opi.orden_publicidad as ingreso_op_numero,
  opi.responsable as ingreso_op_responsable,
  opi.unidad_negocio as ingreso_op_unidad_negocio,
  opi.nombre_campana as ingreso_op_nombre_campana,
  opi.marca as ingreso_op_marca,
  opi.razon_social as ingreso_op_razon_social,
  opi.total_venta as ingreso_op_importe,
  opi.acuerdo_pago as ingreso_op_acuerdo_pago,
  opi.mes_servicio as ingreso_op_mes_servicio
FROM comprobantes c
LEFT JOIN implementacion_comprobantes ic ON c.id = ic.comprobante_id
LEFT JOIN ordenes_publicidad op ON ic.orden_publicidad_id = op.id
LEFT JOIN programacion_comprobantes pc ON c.id = pc.comprobante_id
LEFT JOIN programacion_formularios pf ON pc.formulario_id = pf.id
LEFT JOIN experience_comprobantes ec ON c.id = ec.comprobante_id
LEFT JOIN experience_formularios ef ON ec.formulario_id = ef.id
LEFT JOIN ordenes_publicidad opi ON c.orden_publicidad_id_ingreso = opi.id;

-- Recreate gastos_full (dropped by CASCADE)
CREATE VIEW gastos_full AS
SELECT * FROM comprobantes_full WHERE tipo_movimiento = 'egreso';

-- Grant permissions
GRANT SELECT ON comprobantes_full TO authenticated;
GRANT SELECT ON comprobantes_full TO anon;
GRANT SELECT ON gastos_full TO authenticated;
GRANT SELECT ON gastos_full TO anon;
