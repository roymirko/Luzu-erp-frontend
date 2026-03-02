-- Add pago fields to ordenes_publicidad
-- These fields allow capturing payment and invoice info at the order level
-- to propagate to dependent modules (Técnica, Implementación, Talentos)

BEGIN;

ALTER TABLE public.ordenes_publicidad
ADD COLUMN IF NOT EXISTS forma_pago TEXT,
ADD COLUMN IF NOT EXISTS numero_comprobante TEXT,
ADD COLUMN IF NOT EXISTS fecha_comprobante TEXT,
ADD COLUMN IF NOT EXISTS factura_emitida_a TEXT,
ADD COLUMN IF NOT EXISTS empresa TEXT;

COMMIT;
