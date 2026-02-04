# Server-Side Authentication Implementation

## Completed

- [x] Create DB migration `003_auth_password.sql` - adds password_hash, user_type to usuarios
- [x] Create Hono backend in `/server`
  - [x] src/index.ts - main entry with CORS, logger
  - [x] src/routes/auth.ts - POST /login, GET /me
  - [x] src/routes/users.ts - CRUD (admin only)
  - [x] src/middleware/auth.ts - JWT verification
  - [x] src/services/auth.service.ts - bcrypt, JWT
  - [x] src/services/user.service.ts - DB operations
  - [x] src/utils/supabase.ts - server-side client
  - [x] scripts/seed.ts - creates admin@luzutv.com.ar
- [x] Create API client `src/app/services/api.ts`
- [x] Update DataContext with JWT login flow
- [x] Update Login.tsx with email/password form
- [x] Update vite.config.ts with /api proxy
- [x] Update package.json with server scripts
- [x] Update User type with userType
- [x] Update supabaseMappers for user_type
- [x] Update references/db.md

## Verification Steps

1. Run migration: `supabase db push` or apply `003_auth_password.sql` manually
2. Create server `.env`:
   ```
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   JWT_SECRET=your_32_char_secret
   ADMIN_DEFAULT_PASSWORD=admin123
   PORT=3001
   ```
3. Seed admin: `npm run seed`
4. Start server: `npm run server`
5. Start frontend: `npm run dev`
6. Login with admin@luzutv.com.ar / admin123
7. Test Google OAuth still works

## Files Created

```
server/
  package.json
  tsconfig.json
  .env.example
  scripts/seed.ts
  src/
    index.ts
    routes/auth.ts
    routes/users.ts
    middleware/auth.ts
    services/auth.service.ts
    services/user.service.ts
    utils/supabase.ts

supabase/migrations/003_auth_password.sql
src/app/services/api.ts
```

## Files Modified

- src/app/contexts/DataContext.tsx - JWT login, authToken state
- src/app/components/Login.tsx - email/password form
- src/app/App.tsx - handleLogin signature
- src/app/types/business.ts - UserType, metadata.userType
- src/app/utils/supabaseMappers.ts - map user_type
- vite.config.ts - proxy /api
- package.json - server scripts
- references/db.md - documented new columns
