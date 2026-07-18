import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Insert tenant if not exists
  await prisma.$executeRawUnsafe(`
    INSERT INTO core.tenants (id, name, slug, plan, created_at, updated_at)
    VALUES ('00000000-0000-4000-8000-000000000001', 'NextAudit Local', 'nextaudit-local', 'dev', $1::timestamptz, $1::timestamptz)
    ON CONFLICT (id) DO NOTHING
  `, now);

  // Insert roles
  await prisma.$executeRawUnsafe(`
    INSERT INTO iam.roles (code, name, description, created_at, updated_at)
    VALUES
      ('viewer', 'Visualizador', 'Solo lectura de alertas y datos de flota. Sin acceso a IA.', $1::timestamptz, $1::timestamptz),
      ('admin', 'Administrador', 'Gestion de politicas de cumplimiento y uso gobernado de IA.', $1::timestamptz, $1::timestamptz),
      ('super_admin', 'Super Administrador', 'Gestion de usuarios, auditoria y llaves LLM.', $1::timestamptz, $1::timestamptz)
    ON CONFLICT (code) DO NOTHING
  `, now);

  // Insert permissions
  await prisma.$executeRawUnsafe(`
    INSERT INTO iam.permissions (code, name, description, created_at)
    VALUES
      ('alerts:read', 'Leer alertas', 'Permite consultar alertas.', $1::timestamptz),
      ('fleet:read', 'Leer flota', 'Permite consultar datos de Fleet.', $1::timestamptz),
      ('policies:manage', 'Gestionar politicas', 'Permite crear y modificar politicas de cumplimiento.', $1::timestamptz),
      ('ai_chat:use', 'Usar chat IA', 'Permite usar funciones de IA.', $1::timestamptz),
      ('users:manage', 'Gestionar usuarios', 'Permite administrar usuarios.', $1::timestamptz),
      ('audit_logs:read', 'Leer auditoria', 'Permite consultar logs de auditoria.', $1::timestamptz),
      ('llm_keys:manage', 'Gestionar llaves LLM', 'Permite administrar llaves y proveedores LLM.', $1::timestamptz)
    ON CONFLICT (code) DO NOTHING
  `, now);

  // Assign permissions to roles
  await prisma.$executeRawUnsafe(`
    INSERT INTO iam.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM iam.roles r
    JOIN iam.permissions p ON p.code IN ('alerts:read', 'fleet:read')
    WHERE r.code = 'viewer'
    ON CONFLICT DO NOTHING
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO iam.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM iam.roles r
    JOIN iam.permissions p ON p.code IN ('alerts:read', 'fleet:read', 'policies:manage', 'ai_chat:use')
    WHERE r.code = 'admin'
    ON CONFLICT DO NOTHING
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO iam.role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM iam.roles r
    JOIN iam.permissions p ON p.code IN (
      'alerts:read', 'fleet:read', 'policies:manage', 'ai_chat:use',
      'users:manage', 'audit_logs:read', 'llm_keys:manage'
    )
    WHERE r.code = 'super_admin'
    ON CONFLICT DO NOTHING
  `);

  console.log('Baseline data seeded successfully');
}

main()
  .finally(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
