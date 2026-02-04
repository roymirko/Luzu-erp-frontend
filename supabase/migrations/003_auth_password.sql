-- Migration: Add password authentication fields
-- Add password_hash and user_type columns to usuarios table

-- Password hash for bcrypt hashed passwords
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- User type for role-based access (system-level, not per-area)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS user_type TEXT;

-- Set default value for existing rows (before adding constraint)
UPDATE usuarios SET user_type = 'administrador' WHERE user_type IS NULL;

-- Add constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_user_type_check'
  ) THEN
    ALTER TABLE usuarios ADD CONSTRAINT usuarios_user_type_check
      CHECK (user_type IN ('administrador', 'implementacion', 'programacion', 'administracion', 'finanzas'));
  END IF;
END $$;

-- Set default for new rows
ALTER TABLE usuarios ALTER COLUMN user_type SET DEFAULT 'administrador';

-- Index for faster user lookups by email during login
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
