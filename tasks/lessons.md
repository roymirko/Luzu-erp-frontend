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
