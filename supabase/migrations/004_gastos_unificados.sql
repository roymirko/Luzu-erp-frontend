-- Migration: Arquitectura Unificada de Gastos (Polimórfica)
-- Todas las tablas de gastos se normalizan en una tabla central con tablas de contexto

-- 1. Tabla gastos normalizada (core) - fuente única de verdad
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Proveedor/Factura
  proveedor TEXT NOT NULL,
  razon_social TEXT,
  tipo_factura TEXT,
  numero_factura TEXT,
  fecha_factura DATE,
  -- Importes
  moneda TEXT DEFAULT 'ARS',
  neto DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva DECIMAL(5,2) DEFAULT 21,
  importe_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Concepto
  empresa TEXT,
  concepto_gasto TEXT,
  observaciones TEXT,
  -- Estado
  estado TEXT DEFAULT 'pendiente',
  estado_pago TEXT DEFAULT 'pendiente',
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- 2. Contexto Implementación (FK a gastos + orden)
CREATE TABLE implementacion_gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  orden_publicidad_id UUID REFERENCES ordenes_publicidad(id),
  item_orden_publicidad_id UUID REFERENCES items_orden_publicidad(id),
  -- Implementación-specific
  factura_emitida_a TEXT,
  sector TEXT,
  rubro_gasto TEXT,
  sub_rubro TEXT,
  condicion_pago TEXT,
  fecha_pago DATE,
  adjuntos JSONB,
  UNIQUE(gasto_id)
);

-- 3. Header Programación (agrupa múltiples gastos por formulario)
CREATE TABLE programacion_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Context fields
  mes_gestion VARCHAR(7),
  mes_venta VARCHAR(7),
  mes_inicio VARCHAR(7),
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  programa TEXT,
  ejecutivo TEXT,
  sub_rubro_empresa TEXT,
  detalle_campana TEXT,
  -- Estado
  estado TEXT DEFAULT 'pendiente',
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- 4. Contexto Programación (FK a gastos + header)
CREATE TABLE programacion_gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES programacion_formularios(id) ON DELETE CASCADE,
  -- Item-specific fields que pueden diferir del header
  categoria TEXT,
  acuerdo_pago TEXT,
  cliente TEXT,
  monto DECIMAL(15,2),
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,
  factura_emitida_a TEXT,
  UNIQUE(gasto_id)
);

-- 5. Vista unificada para reportes (todos los gastos del sistema)
CREATE OR REPLACE VIEW gastos_full AS
SELECT
  g.*,
  'implementacion' AS tipo_gasto,
  ig.orden_publicidad_id,
  ig.factura_emitida_a,
  ig.sector,
  ig.rubro_gasto,
  ig.sub_rubro,
  op.nombre_campana,
  op.unidad_negocio AS unidad_negocio_efectiva,
  op.categoria_negocio AS categoria_negocio_efectiva,
  NULL::VARCHAR(7) AS mes_gestion,
  NULL::TEXT AS programa,
  NULL::UUID AS formulario_programacion_id
FROM gastos g
JOIN implementacion_gastos ig ON g.id = ig.gasto_id
LEFT JOIN ordenes_publicidad op ON ig.orden_publicidad_id = op.id
UNION ALL
SELECT
  g.*,
  'programacion' AS tipo_gasto,
  NULL::UUID AS orden_publicidad_id,
  NULL::TEXT AS factura_emitida_a,
  NULL::TEXT AS sector,
  NULL::TEXT AS rubro_gasto,
  NULL::TEXT AS sub_rubro,
  pf.detalle_campana AS nombre_campana,
  pf.unidad_negocio AS unidad_negocio_efectiva,
  pf.categoria_negocio AS categoria_negocio_efectiva,
  pf.mes_gestion,
  pf.programa,
  pf.id AS formulario_programacion_id
FROM gastos g
JOIN programacion_gastos pg ON g.id = pg.gasto_id
JOIN programacion_formularios pf ON pg.formulario_id = pf.id;

-- 6. Vista para programación con todos los datos necesarios para UI
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
  pg.factura_emitida_a
FROM gastos g
JOIN programacion_gastos pg ON g.id = pg.gasto_id
JOIN programacion_formularios pf ON pg.formulario_id = pf.id;

