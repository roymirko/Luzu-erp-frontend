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
Central table for ALL financial documents. Context columns are flattened directly on this table (no separate context tables). `area_origen` discriminates which context fields apply.
```sql
CREATE TABLE comprobantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_movimiento TEXT DEFAULT 'egreso' CHECK (tipo_movimiento IN ('ingreso', 'egreso')),
  -- Entidad
  entidad_id UUID REFERENCES entidades(id),
  entidad_nombre TEXT NOT NULL,
  entidad_cuit TEXT,
  -- Factura argentina
  tipo_comprobante TEXT CHECK (tipo_comprobante IN (
    'FA','FB','FC','FE','NCA','NCB','NCC','NDA','NDB','NDC','REC','TKT','OTR'
  )),
  punto_venta TEXT,
  numero_comprobante TEXT,
  fecha_comprobante DATE,
  cae TEXT,
  fecha_vencimiento_cae DATE,
  -- Montos
  moneda TEXT DEFAULT 'ARS',
  neto DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_alicuota DECIMAL(5,2) DEFAULT 21,
  iva_monto DECIMAL(15,2) DEFAULT 0,
  percepciones DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  empresa TEXT,
  concepto TEXT,
  observaciones TEXT,
  -- Estado
  estado TEXT DEFAULT 'pendiente',
  estado_pago TEXT DEFAULT 'creado' CHECK (estado_pago IN ('creado','aprobado','requiere_info','rechazado','pagado')),
  -- Payment
  forma_pago TEXT,
  cotizacion DECIMAL(15,4),
  banco TEXT,
  numero_operacion TEXT,
  fecha_pago DATE,
  -- Admin
  condicion_iva TEXT,
  comprobante_pago TEXT,
  ingresos_brutos DECIMAL(15,2) DEFAULT 0,
  retencion_ganancias DECIMAL(15,2) DEFAULT 0,
  fecha_estimada_pago DATE,
  nota_admin TEXT,
  -- Ingreso-specific
  retencion_iva DECIMAL(15,2) DEFAULT 0,
  retencion_suss DECIMAL(15,2) DEFAULT 0,
  fecha_vencimiento DATE,
  fecha_ingreso_cheque DATE,
  certificacion_enviada_fecha DATE,
  portal TEXT,
  contacto TEXT,
  fecha_envio DATE,
  orden_publicidad_id_ingreso UUID REFERENCES ordenes_publicidad(id),
  -- Consolidated egreso fields
  factura_emitida_a TEXT,
  acuerdo_pago TEXT,
  -- === FLATTENED CONTEXT COLUMNS (replaces 6 old context tables) ===
  area_origen TEXT CHECK (area_origen IN (
    'implementacion','tecnica','talentos','programacion','experience','productora','directo'
  )),
  contexto_comprobante_id UUID REFERENCES contexto_comprobante(id),
  orden_publicidad_id UUID REFERENCES ordenes_publicidad(id),
  item_orden_publicidad_id UUID REFERENCES items_orden_publicidad(id),
  sector TEXT,
  rubro_contexto TEXT,
  sub_rubro_contexto TEXT,
  condicion_pago TEXT,
  adjuntos JSONB,
  nombre_campana TEXT,
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  categoria TEXT,
  cliente TEXT,
  monto_prog DECIMAL(15,2),
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,
  empresa_programa TEXT,
  pais TEXT DEFAULT 'argentina',
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
```

**Area usage of context columns:**
- **impl/tec/talentos** (OP-linked): `orden_publicidad_id`, `item_orden_publicidad_id`, `sector`, `rubro_contexto`, `sub_rubro_contexto`, `condicion_pago`, `adjuntos`, `nombre_campana`, `unidad_negocio`, `categoria_negocio`
- **programacion**: `contexto_comprobante_id`, `categoria`, `cliente`, `monto_prog`, `valor_imponible`, `bonificacion`, `rubro_contexto`, `sub_rubro_contexto`
- **experience/productora**: `contexto_comprobante_id`, `empresa_programa`, `pais`
- **directo**: No context columns

