# LUZU ERP - Product Requirements Document (PRD)

> **Version:** 2.0.0
> **Last Updated:** February 2026
> **Status:** Active Development (MVP Phase)

This document serves as the authoritative source of truth for the Luzu ERP project. It provides strategic context, product vision, and comprehensive requirements that guide all development decisions.

---

## 1. Executive Summary

**Luzu ERP** is an Enterprise Resource Planning system built specifically for **Luzu TV**, an Argentine media and broadcasting company. The system centralizes management of advertising orders, expense tracking across all business areas, and administrative operations.

### Key Business Units

| Unit           | Focus                             | Revenue Model    |
| -------------- | --------------------------------- | ---------------- |
| **Media**      | Traditional broadcast advertising | CPM/Sponsorships |
| **Experience** | Event/experiential marketing      | Event packages   |
| **Productora** | Content production services       | Production fees  |

### Product Goals

1. **Centralize Operations** - Single source of truth for all commercial and operational data
2. **Enforce Business Rules** - Automated validation of financial calculations and workflows
3. **Enable Auditability** - Complete trail of all system actions for compliance
4. **Improve Efficiency** - Reduce manual data entry errors and duplicated effort

---

## 2. Problem Statement

### Current Pain Points

1. **Fragmented Data** - Commercial orders, expenses, and schedules managed in disconnected spreadsheets
2. **Manual Calculations** - Financial formulas (fees, credit notes, margins) computed manually, prone to errors
3. **No Audit Trail** - Difficulty tracking who made changes and when
4. **Inconsistent Processes** - Each department follows different workflows
5. **Limited Visibility** - Management lacks real-time insight into operations

### Target State

A unified platform where:

- All commercial transactions are recorded with enforced business rules
- Financial calculations are automatic and consistent
- Every action is logged for accountability
- Departments work from shared, accurate data
- Management has dashboard visibility into key metrics

---

## 3. User Personas

### Primary Users

#### Sales Executive (Ejecutivo Comercial)

- **Goals:** Create and manage advertising orders quickly
- **Pain Points:** Complex financial calculations, duplicate data entry
- **Needs:** Intuitive forms with auto-calculations, client database access

#### Implementation Coordinator (Coordinador de Implementación)

- **Goals:** Track expenses and provider payments for campaigns
- **Pain Points:** Manual expense tracking, lost invoices
- **Needs:** Expense entry with invoice attachments, payment status tracking

#### Técnica Coordinator (Coordinador de Técnica)

- **Goals:** Track technical production expenses linked to advertising orders
- **Pain Points:** Same as Implementación — parallel expense tracking for technical costs
- **Needs:** OP-linked expense forms, payment tracking

#### Talentos Coordinator (Coordinador de Talentos)

- **Goals:** Track talent/host fees linked to advertising orders
- **Pain Points:** Managing talent costs per program item
- **Needs:** OP + item-level expense forms, payment tracking

#### Experience Coordinator (Coordinador de Experience)

- **Goals:** Manage event/experiential marketing expenses by campaign
- **Pain Points:** Multiple providers per event, tracking payments across campaigns
- **Needs:** Campaign-based expense grouping, multi-gasto forms, provider search

#### Productora Coordinator (Coordinador de Productora)

- **Goals:** Manage production expenses by campaign with rubro/sub_rubro tracking
- **Pain Points:** Multi-provider, multi-rubro expense management
- **Needs:** Campaign-based forms with rubro categorization

#### Programación Coordinator (Coordinador de Programación)

- **Goals:** Track programming/production costs by program
- **Pain Points:** Complex categorization, bonificaciones
- **Needs:** Program-linked expense forms with category and client tracking

#### Finance/Administration (Administración)

- **Goals:** Verify transactions, manage clients, process payments across ALL areas
- **Pain Points:** Reconciling data across sources, approval workflows
- **Needs:** Unified comprobantes view, payment approval, estado_pago management

#### System Administrator (Administrador)

- **Goals:** Manage users, roles, and system configuration
- **Pain Points:** User access control complexity
- **Needs:** User CRUD, role assignment, area management

#### Management (Dirección)

- **Goals:** Monitor business performance
- **Pain Points:** Delayed/inaccurate reports
- **Needs:** Real-time dashboards, KPI visibility

