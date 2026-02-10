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
  metadata JSONB DEFAULT '{}'::jsonb,
  password_hash TEXT,
  user_type TEXT DEFAULT 'administrador' CHECK (user_type IN ('administrador', 'implementacion', 'programacion', 'administracion', 'finanzas'))
);
```

**User Types:**
- `administrador` - Admin, can manage users
- `implementacion` - Implementation area
- `programacion` - Programming area
- `administracion` - Administration area
- `finanzas` - Finance area

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
  -- Direccion del movimiento
  tipo_movimiento TEXT DEFAULT 'egreso' CHECK (tipo_movimiento IN ('ingreso', 'egreso')),
  -- Entidad (denormalizado para historico)
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
  estado_pago TEXT DEFAULT 'creado' CHECK (estado_pago IN ('creado', 'aprobado', 'requiere_info', 'rechazado', 'pagado')),
  -- Payment/Collection fields
  forma_pago TEXT,
  cotizacion DECIMAL(15,4),
  banco TEXT,
  numero_operacion TEXT,
  fecha_pago DATE,
  -- Admin fields
  condicion_iva TEXT,
  comprobante_pago TEXT,
  ingresos_brutos DECIMAL(15,2) DEFAULT 0,
  retencion_ganancias DECIMAL(15,2) DEFAULT 0,
  fecha_estimada_pago DATE,
  nota_admin TEXT,
  -- Ingreso-specific fields
  retencion_iva DECIMAL(15,2) DEFAULT 0,
  retencion_suss DECIMAL(15,2) DEFAULT 0,
  fecha_vencimiento DATE,
  fecha_ingreso_cheque DATE,
  certificacion_enviada_fecha DATE,
  portal TEXT,
  contacto TEXT,
  fecha_envio DATE,
  orden_publicidad_id_ingreso UUID REFERENCES ordenes_publicidad(id),
  -- Consolidated context fields
  factura_emitida_a TEXT,
  acuerdo_pago TEXT,
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
```

**Backward Compatibility**: Vista `gastos` filtra comprobantes tipo 'egreso'.

## Implementation Module (Implementacion)

### implementacion_comprobantes
Context table linking comprobantes to advertising orders.
```sql
CREATE TABLE implementacion_comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprobante_id UUID NOT NULL REFERENCES comprobantes(id) ON DELETE CASCADE,
  orden_publicidad_id UUID REFERENCES ordenes_publicidad(id),
  item_orden_publicidad_id UUID REFERENCES items_orden_publicidad(id),
  sector TEXT,
  rubro TEXT,
  sub_rubro TEXT,
  condicion_pago TEXT,
  adjuntos JSONB,
  UNIQUE(comprobante_id)
);
```

**Backward Compatibility**: Vista `implementacion_gastos` mapea a esta tabla.

## Tecnica Module

### tecnica_comprobantes
Context table linking comprobantes to advertising orders (standalone or OP-linked).
```sql
CREATE TABLE tecnica_comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprobante_id UUID NOT NULL REFERENCES comprobantes(id) ON DELETE CASCADE,
  orden_publicidad_id UUID REFERENCES ordenes_publicidad(id),
  item_orden_publicidad_id UUID REFERENCES items_orden_publicidad(id),
  sector TEXT,
  rubro TEXT,
  sub_rubro TEXT,
  condicion_pago TEXT,
  adjuntos JSONB,
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  nombre_campana TEXT,
  UNIQUE(comprobante_id)
);
```

**Backward Compatibility**: Vista `tecnica_gastos` mapea a esta tabla.

## Programming Module (Programacion)

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
  cliente TEXT,
  monto DECIMAL(15,2),
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,
  rubro TEXT,
  sub_rubro TEXT,
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
  empresa TEXT,
  empresa_programa TEXT,
  fecha_comprobante DATE,
  pais TEXT DEFAULT 'argentina',
  rubro TEXT,
  sub_rubro TEXT,
  UNIQUE(comprobante_id)
);
```

**Backward Compatibility**: Vista `experience_gastos` mapea a esta tabla.

## Legacy Tables

### gastos_implementacion
Legacy expense header (kept for backward compatibility).
```sql
CREATE TABLE gastos_implementacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_registro DATE NOT NULL,
  orden_publicidad TEXT NOT NULL,
  responsable TEXT NOT NULL,
  unidad_negocio TEXT NOT NULL,
  categoria_negocio TEXT,
  nombre_campana TEXT NOT NULL,
  anio INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  id_formulario_comercial UUID,
  estado TEXT DEFAULT 'pendiente',
  item_orden_publicidad_id UUID,
  acuerdo_pago TEXT,
  presupuesto DECIMAL(15,2),
  cantidad_programas INTEGER,
  programas_disponibles JSONB DEFAULT '[]'::jsonb,
  sector TEXT,
  rubro TEXT,
  sub_rubro TEXT,
  factura_emitida_a TEXT,
  empresa TEXT,
  concepto_gasto TEXT,
  observaciones TEXT,
  creado_por TEXT,
  actualizado_por TEXT
);
```

### items_gasto_implementacion
Legacy expense line items.
```sql
CREATE TABLE items_gasto_implementacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id UUID REFERENCES gastos_implementacion(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  tipo_proveedor TEXT NOT NULL,
  proveedor TEXT NOT NULL,
  razon_social TEXT,
  descripcion TEXT,
  rubro TEXT NOT NULL,
  sub_rubro TEXT,
  sector TEXT NOT NULL,
  moneda TEXT DEFAULT 'ARS',
  neto DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva DECIMAL(5,2) DEFAULT 21,
  importe_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  tipo_factura TEXT,
  numero_factura TEXT,
  fecha_factura DATE,
  condicion_pago TEXT,
  fecha_pago DATE,
  estado_pago TEXT DEFAULT 'pendiente',
  adjuntos JSONB
);
```

## Backward Compatibility Views

Legacy code can continue using old table names via these views:

| Legacy Name | New Table | Filter |
|-------------|-----------|--------|
| `proveedores` | `entidades` | `tipo_entidad IN ('proveedor', 'ambos')` |
| `gastos` | `comprobantes` | `tipo_movimiento = 'egreso'` |
| `implementacion_gastos` | `implementacion_comprobantes` | - |
| `tecnica_gastos` | `tecnica_comprobantes` | - |
| `programacion_gastos` | `programacion_comprobantes` | - |
| `experience_gastos` | `experience_comprobantes` | - |

Full views for UI:
- `implementacion_comprobantes_full` / `implementacion_gastos_full`
- `tecnica_comprobantes_full` / `tecnica_gastos_full`
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
- `creado` - Created (editable)
- `aprobado` - Approved by Admin/Finanzas (locked)
- `requiere_info` - Requires more info (editable)
- `rechazado` - Rejected (locked)
- `pagado` - Paid (only from aprobado, locked)

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
| FE | Factura E (Exportacion) |
| NCA | Nota de Credito A |
| NCB | Nota de Credito B |
| NCC | Nota de Credito C |
| NDA | Nota de Debito A |
| NDB | Nota de Debito B |
| NDC | Nota de Debito C |
| REC | Recibo |
| TKT | Ticket |
| OTR | Otro |

## Forma Pago Values

| Value | Description |
|-------|-------------|
| transferencia | Bank transfer |
| cheque | Check |
| efectivo | Cash |
| tarjeta | Card payment |
| otro | Other |

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