-- Indexes para performance
CREATE INDEX idx_gastos_estado ON gastos(estado);
CREATE INDEX idx_gastos_estado_pago ON gastos(estado_pago);
CREATE INDEX idx_gastos_created ON gastos(created_at DESC);
CREATE INDEX idx_gastos_proveedor ON gastos(proveedor);

CREATE INDEX idx_impl_gastos_gasto ON implementacion_gastos(gasto_id);
CREATE INDEX idx_impl_gastos_orden ON implementacion_gastos(orden_publicidad_id);
CREATE INDEX idx_impl_gastos_item ON implementacion_gastos(item_orden_publicidad_id);

CREATE INDEX idx_prog_formularios_mes ON programacion_formularios(mes_gestion);
CREATE INDEX idx_prog_formularios_programa ON programacion_formularios(programa);
CREATE INDEX idx_prog_formularios_estado ON programacion_formularios(estado);

CREATE INDEX idx_prog_gastos_gasto ON programacion_gastos(gasto_id);
CREATE INDEX idx_prog_gastos_formulario ON programacion_gastos(formulario_id);

-- Migración de datos existentes de gastos_programacion a nueva estructura
-- (Solo ejecutar si hay datos en gastos_programacion)
DO $$
DECLARE
  row_record RECORD;
  new_gasto_id UUID;
  new_formulario_id UUID;
BEGIN
  FOR row_record IN SELECT * FROM gastos_programacion LOOP
    -- 1. Insertar en gastos (core)
    INSERT INTO gastos (
      id,
      proveedor,
      razon_social,
      numero_factura,
      moneda,
      neto,
      iva,
      importe_total,
      empresa,
      concepto_gasto,
      observaciones,
      estado,
      created_at,
      updated_at,
      created_by
    ) VALUES (
      gen_random_uuid(),
      COALESCE(row_record.proveedor, ''),
      row_record.razon_social,
      row_record.nro_factura,
      'ARS',
      COALESCE(row_record.neto, 0),
      COALESCE(row_record.iva, 21),
      COALESCE(row_record.neto, 0) * (1 + COALESCE(row_record.iva, 21) / 100),
      row_record.empresa,
      row_record.concepto_gasto,
      row_record.observaciones,
      COALESCE(row_record.estado, 'pendiente'),
      COALESCE(row_record.fecha_creacion, NOW()),
      COALESCE(row_record.fecha_actualizacion, NOW()),
      row_record.creado_por
    ) RETURNING id INTO new_gasto_id;

    -- 2. Insertar en programacion_formularios (header)
    INSERT INTO programacion_formularios (
      mes_gestion,
      mes_venta,
      mes_inicio,
      unidad_negocio,
      categoria_negocio,
      programa,
      ejecutivo,
      sub_rubro_empresa,
      estado,
      created_at,
      updated_at,
      created_by
    ) VALUES (
      row_record.mes_gestion,
      row_record.mes_venta,
      row_record.mes_inicio,
      row_record.unidad_negocio,
      row_record.categoria_negocio,
      row_record.programa,
      row_record.ejecutivo,
      row_record.sub_rubro_empresa,
      COALESCE(row_record.estado, 'pendiente'),
      COALESCE(row_record.fecha_creacion, NOW()),
      COALESCE(row_record.fecha_actualizacion, NOW()),
      row_record.creado_por
    ) RETURNING id INTO new_formulario_id;

    -- 3. Insertar en programacion_gastos (contexto)
    INSERT INTO programacion_gastos (
      gasto_id,
      formulario_id,
      categoria,
      acuerdo_pago,
      cliente,
      monto,
      valor_imponible,
      bonificacion
    ) VALUES (
      new_gasto_id,
      new_formulario_id,
      row_record.categoria,
      row_record.acuerdo_pago,
      row_record.cliente,
      row_record.monto,
      row_record.valor_imponible,
      COALESCE(row_record.bonificacion, 0)
    );
  END LOOP;
END $$;

-- Drop tabla antigua (después de verificar migración)
-- IMPORTANTE: Descomentar solo después de verificar que los datos migraron correctamente
-- DROP TABLE IF EXISTS gastos_programacion CASCADE;
