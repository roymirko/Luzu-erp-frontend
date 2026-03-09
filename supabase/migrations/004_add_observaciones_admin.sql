-- Add observaciones_admin column to ordenes_publicidad
-- Used for rejection motivo and "solicitar información" comments from Admin/Finanzas
ALTER TABLE ordenes_publicidad ADD COLUMN observaciones_admin TEXT;
