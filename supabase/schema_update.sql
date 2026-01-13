-- Tablas para el módulo de Implementación (Gastos)
 
-- 1. Tabla principal de Gastos de Implementación
CREATE TABLE implementation_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Campos principales
  fecha_registro DATE NOT NULL, -- fecha
  orden_publicidad TEXT NOT NULL, -- ordenPublicidad
  responsable TEXT NOT NULL, -- responsable
  unidad_negocio TEXT NOT NULL, -- unidadNegocio
  categoria_negocio TEXT, -- categoriaNegocio
  nombre_campana TEXT NOT NULL, -- nombreCampana
  anio INTEGER NOT NULL, -- anio (año)
  mes INTEGER NOT NULL, -- mes
  id_formulario_comercial UUID, -- Para vincular con la tabla comercial (opcional)
 
  -- Estado
  estado TEXT NOT NULL DEFAULT 'pendiente', -- estadoOP
  -- Metadata
  created_by UUID, -- ID del usuario que creó el registro
  updated_by UUID
);
 
-- 2. Tabla de Items/Importes (Relación 1:N)
CREATE TABLE implementation_expense_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES implementation_expenses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Detalles del item
  tipo_proveedor TEXT NOT NULL, -- tipoProveedor
  proveedor TEXT NOT NULL, -- proveedor
  razon_social TEXT, -- razonSocial (opcional)
  descripcion TEXT, -- descripcion
  -- Clasificación
  rubro_gasto TEXT NOT NULL, -- rubroGasto
  sub_rubro TEXT, -- subRubro
  sector TEXT NOT NULL, -- sector
  -- Valores Financieros
  moneda TEXT NOT NULL DEFAULT 'ARS', -- moneda
  neto DECIMAL(15,2) NOT NULL DEFAULT 0, -- neto
  iva DECIMAL(5,2) DEFAULT 21, -- iva (porcentaje)
  importe_total DECIMAL(15,2) NOT NULL DEFAULT 0, -- importeTotal
  -- Detalles de Facturación
  tipo_factura TEXT, -- tipoFactura
  numero_factura TEXT, -- numeroFactura
  fecha_factura DATE, -- fechaFactura
  condicion_pago TEXT, -- condicionPago
  fecha_pago DATE, -- fechaPago
  -- Estado del Item
  estado_pago TEXT NOT NULL DEFAULT 'pendiente', -- estadoPgm
  -- Archivos adjuntos
  adjuntos JSONB -- Array de URLs o paths a los archivos adjuntos
);
 
-- Habilitar RLS
ALTER TABLE implementation_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_expense_items ENABLE ROW LEVEL SECURITY;
 
-- Política de lectura (todos los autenticados pueden ver)
CREATE POLICY "Enable read access for authenticated users" ON implementation_expenses
    FOR SELECT USING (auth.role() = 'authenticated');
 
CREATE POLICY "Enable read access for authenticated users" ON implementation_expense_items
    FOR SELECT USING (auth.role() = 'authenticated');
 
-- Política de inserción (solo autenticados)
CREATE POLICY "Enable insert for authenticated users" ON implementation_expenses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
 
CREATE POLICY "Enable insert for authenticated users" ON implementation_expense_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
 
-- Política de actualización (solo autenticados)
CREATE POLICY "Enable update for authenticated users" ON implementation_expenses
    FOR UPDATE USING (auth.role() = 'authenticated');
 
CREATE POLICY "Enable update for authenticated users" ON implementation_expense_items
    FOR UPDATE USING (auth.role() = 'authenticated');