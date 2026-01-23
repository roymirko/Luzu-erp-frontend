# AGENTS.md

Agent instructions for Luzu ERP Frontend. This document provides build commands, code style conventions, and project-specific guidance for agentic coding assistants.

> **Important:** Before starting any significant work, review `PRD.md` for strategic product context, `MVP_REQUIREMENTS.md` for detailed business rules, and this file for technical implementation guidance.

## Tech Stack

- **Framework**: React 18 + Vite 6
- **Language**: TypeScript (no explicit tsconfig.json; Vite handles TS internally)
- **Styling**: Tailwind CSS 4 (via @tailwindcss/vite plugin)
- **UI Components**: Radix UI primitives + shadcn/ui pattern
- **Backend**: Supabase (Auth + Database)
- **Package Manager**: npm

## Build / Dev / Test Commands

```bash
# Install dependencies
npm install

# Development server (runs on port 3000)
npm run dev

# Production build
npm run build
```

**Note**: No test runner is configured. No ESLint or Prettier configs exist.

## Project Structure

```
src/
├── app/
│   ├── components/     # React components
│   │   └── ui/         # shadcn/ui base components
│   ├── contexts/       # React Context providers
│   ├── services/       # External service clients (Supabase)
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions and business logic
├── assets/             # Static images
├── imports/            # Figma-generated components (auto-generated)
└── styles/             # Global CSS (Tailwind entry)
supabase/
├── schema.sql          # Database schema
└── seeds.sql           # Seed data
```

## Path Aliases
- `@` → `./src` (configured in vite.config.ts)

## Code Style Guidelines
- When creating Components for Forms, use separate components for fields
- Components should have a maximum of 400 lines if possible
- All business rules should be in a separate service file under app/services file

### Component Reusability (MANDATORY)

When creating or modifying tables, forms, or any UI element:

1. **ALWAYS check existing components first** in `src/app/components/ui/`
2. **ALWAYS reuse existing components** - never duplicate code
3. **If a pattern repeats 2+ times, create a reusable component**
4. **New tables MUST use these shared components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| `ActionCard` | `ui/action-card.tsx` | "Nuevo Formulario" cards |
| `TableHeader` | `ui/table-header.tsx` | Title + Search + children slot |
| `FilterToggle` | `ui/filter-toggle.tsx` | Animated toggle switch (Programa/Orden) |
| `DataTable` | `ui/data-table.tsx` | Table wrapper with border/overflow |
| `DataTableHead` | `ui/data-table.tsx` | Table header (`<thead>`) |
| `DataTableHeaderCell` | `ui/data-table.tsx` | Header cell (`<th>`) |
| `DataTableBody` | `ui/data-table.tsx` | Table body (`<tbody>`) |
| `DataTableRow` | `ui/data-table.tsx` | Table row with hover/click |
| `DataTableCell` | `ui/data-table.tsx` | Table cell (supports `muted` prop) |
| `DataTableEmpty` | `ui/data-table.tsx` | Empty state row |
| `DataTablePagination` | `ui/data-table-pagination.tsx` | Pagination controls |
| `StatusBadge` | `ui/status-badge.tsx` | Status with colored circle |

**Example table structure:**
```tsx
<div className="space-y-6">
  <ActionCard title="..." description="..." icon={Icon} onClick={...} />
  
  <TableHeader title="..." searchValue={...} onSearchChange={...}>
    <FilterToggle options={...} value={...} onChange={...} />
  </TableHeader>
  
  <DataTable>
    <DataTableHead>
      <tr>{columns.map(col => <DataTableHeaderCell key={col}>{col}</DataTableHeaderCell>)}</tr>
    </DataTableHead>
    <DataTableBody>
      {rows.map(row => (
        <DataTableRow key={row.id} onClick={...}>
          <DataTableCell><StatusBadge label="..." variant="..." /></DataTableCell>
          <DataTableCell>...</DataTableCell>
          <DataTableCell muted>...</DataTableCell>
        </DataTableRow>
      ))}
    </DataTableBody>
  </DataTable>
  
  <DataTablePagination currentPage={...} totalPages={...} onPageChange={...} />
</div>
```

