import BaseModel from './BaseModel';
import Knex from 'knex';

export interface IUserRole {
  id?: number;
  user_id: number;
  role_id: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface IUserRoleDetailed extends IUserRole {
  user_name?: string;
  user_email?: string;
  role_name?: string;
  role_description?: string;
}

export class UserRole extends BaseModel<IUserRole> {
  constructor() {
    super('user_roles');
  }

  /**
   * Busca associações user-role com dados detalhados
   */
  async findDetailed(): Promise<IUserRoleDetailed[]> {
    return this.db(this.tableName)
      .join('users', 'user_roles.user_id', 'users.id')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select(
        'user_roles.id',
        'user_roles.user_id',
        'users.username as user_name',
        'users.email as user_email',
        'user_roles.role_id',
        'roles.name as role_name',
        'roles.description as role_description',
        'user_roles.created_at',
        'user_roles.updated_at'
      )
      .whereNull('user_roles.deleted_at')
      .whereNull('users.deleted_at')
      .whereNull('roles.deleted_at');
  }

  /**
   * Busca todos os roles de um usuário específico
   */
  async findByUserId(userId: number): Promise<IUserRoleDetailed[]> {
    return this.db(this.tableName)
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select(
        'user_roles.id',
        'user_roles.user_id',
        'user_roles.role_id',
        'roles.name as role_name',
        'roles.description as role_description',
        'user_roles.created_at',
        'user_roles.updated_at'
      )
      .where('user_roles.user_id', userId)
      .whereNull('user_roles.deleted_at')
      .whereNull('roles.deleted_at');
  }

  /**
   * Busca todos os usuários de um role específico
   */
  async findByRoleId(roleId: number): Promise<IUserRoleDetailed[]> {
    return this.db(this.tableName)
      .join('users', 'user_roles.user_id', 'users.id')
      .select(
        'user_roles.id',
        'user_roles.user_id',
        'users.username as user_name',
        'users.email as user_email',
        'user_roles.role_id',
        'user_roles.created_at',
        'user_roles.updated_at'
      )
      .where('user_roles.role_id', roleId)
      .whereNull('user_roles.deleted_at')
      .whereNull('users.deleted_at');
  }

  /**
   * Verifica se existe uma associação user-role
   */
  async exists(userId: number, roleId: number): Promise<boolean> {
    const result = await this.db(this.tableName)
      .where({ user_id: userId, role_id: roleId })
      .whereNull('deleted_at')
      .first();
    return !!result;
  }

  /**
   * Remove todas as associações de um usuário
   */
  async removeAllByUserId(userId: number): Promise<void> {
    await this.db(this.tableName)
      .where({ user_id: userId })
      .update({ deleted_at: new Date() });
  }

  /**
   * Remove todas as associações de um role
   */
  async removeAllByRoleId(roleId: number): Promise<void> {
    await this.db(this.tableName)
      .where({ role_id: roleId })
      .update({ deleted_at: new Date() });
  }
}

export default UserRole;