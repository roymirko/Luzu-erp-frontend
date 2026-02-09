# Luzu ERP - Entity Relationship Diagram

```mermaid
erDiagram
    %% ============================================
    %% CORE
    %% ============================================

    usuarios {
        uuid id PK
        text email UK
        text first_name
        text last_name
        boolean active
    }

    roles {
        uuid id PK
        text name UK
        jsonb permissions
    }

    areas {
        uuid id PK
        text name
        text code UK
        boolean active
    }

    usuario_area_roles {
        uuid id PK
        uuid usuario_id FK
        uuid area_id FK
        uuid rol_id FK
    }

    usuarios ||--o{ usuario_area_roles : "has"
    areas ||--o{ usuario_area_roles : "has"
    roles ||--o{ usuario_area_roles : "assigned"

    %% ============================================
    %% ENTIDADES
    %% ============================================

    entidades {
        uuid id PK
        text razon_social
        text cuit UK
        text tipo_entidad "proveedor|cliente|ambos"
        text condicion_iva
        boolean activo
    }

    %% ============================================
    %% COMERCIAL
    %% ============================================

    ordenes_publicidad {
        uuid id PK
        text orden_publicidad
        text nombre_campana
        text unidad_negocio
        text categoria_negocio
        text razon_social
        text marca
        text tipo_importe "canje|factura"
    }

    items_orden_publicidad {
        uuid id PK
        uuid orden_publicidad_id FK
        text programa
        text monto
        text implementacion
    }

    ordenes_publicidad ||--o{ items_orden_publicidad : "contains"

    %% ============================================
    %% COMPROBANTES (Core financial)
    %% ============================================

    comprobantes {
        uuid id PK
        text tipo_movimiento "ingreso|egreso"
        uuid entidad_id FK
        text entidad_nombre
        text tipo_comprobante "FA|FB|FC..."
        text numero_comprobante
        date fecha_comprobante
        text moneda "ARS|USD"
        decimal neto
        decimal iva_monto
        decimal total
        text estado "pendiente|activo|cerrado|anulado"
        text estado_pago "pendiente|pagado|pedir_info|anulado"
        text forma_pago
        date fecha_pago
        text factura_emitida_a
        text acuerdo_pago
    }

    entidades ||--o{ comprobantes : "emits"

    %% ============================================
    %% IMPLEMENTACION
    %% ============================================

    implementacion_comprobantes {
        uuid id PK
        uuid comprobante_id FK
        uuid orden_publicidad_id FK
        text sector
        text rubro_gasto
        text sub_rubro
    }

    comprobantes ||--|| implementacion_comprobantes : "context"
    ordenes_publicidad ||--o{ implementacion_comprobantes : "tracks"

    %% ============================================
    %% PROGRAMACION
    %% ============================================

    programacion_formularios {
        uuid id PK
        text mes_gestion
        text programa
        text unidad_negocio
        text estado
    }

    programacion_comprobantes {
        uuid id PK
        uuid comprobante_id FK
        uuid formulario_id FK
        text categoria
        decimal monto
    }

    comprobantes ||--|| programacion_comprobantes : "context"
    programacion_formularios ||--o{ programacion_comprobantes : "groups"

    %% ============================================
    %% EXPERIENCE
    %% ============================================

    experience_formularios {
        uuid id PK
        text mes_gestion
        text nombre_campana
        text subrubro
        text estado
    }

    experience_comprobantes {
        uuid id PK
        uuid comprobante_id FK
        uuid formulario_id FK
        text empresa
        text pais
    }

    comprobantes ||--|| experience_comprobantes : "context"
    experience_formularios ||--o{ experience_comprobantes : "groups"
```

## View Options

1. **DBML Format** (recommended): Open `erd.dbml` at [dbdiagram.io](https://dbdiagram.io/d)
2. **Mermaid**: View this file in VS Code with Mermaid extension or on GitHub

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         COMPROBANTES                            │
│                    (Central financial table)                    │
│         tipo_movimiento: ingreso | egreso                       │
│   estado_pago: pendiente | pagado | pedir_info | anulado       │
│   Consolidated: factura_emitida_a, acuerdo_pago, forma_pago   │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ IMPLEMENTACION  │ │  PROGRAMACION   │ │   EXPERIENCE    │
│  _comprobantes  │ │  _comprobantes  │ │  _comprobantes  │
│    (context)    │ │    (context)    │ │    (context)    │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    ordenes_     │ │  programacion_  │ │  experience_    │
│   publicidad    │ │   formularios   │ │   formularios   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Key Relationships

| Module | Header | Context | Links To |
|--------|--------|---------|----------|
| Implementación | ordenes_publicidad | implementacion_comprobantes | comprobantes |
| Programación | programacion_formularios | programacion_comprobantes | comprobantes |
| Experience | experience_formularios | experience_comprobantes | comprobantes |
| Finanzas/Admin | - | - | comprobantes_full (view) |
