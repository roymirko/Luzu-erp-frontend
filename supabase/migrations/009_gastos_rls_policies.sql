-- Migration: Add RLS policies to gastos and related tables
-- Fixes PGRST116 error when inserting gastos

-- Enable RLS on gastos table (core table)
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- Enable RLS on implementacion_gastos
ALTER TABLE implementacion_gastos ENABLE ROW LEVEL SECURITY;

-- Enable RLS on programacion_formularios
ALTER TABLE programacion_formularios ENABLE ROW LEVEL SECURITY;

-- Enable RLS on programacion_gastos
ALTER TABLE programacion_gastos ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for dev environment
-- (In production, you would want more restrictive policies)

-- Gastos (core table)
DROP POLICY IF EXISTS "allow_all" ON gastos;
CREATE POLICY "allow_all" ON gastos FOR ALL USING (true) WITH CHECK (true);

-- Implementacion gastos
DROP POLICY IF EXISTS "allow_all" ON implementacion_gastos;
CREATE POLICY "allow_all" ON implementacion_gastos FOR ALL USING (true) WITH CHECK (true);

-- Programacion formularios
DROP POLICY IF EXISTS "allow_all" ON programacion_formularios;
CREATE POLICY "allow_all" ON programacion_formularios FOR ALL USING (true) WITH CHECK (true);

-- Programacion gastos
DROP POLICY IF EXISTS "allow_all" ON programacion_gastos;
CREATE POLICY "allow_all" ON programacion_gastos FOR ALL USING (true) WITH CHECK (true);