**StatusBadge variants:** `success`, `warning`, `error`, `neutral`, `info`

### Imports

```typescript
// 1. External packages first
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 2. Internal modules (contexts, services)
import { useData } from './contexts/DataContext';
import { supabase } from './services/supabase';

// 3. Types (use import type when possible)
import type { User, Area } from './types/business';

// 4. Local files (components, utils)
import { Button } from './components/ui/button';
import { cn } from './components/ui/utils';
```

### Component Files

- **File naming**: PascalCase for components (`Dashboard.tsx`, `UserMenu.tsx`)
- **UI primitives**: Located in `src/app/components/ui/`
- **Pattern**: Functional components with hooks

```typescript
// Component structure
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  const [state, setState] = useState<StateType>(initialValue);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  return (
    <div className={cn('base-classes', conditional && 'conditional-class')}>
      {/* JSX */}
    </div>
  );
}
```

### Types and Interfaces

- **Prefer `interface`** for object shapes
- **Use `enum`** for fixed sets of values
- **Use `type`** for unions, intersections, and aliases
- **Suffix**: Props interfaces end with `Props`, form types with `Form`

```typescript
// Types file pattern (see src/app/types/business.ts)
export enum RoleType {
  ADMINISTRADOR = 'Administrador',
  EDITOR = 'Editor',
  VISUALIZADOR = 'Visualizador'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    position?: string;
    avatar?: string;
  };
}

export interface CreateUserForm {
  email: string;
  firstName: string;
  lastName: string;
  areas: { areaId: string; roleId: string }[];
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `UserMenu`, `Dashboard` |
| Component files | PascalCase.tsx | `UserMenu.tsx` |
| Utility files | camelCase.ts | `businessRules.ts` |
| Functions | camelCase | `validateEmail`, `mapUserFromDB` |
| Constants | camelCase or SCREAMING_SNAKE | `supabaseUrl`, `VITE_SUPABASE_URL` |
| Interfaces/Types | PascalCase | `User`, `ValidationResult` |
| Enums | PascalCase | `RoleType` |
| CSS classes | Tailwind utilities | `bg-primary text-white` |

### Styling with Tailwind

- Use `cn()` utility for conditional classes (from `src/app/components/ui/utils.ts`)
- Use `cva()` for component variants (class-variance-authority)
- Theme colors defined in `src/styles/theme.css`

```typescript
import { cn } from './components/ui/utils';
import { cva } from 'class-variance-authority';

// Conditional classes
<div className={cn('base', isActive && 'active-class', isDark ? 'dark' : 'light')} />

// Component variants
const buttonVariants = cva('inline-flex items-center', {
  variants: {
    variant: { default: 'bg-primary', outline: 'border bg-background' },
    size: { default: 'h-9 px-4', sm: 'h-8 px-3' }
  },
  defaultVariants: { variant: 'default', size: 'default' }
});
```

### State Management

- Use React Context for global state
- Pattern: `XxxProvider` component + `useXxx` hook
- Contexts: `DataContext`, `ThemeContext`, `LogContext`, `FormulariosContext`

```typescript
// Context pattern (see src/app/contexts/)
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // State and logic
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
```

### Supabase Integration

- Client initialized in `src/app/services/supabase.ts`
- Use mapper functions for DB <-> App object conversion (`src/app/utils/supabaseMappers.ts`)
- Database uses snake_case, App uses camelCase

```typescript
// Mapper pattern
export const mapUserFromDB = (dbUser: any): User => ({
  id: dbUser.id,
  firstName: dbUser.first_name,  // snake_case → camelCase
  lastName: dbUser.last_name,
  // ...
});

