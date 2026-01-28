# Database Schema Reference

This document describes the database schema for the Luzu ERP system. Use this as a reference when generating or updating database migrations.

## Important Conventions

- **User table**: `usuarios` (NOT `users`)
- **User ID type**: `TEXT` for `created_by` fields (stores UUID as string)
- **Timestamps**: Use `TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
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
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
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
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
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
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by TEXT,
  UNIQUE(usuario_id, area_id, rol_id)
);
```

### proveedores
Suppliers/providers.
```sql
CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT NOT NULL,
  cuit TEXT NOT NULL UNIQUE,
  direccion TEXT,
  empresa TEXT,
  activo BOOLEAN DEFAULT TRUE NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creado_por TEXT
);
```

### registros_auditoria
Audit log for all actions.
```sql
CREATE TABLE registros_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Unified Gastos Architecture

The system uses a polymorphic/normalized architecture for expenses (gastos):

1. **gastos** - Core table with common expense fields
2. **Context tables** - Module-specific fields linking to gastos
3. **Header tables** - For grouping multiple gastos (formularios)
4. **Full views** - Combined data for UI queries

### gastos (Core)
Central table for all expenses across modules.
```sql
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Proveedor/Factura
  proveedor TEXT NOT NULL,
  razon_social TEXT,
  tipo_factura TEXT,
  numero_factura TEXT,
  fecha_factura DATE,
  -- Importes
  moneda TEXT DEFAULT 'ARS',
  neto DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva DECIMAL(5,2) DEFAULT 21,
  importe_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Concepto
  empresa TEXT,
  concepto_gasto TEXT,
  observaciones TEXT,
  -- Estado
  estado TEXT DEFAULT 'pendiente',
  estado_pago TEXT DEFAULT 'pendiente',
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);
```

## Implementation Module (Implementación)

### implementacion_gastos
Context table linking gastos to advertising orders.
```sql
CREATE TABLE implementacion_gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
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
  UNIQUE(gasto_id)
);
```

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);
```

### programacion_gastos
Context table linking gastos to programming formularios.
```sql
CREATE TABLE programacion_gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES programacion_formularios(id) ON DELETE CASCADE,
  categoria TEXT,
  acuerdo_pago TEXT,
  cliente TEXT,
  monto DECIMAL(15,2),
  valor_imponible DECIMAL(15,2),
  bonificacion DECIMAL(15,2) DEFAULT 0,
  factura_emitida_a TEXT,
  forma_pago TEXT,
  UNIQUE(gasto_id)
);
```

### programacion_gastos_full (View)
Combined view for UI queries.
```sql
CREATE OR REPLACE VIEW programacion_gastos_full AS
SELECT
  g.*,
  pf.id AS formulario_id,
  pf.mes_gestion, pf.mes_venta, pf.mes_inicio,
  pf.unidad_negocio, pf.categoria_negocio, pf.programa,
  pf.ejecutivo, pf.sub_rubro_empresa, pf.detalle_campana,
  pf.estado AS formulario_estado,
  pf.created_at AS formulario_created_at,
  pg.id AS programacion_gasto_id,
  pg.categoria, pg.acuerdo_pago, pg.cliente,
  pg.monto, pg.valor_imponible, pg.bonificacion,
  pg.factura_emitida_a, pg.forma_pago
FROM gastos g
JOIN programacion_gastos pg ON g.id = pg.gasto_id
JOIN programacion_formularios pf ON pg.formulario_id = pf.id;
```

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);
```

### experience_gastos
Context table linking gastos to Experience formularios.
```sql
CREATE TABLE experience_gastos (
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
```

### experience_gastos_full (View)
Combined view for UI queries.
```sql
CREATE OR REPLACE VIEW experience_gastos_full AS
SELECT
  g.id, g.proveedor, g.razon_social, g.tipo_factura,
  g.numero_factura, g.fecha_factura, g.moneda,
  g.neto, g.iva, g.importe_total,
  g.empresa AS gasto_empresa, g.concepto_gasto, g.observaciones,
  g.estado, g.estado_pago, g.created_at, g.updated_at, g.created_by,
  ef.id AS formulario_id,
  ef.mes_gestion, ef.nombre_campana, ef.detalle_campana, ef.subrubro,
  ef.estado AS formulario_estado,
  ef.created_at AS formulario_created_at,
  ef.created_by AS formulario_created_by,
  eg.id AS experience_gasto_id,
  eg.factura_emitida_a, eg.empresa, eg.empresa_programa,
  eg.fecha_comprobante, eg.acuerdo_pago, eg.forma_pago, eg.pais
FROM gastos g
JOIN experience_gastos eg ON g.id = eg.gasto_id
JOIN experience_formularios ef ON eg.formulario_id = ef.id;
```

## Legacy Tables (For Reference)

### gastos_implementacion (Legacy)
Old implementation header table - being phased out.

### items_gasto_implementacion (Legacy)
Old implementation items table - being phased out.

### gastos_programacion (Legacy)
Old programming gastos table - data migrated to new structure.

## Standard Patterns

### Creating a New Module

When creating a new expense module, follow this pattern:

1. **Header table** (if grouping gastos):
```sql
CREATE TABLE {module}_formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Module-specific header fields
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT  -- Use TEXT, not UUID REFERENCES
);
```

2. **Context table** (links gastos to headers):
```sql
CREATE TABLE {module}_gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  formulario_id UUID NOT NULL REFERENCES {module}_formularios(id) ON DELETE CASCADE,
  -- Module-specific context fields
  UNIQUE(gasto_id)
);
```

3. **Full view** (for UI queries):
```sql
CREATE OR REPLACE VIEW {module}_gastos_full AS
SELECT
  g.*,  -- or specific fields
  f.id AS formulario_id,
  -- Header fields
  c.id AS {module}_gasto_id
  -- Context fields
FROM gastos g
JOIN {module}_gastos c ON g.id = c.gasto_id
JOIN {module}_formularios f ON c.formulario_id = f.id;
```

4. **Enable RLS**:
```sql
ALTER TABLE {module}_formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE {module}_gastos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON {module}_formularios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON {module}_gastos FOR ALL USING (true) WITH CHECK (true);
```

5. **Indexes**:
```sql
CREATE INDEX idx_{module}_formularios_estado ON {module}_formularios(estado);
CREATE INDEX idx_{module}_formularios_created ON {module}_formularios(created_at DESC);
CREATE INDEX idx_{module}_gastos_formulario ON {module}_gastos(formulario_id);
CREATE INDEX idx_{module}_gastos_gasto ON {module}_gastos(gasto_id);
```

## Estado Values

### Gasto Estado
- `pendiente` - Pending approval
- `activo` - Active/approved
- `anulado` - Cancelled

### Estado Pago
- `pendiente` - Payment pending
- `pagado` - Paid
- `anulado` - Cancelled

### Formulario Estado
- `activo` / `abierto` - Open for editing
- `cerrado` - Closed (locked)
- `anulado` - Cancelled (locked)
