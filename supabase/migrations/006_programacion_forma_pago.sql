-- Add forma_pago column to programacion_gastos table
ALTER TABLE programacion_gastos ADD COLUMN IF NOT EXISTS forma_pago TEXT;

-- Recreate the view to include the new column
CREATE OR REPLACE VIEW programacion_gastos_full AS
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
  pg.id AS programacion_gasto_id,
  pg.categoria,
  pg.acuerdo_pago,
  pg.cliente,
  pg.monto,
  pg.valor_imponible,
  pg.bonificacion,
  pg.factura_emitida_a,
  pg.forma_pago
FROM gastos g
JOIN programacion_gastos pg ON g.id = pg.gasto_id
JOIN programacion_formularios pf ON pg.formulario_id = pf.id;
