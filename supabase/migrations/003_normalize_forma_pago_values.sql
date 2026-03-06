-- Migration 003: Normalize forma_pago, factura_emitida_a, and empresa values
-- Ensures dropdown field consistency across Implementación, Técnica, and Talentos modules

-- Normalize forma_pago in comprobantes table
UPDATE comprobantes 
SET forma_pago = 'Transferencia (Adelantado)' 
WHERE forma_pago = 'transferencia';

UPDATE comprobantes 
SET forma_pago = 'Efectivo (Contado)' 
WHERE forma_pago = 'efectivo';

UPDATE comprobantes 
SET forma_pago = 'e check' 
WHERE forma_pago = 'cheque';

-- Normalize factura_emitida_a and empresa in comprobantes table
UPDATE comprobantes 
SET factura_emitida_a = 'LUZU TV S. A.' 
WHERE factura_emitida_a IN ('Luzu TV', 'Luzu TV SA');

UPDATE comprobantes 
SET empresa = 'LUZU TV S. A.' 
WHERE empresa IN ('Luzu TV', 'Luzu TV SA');

-- Normalize forma_pago in ordenes_publicidad table
UPDATE ordenes_publicidad 
SET forma_pago = 'Transferencia (Adelantado)' 
WHERE forma_pago = 'transferencia';

UPDATE ordenes_publicidad 
SET forma_pago = 'Efectivo (Contado)' 
WHERE forma_pago = 'efectivo';

UPDATE ordenes_publicidad 
SET forma_pago = 'e check' 
WHERE forma_pago = 'cheque';

-- Normalize empresa in ordenes_publicidad table
UPDATE ordenes_publicidad 
SET empresa = 'LUZU TV S. A.' 
WHERE empresa IN ('Luzu TV', 'Luzu TV SA');
