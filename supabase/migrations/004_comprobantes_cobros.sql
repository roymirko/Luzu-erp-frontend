-- Migration: Add payment/collection fields to comprobantes
-- These fields support both egresos (payments) and ingresos (collections)

-- Payment method (transferencia, cheque, efectivo, tarjeta, etc.)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS forma_pago TEXT;

-- Exchange rate for foreign currency
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS cotizacion DECIMAL(15,4);

-- Bank name for transfers/deposits
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS banco TEXT;

-- Transaction/operation number
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS numero_operacion TEXT;

-- Effective payment/collection date (may differ from invoice date)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS fecha_pago DATE;

-- Index for faster queries on payment status and type
CREATE INDEX IF NOT EXISTS idx_comprobantes_forma_pago ON comprobantes(forma_pago);
CREATE INDEX IF NOT EXISTS idx_comprobantes_fecha_pago ON comprobantes(fecha_pago);