---

## 4. Product Scope

### In Scope (MVP)

| Module             | Features                                                                      |
| ------------------ | ----------------------------------------------------------------------------- |
| **Comercial**      | Order creation, program assignments, financial calculations, client selection |
| **Implementación** | OP-linked expense tracking, provider management, payment status              |
| **Técnica**        | OP-linked technical expense tracking, same flow as Implementación            |
| **Talentos**       | OP+item-linked talent expense tracking                                        |
| **Experience**     | Campaign-based expense tracking, multi-gasto forms, formulario headers       |
| **Productora**     | Campaign-based production expense tracking, rubro/sub_rubro categorization   |
| **Programación**   | Program expense tracking, categoria/cliente, bonificaciones                  |
| **Administración** | Unified comprobantes view, payment approval, estado_pago workflow, directo expenses |
| **Backoffice**     | User CRUD, area management, role assignments, field options configuration     |
| **Auditoría**      | Action logging, log viewer with filters                                       |
| **Dashboard**      | KPI display (mock data for MVP), notifications                                |

### Out of Scope (Post-MVP)

- Full authentication with Supabase RLS enforcement
- Report generation (PDF/Excel exports)
- Real-time notifications (WebSockets)
- Mobile application
- Multi-tenant support
- API integrations with external systems

---

## 5. Functional Requirements

### 5.1 Commercial Module (Módulo Comercial)

#### FR-COM-01: Order Creation

- Users can create advertising orders with campaign details
- Required fields: Order ID, Total Sale, Service Month/Year, Business Unit, Client
- Conditional fields based on Business Unit selection

#### FR-COM-02: Program Assignment

- Orders can have multiple program line items
- Each program has: Amount, NC%, Fee%, Implementation, Talent, Technique breakdowns
- Duplicate programs in same order are prohibited

#### FR-COM-03: Financial Auto-Calculations

```
NC Programa = Monto × (NC% / 100)
Fee Programa = Monto × (Fee% / 100)
Utilidad = Total Venta - (NC + Fee + Gastos Venta)
```

#### FR-COM-04: Financial Validations

- Sum of program amounts MUST equal Total Sale exactly
- Per-program breakdown (Impl + Talent + Tech) cannot exceed program amount
- Visual warnings displayed inline when limits exceeded

#### FR-COM-05: Date Restrictions

- **Create mode:** Only current month/year or future allowed
- **Edit mode:** Full historical access (from 2020)

#### FR-COM-06: Field Dependencies

- `Proyecto` options depend on `Unidad de Negocio`
- `Categoría` options depend on selected Unit
- Dependent fields clear when parent changes

### 5.2 Expense Modules (Unified Architecture)

All expense areas share a unified 2-table architecture. Area-specific behavior is discriminated by `area_origen`.

#### 5.2.1 OP-Linked Areas: Implementación, Técnica, Talentos

#### FR-OP-01: Expense Tracking

- Create expenses linked to `ordenes_publicidad` via `orden_publicidad_id`
- Impl/Tec: linked at OP level. Talentos: linked at OP + item level (`item_orden_publicidad_id`)
- Track provider, amount, invoice details, payment status

#### FR-OP-02: Context Fields

- `sector`, `rubro_contexto` (auto: "Gasto de venta"), `sub_rubro_contexto`, `condicion_pago`
- `nombre_campana`, `unidad_negocio`, `categoria_negocio` inherited from OP or standalone

#### FR-OP-03: Payment Status Workflow

```
creado → aprobado → pagado
creado → requiere_info → creado (re-submit)
creado → rechazado
```

#### 5.2.2 Formulario-Linked Areas: Experience, Productora, Programación

#### FR-FORM-01: Formulario Headers (contexto_comprobante)

- Each formulario stored in `contexto_comprobante` with `area_origen` discriminator
- Shared fields: `mes_gestion`, `detalle_campana`, `nombre_campana`, `estado`
- Programación-specific: `mes_venta`, `mes_inicio`, `programa`, `ejecutivo`
- Productora-specific: `rubro`, `sub_rubro`

#### FR-FORM-02: Multi-Gasto Forms

- Single formulario can contain multiple gasto line items (comprobantes)
- Each comprobante links to formulario via `contexto_comprobante_id`
- Gastos can be added/removed dynamically before save

