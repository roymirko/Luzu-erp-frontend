-- ============================================
-- Experience Module Tables
-- ============================================

-- Tabla experience_formularios (header que agrupa gastos)
CREATE TABLE IF NOT EXISTS experience_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_gestion VARCHAR(7),
  nombre_campana TEXT,
  detalle_campana TEXT,
  subrubro TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Tabla experience_gastos (contexto - relaciona gastos con formularios)
CREATE TABLE IF NOT EXISTS experience_gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES experience_formularios(id) ON DELETE CASCADE,
  factura_emitida_a TEXT,
  empresa TEXT,
  empresa_programa TEXT,
  fecha_comprobante DATE,
  acuerdo_pago TEXT,
  forma_pago TEXT,
  pais TEXT DEFAULT 'argentina',
  UNIQUE(gasto_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experience_formularios_estado ON experience_formularios(estado);
CREATE INDEX IF NOT EXISTS idx_experience_formularios_created ON experience_formularios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experience_gastos_formulario ON experience_gastos(formulario_id);
CREATE INDEX IF NOT EXISTS idx_experience_gastos_gasto ON experience_gastos(gasto_id);

-- Vista experience_gastos_full (combina gastos + formularios + contexto)
CREATE OR REPLACE VIEW experience_gastos_full AS
SELECT
  -- Gasto fields
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
  g.empresa AS gasto_empresa,
  g.concepto_gasto,
  g.observaciones,
  g.estado,
  g.estado_pago,
  g.created_at,
  g.updated_at,
  g.created_by,
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
  eg.id AS experience_gasto_id,
  eg.factura_emitida_a,
  eg.empresa,
  eg.empresa_programa,
  eg.fecha_comprobante,
  eg.acuerdo_pago,
  eg.forma_pago,
  eg.pais
FROM gastos g
JOIN experience_gastos eg ON g.id = eg.gasto_id
JOIN experience_formularios ef ON eg.formulario_id = ef.id;

-- Trigger para updated_at en experience_formularios
CREATE OR REPLACE FUNCTION update_experience_formularios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_experience_formularios_updated_at ON experience_formularios;
CREATE TRIGGER trigger_experience_formularios_updated_at
  BEFORE UPDATE ON experience_formularios
  FOR EACH ROW
  EXECUTE FUNCTION update_experience_formularios_updated_at();

-- Enable RLS
ALTER TABLE experience_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_gastos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create permissive policies for dev
DROP POLICY IF EXISTS "allow_all" ON experience_formularios;
DROP POLICY IF EXISTS "allow_all" ON experience_gastos;
CREATE POLICY "allow_all" ON experience_formularios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON experience_gastos FOR ALL USING (true) WITH CHECK (true);