export const mapUserToDB = (user: Partial<User>) => ({
  first_name: user.firstName,    // camelCase → snake_case
  last_name: user.lastName,
  // ...
});
```

### Error Handling

- Use `console.error` for logging errors
- Return result objects `{ success: boolean; errors?: ValidationError[] }`
- Validate inputs with dedicated functions in `src/app/utils/businessRules.ts`

```typescript
const createUser = async (form: CreateUserForm) => {
  const validation = validateCreateUser(form, users, areas);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const { data, error } = await supabase.from('users').insert(mapUserToDB(form));
  if (error) {
    console.error('Error creating user:', error);
    return { success: false, errors: [{ field: 'general', message: 'Error creating user' }] };
  }
  
  return { success: true, userId: data.id };
};
```

### Async/Await

- Always use async/await over `.then()` chains
- Wrap Supabase calls in try/catch or handle via destructured error

```typescript
// Preferred pattern
const { data, error } = await supabase.from('users').select('*');
if (error) {
  console.error('Fetch error:', error);
  return;
}
```

## Environment Variables

- Stored in `.env` (see `.env.example`)
- Prefix with `VITE_` for client-side access
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Agent Workflow Notes

1. **Before editing**: Read relevant files to understand existing patterns
2. **Path alias**: Use `@/` for src imports when adding new files
3. **UI components**: Follow shadcn/ui patterns in `src/app/components/ui/`
4. **New types**: Add to `src/app/types/business.ts`
5. **DB changes**: Update `supabase/schema.sql` and corresponding mappers
6. **No linting**: Keep formatting consistent with existing files manually
7. **Spanish context**: UI text and comments may be in Spanish (this is for Luzu TV, Argentina)

## Key Files Reference

- Entry: `src/main.tsx` → `src/app/App.tsx`
- Types: `src/app/types/business.ts`
- Supabase: `src/app/services/supabase.ts`
- DB Mappers: `src/app/utils/supabaseMappers.ts`
- Business Rules: `src/app/utils/businessRules.ts`
- UI Utils: `src/app/components/ui/utils.ts`


## Supabase Credentials: 
╭──────────────────────────────────────╮
│ 🔧 Development Tools                 │
├─────────┬────────────────────────────┤
│ Studio  │ http://127.0.0.1:54323     │
│ Mailpit │ http://127.0.0.1:54324     │
│ MCP     │ http://127.0.0.1:54321/mcp │
╰─────────┴────────────────────────────╯

╭──────────────────────────────────────────────────────╮
│ 🌐 APIs                                              │
├────────────────┬─────────────────────────────────────┤
│ Project URL    │ http://127.0.0.1:54321              │
│ REST           │ http://127.0.0.1:54321/rest/v1      │
│ GraphQL        │ http://127.0.0.1:54321/graphql/v1   │
│ Edge Functions │ http://127.0.0.1:54321/functions/v1 │
╰────────────────┴─────────────────────────────────────╯

╭───────────────────────────────────────────────────────────────╮
│ ⛁ Database                                                    │
├─────┬─────────────────────────────────────────────────────────┤
│ URL │ postgresql://postgres:postgres@127.0.0.1:54322/postgres │
╰─────┴─────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────╮
│ 🔑 Authentication Keys                                       │
├─────────────┬────────────────────────────────────────────────┤
│ Publishable │ sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH │
│ Secret      │ sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz      │
╰─────────────┴────────────────────────────────────────────────╯

╭───────────────────────────────────────────────────────────────────────────────╮
│ 📦 Storage (S3)                                                               │
├────────────┬──────────────────────────────────────────────────────────────────┤
│ URL        │ http://127.0.0.1:54321/storage/v1/s3                             │
│ Access Key │ 625729a08b95bf1b7ff351a663f3a23c                                 │
│ Secret Key │ 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907 │
│ Region     │ local                                                            │
╰────────────┴──────────────────────────────────────────────────────────────────╯

## Plans
- Make the plan extremely concise. sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
