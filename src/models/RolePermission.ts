import BaseModel from './BaseModel';

export interface IRolePermission {
  id?: number;
  role_id: number;
  permission_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface IRolePermissionDetailed {
  id?: number;
  role_id: number;
  role_name: string;
  permission_id: number;
  permission_name: string;
  permission_resource: string;
  permission_action: string;
  permission_description?: string;
  created_at?: string;
  updated_at?: string;
}

export class RolePermission extends BaseModel<IRolePermission> {
  constructor() {
    super('role_permissions');
  }

  /**
   * Busca role_permissions com dados detalhados (joins)
   */
  async findDetailed(): Promise<IRolePermissionDetailed[]> {
    return this.db(this.tableName)
      .join('roles', 'role_permissions.role_id', 'roles.id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .select(
        'role_permissions.id',
        'role_permissions.role_id',
        'roles.name as role_name',
        'role_permissions.permission_id',
        'permissions.name as permission_name',
        'permissions.resource as permission_resource',
        'permissions.action as permission_action',
        'permissions.description as permission_description',
        'role_permissions.created_at',
        'role_permissions.updated_at'
      );
  }

  /**
   * Busca permissões de um papel específico
   */
  async findByRoleId(roleId: number): Promise<IRolePermissionDetailed[]> {
    return this.db(this.tableName)
      .join('roles', 'role_permissions.role_id', 'roles.id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', roleId)
      .select(
        'role_permissions.id',
        'role_permissions.role_id',
        'roles.name as role_name',
        'role_permissions.permission_id',
        'permissions.name as permission_name',
        'permissions.resource as permission_resource',
        'permissions.action as permission_action',
        'permissions.description as permission_description',
        'role_permissions.created_at',
        'role_permissions.updated_at'
      );
  }

  /**
   * Busca papéis que têm uma permissão específica
   */
  async findByPermissionId(permissionId: number): Promise<IRolePermissionDetailed[]> {
    return this.db(this.tableName)
      .join('roles', 'role_permissions.role_id', 'roles.id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.permission_id', permissionId)
      .select(
        'role_permissions.id',
        'role_permissions.role_id',
        'roles.name as role_name',
        'role_permissions.permission_id',
        'permissions.name as permission_name',
        'permissions.resource as permission_resource',
        'permissions.action as permission_action',
        'permissions.description as permission_description',
        'role_permissions.created_at',
        'role_permissions.updated_at'
      );
  }

  /**
   * Verifica se uma associação role-permission já existe
   */
  async exists(roleId: number, permissionId: number): Promise<boolean> {
    const result = await this.db(this.tableName)
      .where({ role_id: roleId, permission_id: permissionId })
      .first();
    return !!result;
  }

  /**
   * Remove todas as permissões de um papel
   */
  async removeAllByRoleId(roleId: number): Promise<number> {
    return this.db(this.tableName)
      .where('role_id', roleId)
      .del();
  }

  /**
   * Remove todos os papéis de uma permissão
   */
  async removeAllByPermissionId(permissionId: number): Promise<number> {
    return this.db(this.tableName)
      .where('permission_id', permissionId)
      .del();
  }
}

export default new RolePermission();