### contexto_comprobante
Unified header for prog/exp/prod areas (replaces old `*_formularios` tables).
```sql
CREATE TABLE contexto_comprobante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_origen TEXT NOT NULL CHECK (area_origen IN ('programacion','experience','productora')),
  mes_gestion VARCHAR(7),
  detalle_campana TEXT,
  estado TEXT DEFAULT 'activo',
  nombre_campana TEXT,
  unidad_negocio TEXT,
  categoria_negocio TEXT,
  -- Programacion-specific
  mes_venta VARCHAR(7),
  mes_inicio VARCHAR(7),
  programa TEXT,
  ejecutivo TEXT,
  -- Productora-specific
  rubro TEXT,
  sub_rubro TEXT,
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
```

## Views

### comprobantes_full
Main view joining comprobantes with context + OP data. Only 4 LEFT JOINs.
```sql
CREATE OR REPLACE VIEW comprobantes_full AS
SELECT c.*,
  -- contexto_comprobante
  cc.mes_gestion AS ctx_mes_gestion,
  cc.detalle_campana AS ctx_detalle_campana,
  cc.programa AS ctx_programa,
  cc.ejecutivo AS ctx_ejecutivo,
  cc.mes_venta AS ctx_mes_venta,
  cc.mes_inicio AS ctx_mes_inicio,
  cc.nombre_campana AS ctx_nombre_campana,
  cc.unidad_negocio AS ctx_unidad_negocio,
  cc.categoria_negocio AS ctx_categoria_negocio,
  cc.rubro AS ctx_rubro,
  cc.sub_rubro AS ctx_sub_rubro,
  cc.estado AS ctx_estado,
  cc.created_at AS ctx_created_at,
  cc.created_by AS ctx_created_by,
  -- ordenes_publicidad (egresos)
  op.orden_publicidad AS op_numero_orden,
  op.responsable AS op_responsable,
  op.unidad_negocio AS op_unidad_negocio,
  op.categoria_negocio AS op_categoria_negocio,
  op.nombre_campana AS op_nombre_campana,
  op.razon_social AS op_razon_social,
  op.marca AS op_marca,
  op.mes_servicio AS op_mes_servicio,
  op.acuerdo_pago AS op_acuerdo_pago,
  -- ordenes_publicidad (ingresos)
  op_ing.id AS ingreso_op_id,
  op_ing.orden_publicidad AS ingreso_op_numero,
  ...
  -- entidades
  e.cuit AS entidad_cuit_efectivo,
  e.condicion_iva AS entidad_condicion_iva
FROM comprobantes c
LEFT JOIN contexto_comprobante cc ON c.contexto_comprobante_id = cc.id
LEFT JOIN ordenes_publicidad op ON c.orden_publicidad_id = op.id
LEFT JOIN ordenes_publicidad op_ing ON c.orden_publicidad_id_ingreso = op_ing.id
LEFT JOIN entidades e ON c.entidad_id = e.id;
```

### Backward compat views
- `gastos` — `SELECT * FROM comprobantes WHERE tipo_movimiento = 'egreso'`
- `proveedores` — `SELECT * FROM entidades WHERE tipo_entidad IN ('proveedor','ambos')`

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

### Adding a New Expense Area

No new tables needed. Just:
1. Add new value to `comprobantes.area_origen` CHECK constraint
2. If formulario-linked (like prog/exp/prod): add `area_origen` value to `contexto_comprobante` CHECK
3. Add nullable columns to `comprobantes` if area needs unique fields
4. Update `comprobantes_full` view if new columns need joining
5. In app: add new `AREA` const in a new context, use unified `gastosService`

### Architecture Summary
- **2 tables** for all gastos: `comprobantes` (data) + `contexto_comprobante` (headers for prog/exp/prod)
- **OP-linked areas** (impl/tec/talentos): single INSERT into `comprobantes` with `orden_publicidad_id`
- **Formulario-linked areas** (prog/exp/prod): INSERT into `contexto_comprobante` + INSERT into `comprobantes` with `contexto_comprobante_id`
- **Direct areas** (admin/finanzas): single INSERT into `comprobantes` with `area_origen = 'directo'`
- All areas share one view: `comprobantes_full` (4 LEFT JOINs)
