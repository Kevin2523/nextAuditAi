CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS iam;
CREATE SCHEMA IF NOT EXISTS telemetry;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS integration;
CREATE SCHEMA IF NOT EXISTS billing;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE core.tenant_status AS ENUM ('active', 'suspended', 'archived');
CREATE TYPE telemetry.alert_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
CREATE TYPE telemetry.alert_status AS ENUM ('open', 'acknowledged', 'resolved', 'dismissed');

CREATE TABLE core.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status core.tenant_status NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'dev',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE iam.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE iam.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE iam.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE iam.role_permissions (
  role_id uuid NOT NULL REFERENCES iam.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES iam.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE iam.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES iam.roles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memberships_tenant_user_unique UNIQUE (tenant_id, user_id)
);

CREATE INDEX memberships_user_id_idx ON iam.memberships(user_id);
CREATE INDEX memberships_role_id_idx ON iam.memberships(role_id);

CREATE TABLE iam.refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX refresh_tokens_user_id_idx ON iam.refresh_tokens(user_id);
CREATE INDEX refresh_tokens_expires_at_idx ON iam.refresh_tokens(expires_at);

CREATE TABLE telemetry.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
  source text NOT NULL,
  device_id text,
  hostname text,
  message text NOT NULL,
  severity telemetry.alert_severity NOT NULL DEFAULT 'info',
  status telemetry.alert_status NOT NULL DEFAULT 'open',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz NOT NULL DEFAULT now(),
  raw jsonb
);

CREATE INDEX alerts_tenant_id_received_at_idx ON telemetry.alerts(tenant_id, received_at);
CREATE INDEX alerts_severity_idx ON telemetry.alerts(severity);
CREATE INDEX alerts_status_idx ON telemetry.alerts(status);

INSERT INTO core.tenants (id, name, slug, plan)
VALUES ('00000000-0000-4000-8000-000000000001', 'NextAudit Local', 'nextaudit-local', 'dev')
ON CONFLICT (id) DO NOTHING;

INSERT INTO iam.roles (code, name, description)
VALUES
  ('viewer', 'Visualizador', 'Solo lectura de alertas y datos de flota. Sin acceso a IA.'),
  ('admin', 'Administrador', 'Gestion de politicas de cumplimiento y uso gobernado de IA.'),
  ('super_admin', 'Super Administrador', 'Gestion de usuarios, auditoria y llaves LLM.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.permissions (code, name, description)
VALUES
  ('alerts:read', 'Leer alertas', 'Permite consultar alertas.'),
  ('fleet:read', 'Leer flota', 'Permite consultar datos de Fleet.'),
  ('policies:manage', 'Gestionar politicas', 'Permite crear y modificar politicas de cumplimiento.'),
  ('ai_chat:use', 'Usar chat IA', 'Permite usar funciones de IA.'),
  ('users:manage', 'Gestionar usuarios', 'Permite administrar usuarios.'),
  ('audit_logs:read', 'Leer auditoria', 'Permite consultar logs de auditoria.'),
  ('llm_keys:manage', 'Gestionar llaves LLM', 'Permite administrar llaves y proveedores LLM.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
JOIN iam.permissions p ON p.code IN ('alerts:read', 'fleet:read')
WHERE r.code = 'viewer'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
JOIN iam.permissions p ON p.code IN ('alerts:read', 'fleet:read', 'policies:manage', 'ai_chat:use')
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
JOIN iam.permissions p ON p.code IN (
  'alerts:read',
  'fleet:read',
  'policies:manage',
  'ai_chat:use',
  'users:manage',
  'audit_logs:read',
  'llm_keys:manage'
)
WHERE r.code = 'super_admin'
ON CONFLICT DO NOTHING;
