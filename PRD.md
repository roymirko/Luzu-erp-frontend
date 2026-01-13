# LUZU ERP - Product Requirements Document (PRD)

> **Version:** 1.0.0
> **Last Updated:** January 2026
> **Status:** Active Development (MVP Phase)

This document serves as the authoritative source of truth for the Luzu ERP project. It provides strategic context, product vision, and comprehensive requirements that guide all development decisions.

---

## 1. Executive Summary

**Luzu ERP** is an Enterprise Resource Planning system built specifically for **Luzu TV**, an Argentine media and broadcasting company. The system centralizes management of advertising orders, implementation expenses, programming schedules, and administrative operations.

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

#### Finance/Administration (Administración)

- **Goals:** Verify transactions, manage clients, process payments
- **Pain Points:** Reconciling data across sources
- **Needs:** Comprehensive reporting, audit logs, client management

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
| **Implementación** | Expense tracking, provider management, payment status, invoice attachments    |
| **Backoffice**     | User CRUD, area management, role assignments, field options configuration     |
| **Auditoría**      | Action logging, log viewer with filters                                       |
| **Dashboard**      | KPI display (mock data for MVP), notifications                                |

### Out of Scope (Post-MVP)

- Full authentication with Supabase RLS enforcement
- Report generation (PDF/Excel exports)
- Real-time notifications (WebSockets)
- Programming module (Dir. de Programación) - UI stub only
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

### 5.2 Implementation Module (Módulo de Implementación)

#### FR-IMP-01: Expense Tracking

- Create expenses linked to commercial orders
- Track provider, amount, invoice details, payment status

#### FR-IMP-02: Multi-Provider Support

- Single expense can have multiple line items for different providers
- Each item has: Provider type, Net amount, IVA, Total, Invoice number

#### FR-IMP-03: Payment Status Workflow

```
pending-payment → paid
pending-payment → cancelled
```

#### FR-IMP-04: Invoice Attachments

- Support file uploads attached to expense items
- Store references in database (JSONB array)

### 5.3 User Management

#### FR-USR-01: User CRUD

- Create users with email, name, area+role assignments
- Edit all user fields except historical data
- Toggle user active status
- Delete users (with constraints)

#### FR-USR-02: Role Assignment

- Users assigned roles per area (N:N relationship)
- Minimum one role assignment required per user
- Support different roles in different areas

#### FR-USR-03: Delete Constraints

- Cannot delete the last active Administrator
- Deleting user removes all their assignments

### 5.4 Area Management

#### FR-AREA-01: Area CRUD

- Create areas with unique code (2-10 uppercase alphanumeric)
- Assign optional manager (user reference)
- Toggle area active status

#### FR-AREA-02: Cascade Behavior

- Deleting area removes user assignments to that area
- Users remain in system (may lose role if only assignment)

### 5.5 Audit Logging

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

### Core Entities

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│user_area_   │>────│    areas    │
│             │     │   roles     │     │             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │   roles   │
                    └───────────┘

┌─────────────┐     ┌─────────────┐
│    forms    │────<│ form_items  │
│ (orders)    │     │ (programs)  │
└─────────────┘     └─────────────┘

┌─────────────────────┐     ┌─────────────────────────┐
│implementation_      │────<│implementation_expense_  │
│   expenses          │     │         items           │
└─────────────────────┘     └─────────────────────────┘

┌─────────────┐     ┌─────────────┐
│   clients   │     │ audit_logs  │
└─────────────┘     └─────────────┘
```

### Key Relationships

- **User ↔ Area**: Many-to-many through `user_area_roles`
- **Form ↔ FormItem**: One-to-many (order has programs)
- **ImplementationExpense ↔ Items**: One-to-many
- **Form ↔ ImplementationExpense**: One-to-one or one-to-many

### Reference Data

| Entity         | Source                                | Mutability     |
| -------------- | ------------------------------------- | -------------- |
| Roles          | Fixed enum                            | Immutable      |
| Programs       | Hardcoded list (11 shows)             | Rarely changes |
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

### User Rules

| Rule ID    | Description                                 |
| ---------- | ------------------------------------------- |
| BIZ-USR-01 | Email must be unique across all users       |
| BIZ-USR-02 | Cannot delete last active Administrator     |
| BIZ-USR-03 | User must have at least one role assignment |
| BIZ-USR-04 | Inactive users cannot authenticate          |

### Area Rules

| Rule ID     | Description                                  |
| ----------- | -------------------------------------------- |
| BIZ-AREA-01 | Code must be unique (2-10 uppercase chars)   |
| BIZ-AREA-02 | Deleting area removes assignments, not users |
| BIZ-AREA-03 | Inactive areas hidden from selectors         |

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

- **Mapper Functions**: Convert between DB (snake_case) and App (camelCase)
- **Validation Functions**: Pure functions in `businessRules.ts`
- **Context Providers**: Global state per domain (Data, Forms, Logs)
- **Component Composition**: shadcn/ui primitives + custom components

---

## 10. Success Metrics

### MVP Launch Criteria

- [ ] All CRUD operations functional for Users, Areas, Forms
- [ ] Financial calculations accurate and validated
- [ ] Audit logging capturing all critical actions
- [ ] Core workflows (order creation, expense tracking) complete
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
- Basic implementation tracking
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
- Programming module completion
- API integrations (billing, accounting systems)
- Mobile application

---

## 13. Glossary

| Term                     | Definition                         |
| ------------------------ | ---------------------------------- |
| **Orden de Publicidad**  | Advertising order ID               |
| **Razón Social**         | Business entity name (legal name)  |
| **NC (Nota de Crédito)** | Credit note - discount/adjustment  |
| **Fee**                  | Agency fee/commission              |
| **Canje**                | Barter transaction (non-cash)      |
| **Factura**              | Invoice                            |
| **Implementación**       | Campaign execution costs           |
| **Talentos**             | Talent/host fees                   |
| **Técnica**              | Technical production costs         |
| **Mes de Servicio**      | Service month (when campaign runs) |

---

## 14. Document References

| Document                         | Purpose                                       |
| -------------------------------- | --------------------------------------------- |
| `AGENTS.md`                      | Technical coding guidelines for AI assistants |
| `MVP_REQUIREMENTS.md`            | Detailed business rules and validations       |
| `supabase/schema.sql`            | Database schema definition                    |
| `src/app/types/business.ts`      | TypeScript type definitions                   |
| `src/app/utils/businessRules.ts` | Validation logic implementation               |

---

## 15. Change Log

| Version | Date     | Author  | Changes           |
| ------- | -------- | ------- | ----------------- |
| 1.0.0   | Jan 2026 | Initial | Document creation |

---

## 16. Appendix: Luzu TV Programs

The system supports the following 11 programs:

1. Antes que Nadie
2. Nadie Dice Nada
3. El Loco y el Cuerdo
4. Patria y Familia
5. Sería Increíble
6. Quedemos como Amigos
7. Nos Tienen Mania
8. Tarde de Vaguitos
9. Luzu Radio
10. LuzuFest
11. Eventos Especiales

---

_This PRD is a living document. Updates should be made as requirements evolve, with changes logged in the Change Log section._
