ALTER TABLE "iam"."users"
ADD COLUMN IF NOT EXISTS "reset_password_token" TEXT,
ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "mfa_secret" TEXT,
ADD COLUMN IF NOT EXISTS "is_mfa_enabled" BOOLEAN NOT NULL DEFAULT false;
