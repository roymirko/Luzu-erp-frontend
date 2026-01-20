# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luzu ERP is an Enterprise Resource Planning system for Luzu TV (Argentine media company). It manages advertising orders, implementation expenses, programming schedules, and administrative operations.

**Key documentation**: Read `MVP_REQUIREMENTS.md` for detailed business rules (in Spanish) and `PRD.md` for product context.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server (port 3000)
npm run build        # Production build
```

No test runner, ESLint, or Prettier configured.

## Architecture

### Tech Stack
- React 18 + Vite 6 + TypeScript
- Tailwind CSS 4 + Radix UI (shadcn/ui pattern)
- Supabase (PostgreSQL backend)
- React Hook Form for forms
- Recharts for charts

### State Management
Uses React Context API with 6 providers in hierarchy:
```
ThemeProvider → LogProvider → DataProvider → FormulariosProvider → FormFieldsProvider → ImplementacionProvider
```

Custom hook pattern: `useXxx()` hooks that throw if used outside provider.

### Data Flow
- **Database ↔ Service**: Mapper functions in `src/app/utils/supabaseMappers.ts` convert snake_case DB to camelCase app models
- **Service ↔ Context**: Services in `src/app/services/` handle Supabase operations
- **Context ↔ Components**: Components consume via custom hooks

### Key Directories
- `src/app/components/ui/` - shadcn/ui base components (~90 files)
- `src/app/contexts/` - React Context providers
- `src/app/services/` - Supabase integration layer
- `src/app/repositories/` - Data access layer
- `src/app/types/` - Domain models (business.ts, comercial.ts, implementacion.ts, proveedores.ts)
- `src/app/utils/businessRules.ts` - Centralized validation logic
- `supabase/` - Database schema and migrations

### Path Alias
`@` → `./src` (configured in vite.config.ts)

## Code Conventions

### Imports Order
1. External packages
2. Internal modules (contexts, services)
3. Types (use `import type`)
4. Local files (components, utils)

### Naming
- Components: PascalCase files (`Dashboard.tsx`)
- Utilities: camelCase files (`businessRules.ts`)
- Interfaces: PascalCase, Props suffix for component props (`UserMenuProps`)
- Enums: PascalCase (`RoleType`)

### Styling
- Use `cn()` from `src/app/components/ui/utils.ts` for conditional classes
- Use `cva()` for component variants
- Theme variables in `src/styles/theme.css`

### Service Pattern
Services return typed responses: `{ success: boolean; error?: string; data?: T }`

### Mapper Pattern
Always convert between DB (snake_case) and app (camelCase) formats:
```typescript
export const mapUserFromDB = (dbUser: any): User => ({
  firstName: dbUser.first_name,
  // ...
});
```

## Business Domains

- **Users/Areas/Roles**: RBAC with 3 fixed roles (Administrador, Editor, Visualizador)
- **Commercial Orders (Órdenes de Publicidad)**: Multi-program advertising with automatic calculations
- **Implementation Tracking**: Expense tracking per program/campaign
- **Audit Logging**: Automatic logging of login, create, update, delete actions

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Notes

- UI text and comments may be in Spanish
- Components should stay under 400 lines; extract sub-components as needed
- Business rules belong in `src/app/utils/businessRules.ts`, not in components
- Follow existing patterns in the codebase

## Plans
- Make the plan extremely concise. sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.