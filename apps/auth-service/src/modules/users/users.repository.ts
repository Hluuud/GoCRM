import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@nexcrm/database';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string, tenantId?: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        ...(tenantId ? { memberships: { some: { tenantId } } } : {}),
        deletedAt: null,
      },
      include: {
        memberships: {
          where: { deletedAt: null },
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
            tenant: { select: { id: true, name: true, slug: true, plan: true, isActive: true } },
          },
        },
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        memberships: {
          where: { deletedAt: null },
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
            tenant: { select: { id: true, name: true, slug: true, plan: true, isActive: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException(`Usuário ${id} não encontrado.`);
    return user;
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    tenantId: string;
    roleId: string;
    timezone?: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        timezone: data.timezone ?? 'America/Sao_Paulo',
        memberships: {
          create: {
            tenantId: data.tenantId,
            roleId: data.roleId,
          },
        },
      },
      include: {
        memberships: {
          include: {
            role: true,
            tenant: true,
          },
        },
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, updatedAt: new Date() },
    });
  }

  async markEmailVerified(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, updatedAt: new Date() },
    });
  }

  async enableMfa(userId: string, secret: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true, mfaSecret: secret, updatedAt: new Date() },
    });
  }

  async disableMfa(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null, updatedAt: new Date() },
    });
  }

  async setActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive, updatedAt: new Date() },
    });
  }
}
