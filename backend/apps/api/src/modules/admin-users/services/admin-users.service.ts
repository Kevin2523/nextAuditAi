import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../persistence/prisma/prisma.service';
import { UserPasswordService } from '../../iam/services/user-password.service';
import { Role } from '../../../common/enums/role.enum';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dto/update-admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPasswordService: UserPasswordService,
  ) {}

  async listUsers(tenantId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
      include: {
        role: true,
        user: true,
      },
    });

    return {
      users: memberships.map((membership: { id: string; user: { id: string; email: string; displayName: string; isActive: boolean; createdAt: Date; updatedAt: Date }; role: { code: string } }) => ({
        id: membership.user.id,
        membershipId: membership.id,
        email: membership.user.email,
        displayName: membership.user.displayName,
        role: membership.role.code,
        isActive: membership.user.isActive,
        createdAt: membership.user.createdAt,
        updatedAt: membership.user.updatedAt,
      })),
    };
  }

  async createUser(tenantId: string, dto: CreateAdminUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { memberships: { where: { tenantId } } },
    });

    if (existingUser?.memberships.length) {
      throw new ConflictException('El usuario ya pertenece a este tenant.');
    }

    const role = await this.findRole(dto.role);
    const passwordHash = await this.userPasswordService.hashPassword(dto.password);

    const user = await this.prisma.user.upsert({
      where: { email: dto.email.toLowerCase().trim() },
      update: {
        displayName: dto.displayName.trim(),
        isActive: dto.isActive ?? true,
      },
      create: {
        email: dto.email.toLowerCase().trim(),
        displayName: dto.displayName.trim(),
        passwordHash,
        isActive: dto.isActive ?? true,
      },
    });

    await this.prisma.membership.create({
      data: {
        tenantId,
        userId: user.id,
        roleId: role.id,
      },
    });

    return this.findUserInTenant(tenantId, user.id);
  }

  async updateUser(tenantId: string, actorUserId: string, userId: string, dto: UpdateAdminUserDto) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Usuario no encontrado en este tenant.');
    }

    if (actorUserId === userId && (dto.role !== undefined || dto.isActive !== undefined)) {
      throw new BadRequestException('No puedes cambiar tu propio rol ni desactivar tu propia cuenta.');
    }

    if (dto.displayName !== undefined || dto.isActive !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          displayName: dto.displayName?.trim(),
          isActive: dto.isActive,
        },
      });
    }

    if (dto.role) {
      const role = await this.findRole(dto.role);
      await this.prisma.membership.update({
        where: {
          tenantId_userId: {
            tenantId,
            userId,
          },
        },
        data: { roleId: role.id },
      });
    }

    return this.findUserInTenant(tenantId, userId);
  }

  private async findRole(roleCode: Role) {
    const role = await this.prisma.role.findUnique({
      where: { code: roleCode },
    });

    if (!role) {
      throw new BadRequestException('Rol no configurado.');
    }

    return role;
  }

  private async findUserInTenant(tenantId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      include: {
        role: true,
        user: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Usuario no encontrado en este tenant.');
    }

    return {
      id: membership.user.id,
      membershipId: membership.id,
      email: membership.user.email,
      displayName: membership.user.displayName,
      role: membership.role.code,
      isActive: membership.user.isActive,
      createdAt: membership.user.createdAt,
      updatedAt: membership.user.updatedAt,
    };
  }
}
