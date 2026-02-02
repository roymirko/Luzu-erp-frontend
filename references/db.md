# Database Schema Reference

This document describes the database schema for the Luzu ERP system. Use this as a reference when generating or updating database migrations.

## Important Conventions

- **User table**: `usuarios` (NOT `users`)
- **User ID type**: `TEXT` for `created_by` fields (stores UUID as string)
- **Timestamps**: Use `TIMESTAMPTZ DEFAULT NOW()`
- **UUIDs**: Use `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **RLS**: All tables must enable RLS and have an `allow_all` policy for development

## Core Tables

### usuarios
User accounts table.
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  creado_por TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### roles
User roles (Administrador, Editor, Visualizador).
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);
```

### areas
Business areas/departments.
```sql
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  creado_por TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### usuario_area_roles
Junction table linking users to areas with roles.
```sql
CREATE TABLE usuario_area_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by TEXT,
  UNIQUE(usuario_id, area_id, rol_id)
);
```

### registros_auditoria
Audit log for all actions.
```sql
CREATE TABLE registros_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  details TEXT,
  result TEXT NOT NULL CHECK (result IN ('success', 'error', 'warning')),
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT
);
```

## Commercial Module (Comercial)

### ordenes_publicidad
Advertising orders (header).
```sql
CREATE TABLE ordenes_publicidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TEXT,
  mes_servicio TEXT,
  responsable TEXT,
  orden_publicidad TEXT,
  total_venta TEXT,
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  proyecto TEXT,
  razon_social TEXT,
  categoria TEXT,
  empresa_agencia TEXT,
  marca TEXT,
  nombre_campana TEXT,
  acuerdo_pago TEXT,
  tipo_importe TEXT CHECK (tipo_importe IN ('canje', 'factura')),
  observaciones TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  creado_por TEXT
);
```

### items_orden_publicidad
Line items for advertising orders.
```sql
CREATE TABLE items_orden_publicidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_publicidad_id UUID NOT NULL REFERENCES ordenes_publicidad(id) ON DELETE CASCADE,
  programa TEXT,
  monto TEXT,
  nc_programa TEXT,
  nc_porcentaje TEXT,
  proveedor_fee TEXT,
  fee_programa TEXT,
  fee_porcentaje TEXT,
  implementacion TEXT,
  talentos TEXT,
  tecnica TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);
```

## Entidades (Proveedores + Clientes)

### entidades
Unified table for suppliers and clients.
```sql
CREATE TABLE entidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  cuit TEXT NOT NULL UNIQUE,
  tipo_entidad TEXT DEFAULT 'proveedor' CHECK (tipo_entidad IN ('proveedor', 'cliente', 'ambos')),
  condicion_iva TEXT DEFAULT 'responsable_inscripto' CHECK (condicion_iva IN (
    'responsable_inscripto', 'monotributista', 'exento', 'consumidor_final', 'no_responsable'
  )),
  direccion TEXT,
  localidad TEXT,
  provincia TEXT,
  email TEXT,
  telefono TEXT,
  empresa TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
```

**Backward Compatibility**: Vista `proveedores` filtra entidades tipo 'proveedor' o 'ambos'.

## Comprobantes (Ingresos + Egresos)

### comprobantes
Central table for all financial documents (invoices, receipts, etc.).
```sql
CREATE TABLE comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dirección del movimiento
  tipo_movimiento TEXT DEFAULT 'egreso' CHECK (tipo_movimiento IN ('ingreso', 'egreso')),
  -- Entidad (denormalizado para histórico)
  entidad_id UUID REFERENCES entidades(id),
  entidad_nombre TEXT NOT NULL,
  entidad_cuit TEXT,
  -- Factura argentina
  tipo_comprobante TEXT CHECK (tipo_comprobante IN (
    'FA', 'FB', 'FC', 'FE', 'NCA', 'NCB', 'NCC', 'NDA', 'NDB', 'NDC', 'REC', 'TKT', 'OTR'
  )),
  punto_venta TEXT,
  numero_comprobante TEXT,
  fecha_comprobante DATE,
  -- AFIP manual
  cae TEXT,
  fecha_vencimiento_cae DATE,
  -- Montos
  moneda TEXT DEFAULT 'ARS',
  neto DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_alicuota DECIMAL(5,2) DEFAULT 21,
  iva_monto DECIMAL(15,2) DEFAULT 0,
  percepciones DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Concepto
  empresa TEXT,
  concepto TEXT,
  observaciones TEXT,
  -- Estado
  estado TEXT DEFAULT 'pendiente',
  estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'anulado')),
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
```

**Backward Compatibility**: Vista `gastos` filtra comprobantes tipo 'egreso'.

## Implementation Module (Implementación)

### implementacion_comprobantes
Context table linking comprobantes to advertising orders.
```sql
CREATE TABLE implementacion_comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprobante_id UUID NOT NULL REFERENCES comprobantes(id) ON DELETE CASCADE,
  orden_publicidad_id UUID REFERENCES ordenes_publicidad(id),
  item_orden_publicidad_id UUID REFERENCES items_orden_publicidad(id),
  factura_emitida_a TEXT,
  sector TEXT,
  rubro_gasto TEXT,
  sub_rubro TEXT,
  condicion_pago TEXT,
  forma_pago TEXT,
  fecha_pago DATE,
  adjuntos JSONB,
  UNIQUE(comprobante_id)
);
```

**Backward Compatibility**: Vista `implementacion_gastos` mapea a esta tabla.

## Programming Module (Programación)

### programacion_formularios
Header table grouping programming expenses.
```sql
CREATE TABLE programacion_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_gestion VARCHAR(7),
  mes_venta VARCHAR(7),
  mes_inicio VARCHAR(7),
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  programa TEXT,
  ejecutivo TEXT,
  sub_rubro_empresa TEXT,
  detalle_campana TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
