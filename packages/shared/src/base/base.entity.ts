/**
 * Base entity interface — todos os modelos de domínio herdam estas propriedades.
 * O ID é gerado pelo banco (UUID v4).
 */
export abstract class BaseEntity {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;

  get isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }
}

/**
 * Entidade com isolamento de tenant.
 */
export abstract class TenantEntity extends BaseEntity {
  tenantId!: string;
}
