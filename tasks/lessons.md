# Lessons Learned

## 2026-02-03: Sync temp IDs with DB IDs after create

**Problem**: When creating new items via a form that tracks existing vs new by ID, if the form stays open after a partial save failure, newly created items get re-created on next save.

**Pattern**: After batch creating items:
1. Map temp client IDs → real DB IDs returned from service
2. Update the tracking ref (`loadedGastoIdsRef.current.add(dbId)`)
3. Update UI state to replace temp IDs with DB IDs

**File**: `FormularioImplementacion.tsx` - `handleGuardar()`

**Rule**: Always sync client-side IDs with server-side IDs after successful creates, especially when the form can stay open on partial failures.

## 2026-02-03: Display user names, not UUIDs

**Problem**: Forms displaying `createdBy` (UUID) instead of user name in "Responsable" field.

**Root causes**:
1. Using `createdBy` (UUID) directly as display value
2. Using non-existent property `currentUser?.nombre` instead of `firstName + lastName`

**Pattern**: Look up user from `users` array by UUID:
```typescript
const user = users.find(u => u.id === createdById);
return user ? `${user.firstName} ${user.lastName}` : createdById;
```

**Files fixed**:
- `App.tsx` - ExperienceEditarPage
- `ExperienceForm.tsx` - fallback for currentUser
- `FormularioProgramacion.tsx` - responsableName

**Rule**: Never display UUIDs directly. Always look up entity names from context.

## 2026-02-12: Field name casing mismatch kills data persistence

**Problem**: Experience `subrubro` field appeared empty after save + re-open. Data was in DB but never reached the UI.

**Root cause**: `mapFromDB()` returned field as `subRubro` (camelCase) but form/context read `subrubro` (lowercase). JS object property access is case-sensitive, so `obj.subrubro !== obj.subRubro`.

**Also**: The TypeScript interfaces (`GastoExperience`, `CreateMultipleGastosExperienceInput`, etc.) never declared the `subrubro` field — it was silently passed through as an extra property.

**Rule**:
1. When adding a new field, declare it in the TypeScript interface FIRST
2. Use consistent casing across mapper → type → form. Pick one (e.g., `subrubro`) and stick with it
3. If the build passes but a field doesn't work at runtime, check for casing mismatches in JS objects
