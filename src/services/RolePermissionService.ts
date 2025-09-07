import { RolePermission, IRolePermission, IRolePermissionDetailed } from '../models/RolePermission';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError, ConflictError } from '../utils/errors';

class RolePermissionService extends BaseService<IRolePermission> {
  constructor() {
    super(new RolePermission());
  }

  /**
   * Busca todas as associações role-permission com detalhes
   */
  async findAllDetailed(): Promise<IRolePermissionDetailed[]> {
    try {
      return await (this.model as RolePermission).findDetailed();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar associações role-permission', error as Error);
    }
  }

  /**
   * Busca permissões de um papel específico
   */
  async findPermissionsByRoleId(roleId: number): Promise<IRolePermissionDetailed[]> {
    if (!roleId) {
      throw new ValidationError('ID do papel não fornecido');
    }

    try {
      return await (this.model as RolePermission).findByRoleId(roleId);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar permissões do papel', error as Error);
    }
  }

  /**
   * Busca papéis que têm uma permissão específica
   */
  async findRolesByPermissionId(permissionId: number): Promise<IRolePermissionDetailed[]> {
    if (!permissionId) {
      throw new ValidationError('ID da permissão não fornecido');
    }

    try {
      return await (this.model as RolePermission).findByPermissionId(permissionId);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar papéis da permissão', error as Error);
    }
  }

  /**
   * Cria uma nova associação role-permission
   */
  async create(data: Omit<IRolePermission, 'id' | 'created_at' | 'updated_at'>): Promise<IRolePermission> {
    if (!data || !data.role_id || !data.permission_id) {
      throw new ValidationError('Role ID e Permission ID são obrigatórios');
    }

    try {
      // Verificar se a associação já existe
      const exists = await (this.model as RolePermission).exists(data.role_id, data.permission_id);
      if (exists) {
        throw new ConflictError('Esta associação role-permission já existe');
      }

      // Verificar se role e permission existem
      const roleExists = await this.model.db('roles').where('id', data.role_id).first();
      if (!roleExists) {
        throw new NotFoundError('Papel não encontrado');
      }

      const permissionExists = await this.model.db('permissions').where('id', data.permission_id).first();
      if (!permissionExists) {
        throw new NotFoundError('Permissão não encontrada');
      }

      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar associação role-permission');
      }

      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro ao criar associação role-permission', error as Error);
    }
  }

  /**
   * Remove uma associação role-permission
   */
  async delete(id: number): Promise<boolean> {
    if (!id) {
      throw new ValidationError('ID da associação não fornecido');
    }

    try {
      const result = await super.delete(id);
      if (result) {
        await this.invalidateCache();
        return true;
      }
      return false;
    } catch (error) {
      throw new DatabaseError('Erro ao remover associação role-permission', error as Error);
    }
  }

  /**
   * Remove uma associação específica por role_id e permission_id
   */
  async deleteByRoleAndPermission(roleId: number, permissionId: number): Promise<boolean> {
    if (!roleId || !permissionId) {
      throw new ValidationError('Role ID e Permission ID são obrigatórios');
    }

    try {
      const deletedCount = await this.model.db(this.model.tableName)
        .where({ role_id: roleId, permission_id: permissionId })
        .del();

      if (deletedCount > 0) {
        await this.invalidateCache();
        return true;
      }
      return false;
    } catch (error) {
      throw new DatabaseError('Erro ao remover associação role-permission', error as Error);
    }
  }

  /**
   * Define todas as permissões de um papel (remove existentes e adiciona novas)
   */
  async setRolePermissions(roleId: number, permissionIds: number[]): Promise<IRolePermissionDetailed[]> {
    if (!roleId) {
      throw new ValidationError('ID do papel não fornecido');
    }

    if (!Array.isArray(permissionIds)) {
      throw new ValidationError('Lista de permissões deve ser um array');
    }

    try {
      // Verificar se o papel existe
      const roleExists = await this.model.db('roles').where('id', roleId).first();
      if (!roleExists) {
        throw new NotFoundError('Papel não encontrado');
      }

      // Verificar se todas as permissões existem
      if (permissionIds.length > 0) {
        const existingPermissions = await this.model.db('permissions')
          .whereIn('id', permissionIds)
          .select('id');
        
        if (existingPermissions.length !== permissionIds.length) {
          throw new ValidationError('Uma ou mais permissões não foram encontradas');
        }
      }

      // Remover todas as permissões existentes do papel
      await (this.model as RolePermission).removeAllByRoleId(roleId);

      // Adicionar as novas permissões
      if (permissionIds.length > 0) {
        const newAssociations = permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId
        }));

        await this.model.db(this.model.tableName).insert(newAssociations);
      }

      await this.invalidateCache();

      // Retornar as associações atualizadas
      return await this.findPermissionsByRoleId(roleId);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro ao definir permissões do papel', error as Error);
    }
  }

  /**
   * Busca com filtros e paginação
   */
  async search(
    filters: {
      role_id?: number;
      permission_id?: number;
      role_name?: string;
      permission_name?: string;
      resource?: string;
    } = {},
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const { role_id, permission_id, role_name, permission_name, resource } = filters;
      
      let query = this.model.db(this.model.tableName)
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

      if (role_id) {
        query = query.where('role_permissions.role_id', role_id);
      }
      if (permission_id) {
        query = query.where('role_permissions.permission_id', permission_id);
      }
      if (role_name) {
        query = query.where('roles.name', 'ilike', `%${role_name}%`);
      }
      if (permission_name) {
        query = query.where('permissions.name', 'ilike', `%${permission_name}%`);
      }
      if (resource) {
        query = query.where('permissions.resource', 'ilike', `%${resource}%`);
      }

      const offset = (page - 1) * limit;
      
      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .offset(offset)
        .limit(limit)
        .orderBy('roles.name', 'asc')
        .orderBy('permissions.name', 'asc');

      const [data, total] = await Promise.all([dataQuery, countQuery]);
      const totalCount = Number(total?.count) || 0;

      return {
        data,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError('Erro ao buscar associações role-permission', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { RolePermissionService };

// Exporta uma instância padrão para uso comum
const rolePermissionServiceInstance = new RolePermissionService();
export default rolePermissionServiceInstance;