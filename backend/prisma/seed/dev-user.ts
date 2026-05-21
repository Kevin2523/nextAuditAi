  import { randomBytes, scrypt } from 'node:crypto';
  import { PrismaClient } from '@prisma/client';

  const prisma = new PrismaClient();
  const tenantId = process.env.DEFAULT_TENANT_ID ?? '00000000-0000-4000-8000-000000000001';
  const email = process.env.DEV_USER_EMAIL ?? 'admin@nextaudit.local';
  const password = process.env.DEV_USER_PASSWORD ?? 'NextAuditDev123!';
  const displayName = process.env.DEV_USER_NAME ?? 'Administrador Local';
  const roleCode = process.env.DEV_USER_ROLE ?? 'super_admin';

  function deriveKey(passwordValue: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(passwordValue, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(key);
      });
    });
  }

  async function hashPassword(passwordValue: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const key = await deriveKey(passwordValue, salt);
    return `scrypt$16384$8$1$${salt}$${key.toString('hex')}`;
  }

  async function main() {
    const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        displayName,
        passwordHash: await hashPassword(password),
        isActive: true,
      },
      create: {
        email,
        displayName,
        passwordHash: await hashPassword(password),
        isActive: true,
      },
    });

    await prisma.membership.upsert({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
      update: { roleId: role.id },
      create: {
        tenantId,
        userId: user.id,
        roleId: role.id,
      },
    });

    console.log(`Usuario de desarrollo listo: ${email} con rol ${roleCode}`);
  }

  main()
    .finally(async () => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
