-- Migration: Vista para Implementacion Gastos
-- View que combina gastos + implementacion_gastos + datos de orden

CREATE OR REPLACE VIEW implementacion_gastos_full AS
SELECT
  g.id,
  g.proveedor,
  g.razon_social,
  g.tipo_factura,
  g.numero_factura,
  g.fecha_factura,
  g.moneda,
  g.neto,
  g.iva,
  g.importe_total,
  g.empresa,
  g.concepto_gasto,
  g.observaciones,
  g.estado,
  g.estado_pago,
  g.created_at,
  g.updated_at,
  g.created_by,
  -- Contexto implementacion
  ig.id AS implementacion_gasto_id,
  ig.orden_publicidad_id,
  ig.item_orden_publicidad_id,
  ig.factura_emitida_a,
  ig.sector,
  ig.rubro_gasto,
  ig.sub_rubro,
  ig.condicion_pago,
  ig.fecha_pago,
  ig.adjuntos,
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
FROM gastos g
JOIN implementacion_gastos ig ON g.id = ig.gasto_id
LEFT JOIN ordenes_publicidad op ON ig.orden_publicidad_id = op.id;

-- Index para performance en queries por orden
CREATE INDEX IF NOT EXISTS idx_impl_gastos_full_orden ON implementacion_gastos(orden_publicidad_id);