#### FR-FORM-03: Experience-Specific

- Subrubros: Producción, Diseño, Edición, Técnica
- Fields: `empresa_programa`, `pais`, `factura_emitida_a`, `acuerdo_pago`

#### FR-FORM-04: Productora-Specific

- Rubro/sub_rubro on formulario header
- Fields: `empresa_programa`, `pais`

#### FR-FORM-05: Programación-Specific

- Fields: `categoria`, `cliente`, `monto_prog`, `valor_imponible`, `bonificacion`
- Rubro auto: "Gasto de programación"

#### FR-FORM-06: Table Views (all formulario areas)

- **Programa view**: Individual gastos with all fields
- **Campaña view**: Grouped by formulario with aggregated totals
- Search and filter across both views

#### 5.2.3 Direct Expenses (Admin/Finanzas)

#### FR-DIR-01: Direct Expense Entry

- `area_origen = 'directo'`, no OP or formulario link
- Rubro: "Gastos de estructura"
- Sub_rubros: Gastos de oficina, Gastos de representación, Honorarios profesionales, Gastos generales

### 5.3 Administration Module (Módulo Administración)

#### FR-ADM-01: Unified Comprobantes View

- View ALL comprobantes (ingresos + egresos) from ALL areas in single table
- Filter by tipo_movimiento, area_origen, estado_pago
- Search by entidad, concepto, campaña

#### FR-ADM-02: Estado Pago Workflow

```
creado → aprobado → pagado
creado → requiere_info (with nota_admin)
creado → rechazado
```

- Admin can change estado_pago, add nota_admin, set fecha_estimada_pago
- Locked states: aprobado, rechazado, pagado (no further area edits)

#### FR-ADM-03: Payment Processing

- Set forma_pago, banco, numero_operacion, fecha_pago
- Track condicion_iva, ingresos_brutos, retencion_ganancias

#### FR-ADM-04: Ingreso Management

- Create ingresos linked to OPs (`orden_publicidad_id_ingreso`)
- Fields: retencion_iva, retencion_suss, fecha_vencimiento, portal, contacto

### 5.4 User Management

#### FR-USR-01: User CRUD

- Create users with email, name, area+role assignments
- Edit all user fields except historical data
- Toggle user active status

#### FR-USR-02: Role Assignment

- Users assigned roles per area (N:N relationship)
- Minimum one role assignment required per user
- Roles: Administrador, Editor, Visualizador

#### FR-USR-03: Delete Constraints

- Cannot delete the last active Administrator
- Deleting user removes all their assignments

### 5.5 Area Management

#### FR-AREA-01: Area CRUD

- Create areas with unique code (2-10 uppercase alphanumeric)
- Assign optional manager (user reference)
- Toggle area active status

### 5.6 Audit Logging

#### FR-LOG-01: Automatic Logging

All critical actions logged with:

- Timestamp
- Actor (user ID, email, role)
- Action type (login, create, edit, delete, toggle)
- Entity type and ID
- Result (success, error, warning)
- Details/metadata

#### FR-LOG-02: Log Viewer

- View logs with pagination
- Filter by: date range, user, entity type, action
- Search within log details

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Page load < 3 seconds on standard connection
- Form submissions < 2 seconds response
- Table views handle 1000+ records with pagination

### 6.2 Usability

- Responsive design (desktop-first, mobile-compatible)
- Spanish language UI (es-AR locale)
- Dark/light theme support
- Keyboard navigation for forms

### 6.3 Security

- HTTPS only
- Supabase authentication (Google OAuth for @luzutv.com.ar)
- Row Level Security (post-MVP hardening)
- No sensitive data in client-side storage

### 6.4 Reliability

- Graceful error handling with user feedback
- Fallback for database connection issues
- Data validation both client and server side

### 6.5 Maintainability

- TypeScript for type safety
- Component-based architecture
- Separation of concerns (components, contexts, utils)
- Mapper pattern for database integration

---

## 7. Data Model Overview

### Architecture: 2-Table Gastos Model

All expense tracking uses a consolidated 2-table architecture:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  usuarios   │────<│usuario_area_│>────│    areas    │
│             │     │   roles     │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                     ┌─────┴─────┐
                     │   roles   │
                     └───────────┘