```

### programacion_comprobantes
Context table linking comprobantes to programming formularios.
```sql
CREATE TABLE programacion_comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprobante_id UUID NOT NULL REFERENCES comprobantes(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES programacion_formularios(id) ON DELETE CASCADE,
  categoria TEXT,
  acuerdo_pago TEXT,
  cliente TEXT,
  monto DECIMAL(15,2),
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,
  factura_emitida_a TEXT,
  forma_pago TEXT,
  UNIQUE(comprobante_id)
);
```

**Backward Compatibility**: Vista `programacion_gastos` mapea a esta tabla.

## Experience Module

### experience_formularios
Header table grouping Experience expenses.
```sql
CREATE TABLE experience_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_gestion VARCHAR(7),
  nombre_campana TEXT,
  detalle_campana TEXT,
  subrubro TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
```

### experience_comprobantes
Context table linking comprobantes to Experience formularios.
```sql
CREATE TABLE experience_comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprobante_id UUID NOT NULL REFERENCES comprobantes(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES experience_formularios(id) ON DELETE CASCADE,
  factura_emitida_a TEXT,
  empresa TEXT,
  empresa_programa TEXT,
  fecha_comprobante DATE,
  acuerdo_pago TEXT,
  forma_pago TEXT,
  pais TEXT DEFAULT 'argentina',
  UNIQUE(comprobante_id)
);
```

**Backward Compatibility**: Vista `experience_gastos` mapea a esta tabla.

## Backward Compatibility Views

Legacy code can continue using old table names via these views:

| Legacy Name | New Table | Filter |
|-------------|-----------|--------|
| `proveedores` | `entidades` | `tipo_entidad IN ('proveedor', 'ambos')` |
| `gastos` | `comprobantes` | `tipo_movimiento = 'egreso'` |
| `implementacion_gastos` | `implementacion_comprobantes` | - |
| `programacion_gastos` | `programacion_comprobantes` | - |
| `experience_gastos` | `experience_comprobantes` | - |

Full views for UI:
- `implementacion_comprobantes_full` / `implementacion_gastos_full`
- `programacion_comprobantes_full` / `programacion_gastos_full`
- `experience_comprobantes_full` / `experience_gastos_full`
- `comprobantes_full` / `gastos_full`

## Estado Values

### Comprobante/Gasto Estado
- `pendiente` - Pending approval
- `activo` - Active/approved
- `cerrado` - Closed
- `anulado` - Cancelled

### Estado Pago
- `pendiente` - Payment pending
- `pagado` - Paid
- `anulado` - Cancelled

### Formulario Estado
- `activo` / `abierto` - Open for editing
- `cerrado` - Closed (locked)
- `anulado` - Cancelled (locked)

## Tipo Comprobante Codes

| Code | Description |
|------|-------------|
| FA | Factura A |
| FB | Factura B |
| FC | Factura C |
| FE | Factura E (Exportación) |
| NCA | Nota de Crédito A |
| NCB | Nota de Crédito B |
| NCC | Nota de Crédito C |
| NDA | Nota de Débito A |
| NDB | Nota de Débito B |
| NDC | Nota de Débito C |
| REC | Recibo |
| TKT | Ticket |
| OTR | Otro |

## Standard Patterns

### Creating a New Expense Module

When creating a new expense module, follow this pattern:

1. **Header table** (if grouping comprobantes):
```sql
CREATE TABLE {module}_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Module-specific header fields
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT  -- Use TEXT, not UUID REFERENCES
);
```

2. **Context table** (links comprobantes to headers):
```sql
CREATE TABLE {module}_comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprobante_id UUID NOT NULL REFERENCES comprobantes(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES {module}_formularios(id) ON DELETE CASCADE,
  -- Module-specific context fields
  UNIQUE(comprobante_id)
);
```

3. **Full view** (for UI queries):
```sql
CREATE OR REPLACE VIEW {module}_comprobantes_full AS
SELECT
  c.*,
  f.id AS formulario_id,
  -- Header fields
  ctx.id AS {module}_comprobante_id
  -- Context fields
FROM comprobantes c
JOIN {module}_comprobantes ctx ON c.id = ctx.comprobante_id
JOIN {module}_formularios f ON ctx.formulario_id = f.id;
```

4. **Enable RLS**:
```sql
ALTER TABLE {module}_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE {module}_comprobantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON {module}_formularios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON {module}_comprobantes FOR ALL USING (true) WITH CHECK (true);
```

5. **Indexes**:
```sql
CREATE INDEX idx_{module}_formularios_estado ON {module}_formularios(estado);
CREATE INDEX idx_{module}_formularios_created ON {module}_formularios(created_at DESC);
CREATE INDEX idx_{module}_comprobantes_formulario ON {module}_comprobantes(formulario_id);
CREATE INDEX idx_{module}_comprobantes_comprobante ON {module}_comprobantes(comprobante_id);
```
