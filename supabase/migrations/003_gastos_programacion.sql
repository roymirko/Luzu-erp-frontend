-- Create gastos_programacion table
CREATE TABLE IF NOT EXISTS gastos_programacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cargar Datos
  mes_gestion VARCHAR(7),
  mes_venta VARCHAR(7),
  mes_inicio VARCHAR(7),
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  programa TEXT,
  ejecutivo TEXT,
  proveedor TEXT,
  razon_social TEXT,
  categoria TEXT,
  monto DECIMAL(15,2),
  sub_rubro_empresa TEXT,

  -- Carga de Importe
  acuerdo_pago TEXT,
  cliente TEXT,
  empresa TEXT,
  neto DECIMAL(15,2),
  iva DECIMAL(5,2) DEFAULT 21,
  concepto_gasto TEXT,
  nro_factura TEXT,
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,
  observaciones TEXT,

  -- Estado/Meta
  estado TEXT DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creado_por TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_gastos_programacion_mes ON gastos_programacion(mes_gestion);
CREATE INDEX IF NOT EXISTS idx_gastos_programacion_programa ON gastos_programacion(programa);
CREATE INDEX IF NOT EXISTS idx_gastos_programacion_estado ON gastos_programacion(estado);
CREATE INDEX IF NOT EXISTS idx_gastos_programacion_fecha ON gastos_programacion(fecha_creacion DESC);