┌───────────────────┐     ┌───────────────────────┐
│ordenes_publicidad │────<│items_orden_publicidad │
│    (orders)       │     │     (programs)        │
└────────┬──────────┘     └───────────┬───────────┘
         │                            │
         │  ┌─────────────────────────┘
         │  │
         ▼  ▼
┌──────────────────────────────────────────────┐
│              comprobantes                     │
│  (ALL ingresos + egresos, flattened context) │
│                                              │
│  area_origen: impl│tec│tal│prog│exp│prod│dir │
│  orden_publicidad_id ──→ OP (impl/tec/tal)   │
│  contexto_comprobante_id ──→ header (below)  │
└──────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│          contexto_comprobante                 │
│  (unified header for prog/exp/prod)          │
│                                              │
│  area_origen: programacion│experience│prod   │
│  mes_gestion, nombre_campana, programa, etc. │
└──────────────────────────────────────────────┘

┌─────────────┐     ┌───────────────────┐
│  entidades  │     │registros_auditoria│
│(prov+client)│     │   (audit logs)    │
└─────────────┘     └───────────────────┘
```

### Tables

| Table                    | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `comprobantes`           | ALL financial documents (ingresos + egresos), context columns flattened in, discriminated by `area_origen` |
| `contexto_comprobante`   | Unified header/grouping for formulario-linked areas (prog/exp/prod) |
| `ordenes_publicidad`     | Advertising orders (commercial module)                   |
| `items_orden_publicidad` | Program line items per order                             |
| `entidades`              | Unified providers + clients table                        |
| `usuarios`               | User accounts                                            |
| `areas`                  | Business areas/departments                               |
| `roles`                  | User roles (Administrador, Editor, Visualizador)         |
| `usuario_area_roles`     | User ↔ Area ↔ Role assignments (N:N)                    |
| `registros_auditoria`    | Audit log for all actions                                |

### Views

| View               | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| `comprobantes_full`| Main view: comprobantes + contexto_comprobante + OP + entidades (4 LEFT JOINs) |
| `gastos_full`      | Egresos only: `WHERE tipo_movimiento = 'egreso'`      |
| `gastos`           | Backward-compat: egresos with legacy column names      |
| `proveedores`      | Backward-compat: entidades filtered to proveedores     |

### Area Discriminator Pattern

| `area_origen` value | OP-linked? | Formulario-linked? | Key context columns |
| ------------------- | ---------- | ------------------- | ------------------- |
| `implementacion`    | Yes        | No                  | sector, rubro_contexto, condicion_pago |
| `tecnica`           | Yes        | No                  | sector, rubro_contexto, condicion_pago |
| `talentos`          | Yes        | No                  | sector, rubro_contexto, item_orden_publicidad_id |
| `programacion`      | No         | Yes                 | categoria, cliente, monto_prog, bonificacion |
| `experience`        | No         | Yes                 | empresa_programa, pais |
| `productora`        | No         | Yes                 | empresa_programa, pais |
| `directo`           | No         | No                  | (none — standalone) |

### Key Relationships

- **User ↔ Area**: Many-to-many through `usuario_area_roles`
- **Order ↔ Programs**: One-to-many (`ordenes_publicidad` → `items_orden_publicidad`)
- **Comprobante → OP**: Optional FK for OP-linked areas
- **Comprobante → Contexto**: Optional FK for formulario-linked areas
- **Comprobante → Entidad**: Optional FK for provider/client reference

### Reference Data

| Entity         | Source                                | Mutability     |
| -------------- | ------------------------------------- | -------------- |
| Roles          | Fixed enum                            | Immutable      |
| Programs       | Hardcoded list (13 shows)             | Rarely changes |
| Business Units | Fixed (Media, Experience, Productora) | Immutable      |
| Currencies     | ARS (default)                         | Extensible     |

---

## 8. Business Rules Reference

> Detailed rules are in `MVP_REQUIREMENTS.md`. Key rules summarized here.

### Financial Rules

| Rule ID    | Description                                         |
| ---------- | --------------------------------------------------- |
| BIZ-FIN-01 | Program amounts sum must equal Total Sale           |
| BIZ-FIN-02 | Program breakdown cannot exceed program amount      |
| BIZ-FIN-03 | NC% and Fee% auto-calculate amounts                 |
| BIZ-FIN-04 | Utility calculated as Total - (NC + Fee + Expenses) |

### Rubro Rules

| Rule ID    | Description                                         |
| ---------- | --------------------------------------------------- |
| BIZ-RUB-01 | Solo egresos tienen rubro/sub_rubro                 |
| BIZ-RUB-02 | Impl/Tec/Talentos: rubro = "Gasto de venta"        |
| BIZ-RUB-03 | Programación: rubro = "Gasto de programación"       |
| BIZ-RUB-04 | Experience: rubro = "Gastos de Evento"              |
| BIZ-RUB-05 | Directo: rubro = "Gastos de estructura"             |

### Estado Pago Rules

| Rule ID    | Description                                         |
| ---------- | --------------------------------------------------- |
| BIZ-PAG-01 | creado → aprobado/requiere_info/rechazado (admin)   |
| BIZ-PAG-02 | aprobado → pagado (admin only)                      |
| BIZ-PAG-03 | Locked states prevent area-level edits              |
| BIZ-PAG-04 | requiere_info allows area to re-edit and re-submit  |

### User Rules

| Rule ID    | Description                                 |
| ---------- | ------------------------------------------- |
| BIZ-USR-01 | Email must be unique across all users       |
| BIZ-USR-02 | Cannot delete last active Administrator     |
| BIZ-USR-03 | User must have at least one role assignment |

---

## 9. Technical Architecture

### Frontend Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Framework     | React 18 + TypeScript        |
| Build         | Vite 6                       |
| Styling       | Tailwind CSS 4               |
| UI Components | Radix UI + shadcn/ui pattern |
| State         | React Context API            |
| Forms         | React Hook Form              |

### Backend Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Database | PostgreSQL (via Supabase)        |
| API      | Supabase REST API                |
| Auth     | Supabase Auth (Google OAuth)     |
| Storage  | Supabase Storage (S3-compatible) |

### Key Patterns

- **Mapper Functions**: Convert between DB (snake_case) and App (camelCase) in service layer
- **Unified gastosService**: Single service for all expense areas, discriminated by `area_origen`
- **Validation Functions**: Pure functions in `businessRules.ts`
- **Context Providers**: Per-area contexts (ImplementacionContext, ExperienceContext, etc.) all backed by unified gastosService
- **Component Composition**: shadcn/ui primitives + custom components

### Key Files

| File | Purpose |
| ---- | ------- |
| `references/db.md` | Database schema reference (authoritative) |
| `src/app/services/gastosService.ts` | Unified expense service (all areas) |
| `src/app/repositories/gastosRepository.ts` | Unified expense data access |
| `src/app/repositories/contextoComprobanteRepository.ts` | Formulario header CRUD |
| `src/app/types/gastos.ts` | Unified `Gasto` type + area-specific interfaces |
| `src/app/types/comprobantes.ts` | `ComprobanteWithContext` type |
| `src/app/services/comprobantesService.ts` | Admin comprobantes service |
| `supabase/migrations/001_schema_completo.sql` | Single consolidated migration |

---

## 10. Success Metrics

### MVP Launch Criteria

- [ ] All CRUD operations functional for Users, Areas, Orders
- [ ] All 7 expense areas operational (impl, tec, tal, prog, exp, prod, directo)
- [ ] Financial calculations accurate and validated
- [ ] Audit logging capturing all critical actions
- [ ] Admin comprobantes view with estado_pago workflow
- [ ] No P0 bugs in production

### Post-Launch KPIs

| Metric            | Target           | Measurement               |
| ----------------- | ---------------- | ------------------------- |
| Order Entry Time  | < 5 min avg      | User timing               |
| Data Entry Errors | < 2%             | Validation rejection rate |
| System Uptime     | 99.5%            | Supabase monitoring       |
| User Adoption     | 80% daily active | Login audit logs          |

---

## 11. Risks and Mitigations

| Risk                  | Impact | Probability | Mitigation                                         |
| --------------------- | ------ | ----------- | -------------------------------------------------- |
| Data migration errors | High   | Medium      | Validate all migrations, maintain rollback scripts |
| User resistance       | Medium | Medium      | Training sessions, intuitive UX                    |
| Performance issues    | Medium | Low         | Pagination, lazy loading, query optimization       |
| Auth bypass           | High   | Low         | Post-MVP: Implement proper RLS policies            |
| Scope creep           | Medium | High        | Strict PRD adherence, change request process       |

---

## 12. Release Plan

### Phase 1: MVP (Current)

- Core commercial module
- All 7 expense area modules
- Unified admin comprobantes view with payment workflow
- Entidades management (proveedores + clientes)
- User/area management
- Audit logging
- Mock dashboard data

### Phase 2: Enhancement

- Full RLS security implementation
- Report generation (PDF/Excel)
- Improved dashboard with real data
- Client portal (read-only)

### Phase 3: Expansion

- Real-time notifications
- API integrations (billing, accounting systems)
- Mobile application

---

## 13. Glossary

| Term                     | Definition                                    |
| ------------------------ | --------------------------------------------- |
| **Orden de Publicidad**  | Advertising order                             |
| **Razón Social**         | Business entity legal name                    |
| **NC (Nota de Crédito)** | Credit note - discount/adjustment             |
| **Fee**                  | Agency fee/commission                         |
| **Canje**                | Barter transaction (non-cash)                 |
| **Comprobante**          | Financial document (invoice, receipt, etc.)   |
| **Gasto**                | Expense (egreso comprobante)                  |
| **Ingreso**              | Income comprobante                            |
| **Implementación**       | Campaign execution costs                      |
| **Talentos**             | Talent/host fees                              |
| **Técnica**              | Technical production costs                    |
| **Productora**           | Content production unit                       |
| **Experience**           | Event/experiential marketing unit             |
| **Formulario**           | Header grouping multiple gastos (contexto_comprobante) |
| **Empresa/PGM**          | Program associated with expense               |
| **Acuerdo de Pago**      | Payment agreement terms (5, 30, 45, 60, 90 días) |
| **Forma de Pago**        | Payment method (transferencia, cheque, efectivo, tarjeta) |
| **Rubro**                | Expense category                              |
| **Sub_rubro**            | Expense subcategory                           |
| **Estado Pago**          | Payment status (creado, aprobado, requiere_info, rechazado, pagado) |
| **Area Origen**          | Discriminator for which area owns a comprobante |
| **Entidad**              | Unified provider/client entity                |
| **Contexto Comprobante** | Unified formulario header (prog/exp/prod)     |

---

## 14. Document References

| Document                                | Purpose                                       |
| --------------------------------------- | --------------------------------------------- |
| `references/db.md`                      | Database schema reference (authoritative)     |
| `MVP_REQUIREMENTS.md`                   | Detailed business rules and validations       |
| `supabase/migrations/001_schema_completo.sql` | Consolidated database migration         |
| `src/app/types/gastos.ts`               | Unified expense type definitions              |
| `src/app/types/comprobantes.ts`         | Comprobante type definitions                  |
| `src/app/utils/businessRules.ts`        | Validation logic implementation               |

---

## 15. Change Log

| Version | Date     | Author  | Changes                                              |
| ------- | -------- | ------- | ---------------------------------------------------- |
| 2.0.0   | Feb 2026 | Claude  | Major rewrite: 2-table gastos architecture (comprobantes + contexto_comprobante), all 7 expense areas documented, added Técnica/Talentos/Productora/Admin modules, updated data model diagram, added rubro + estado_pago business rules, updated glossary + file references |
| 1.1.0   | Jan 2026 | Claude  | Added Experience module, Programación module, unified gastos architecture |
| 1.0.0   | Jan 2026 | Initial | Document creation                                    |

---

## 16. Appendix: Luzu TV Programs

The system supports the following programs:

1. FM Luzu
2. Antes Que Nadie
3. Nadie Dice Nada
4. Vuelta y Media
5. Seria Increíble
6. Patria y Familia
7. Podremos Hablar
8. Óptimo
9. Carajo
10. Grande Pa
11. Tenemos que Hablar
12. Rumbo por la Noche
13. Buenos Días Buenos Aires

---

_This PRD is a living document. Updates should be made as requirements evolve, with changes logged in the Change Log section._
