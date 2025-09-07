import { UserRole, IUserRole, IUserRoleDetailed } from '../models/UserRole';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError, ConflictError } from '../utils/errors';

class UserRoleService extends BaseService<IUserRole> {
  constructor() {
    super(new UserRole());
  }

  /**
   * Busca todas as associações user-role com detalhes
   */
  async findAllDetailed(): Promise<IUserRoleDetailed[]> {
    try {
      return await (this.model as UserRole).findDetailed();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar associações user-role', error as Error);
    }
  }

  /**
   * Busca roles de um usuário específico
   */
  async findRolesByUserId(userId: number): Promise<IUserRoleDetailed[]> {
    if (!userId) {
      throw new ValidationError('ID do usuário não fornecido');
    }

    try {
      return await (this.model as UserRole).findByUserId(userId);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar roles do usuário', error as Error);
    }
  }

  /**
   * Busca usuários de um role específico
   */
  async findUsersByRoleId(roleId: number): Promise<IUserRoleDetailed[]> {
    if (!roleId) {
      throw new ValidationError('ID do role não fornecido');
    }

    try {
      return await (this.model as UserRole).findByRoleId(roleId);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar usuários do role', error as Error);
    }
  }

  /**
   * Cria uma nova associação user-role
   */
  async create(data: Omit<IUserRole, 'id' | 'created_at' | 'updated_at'>): Promise<IUserRole> {
    if (!data || !data.user_id || !data.role_id) {
      throw new ValidationError('User ID e Role ID são obrigatórios');
    }

    try {
      // Verificar se a associação já existe
      const exists = await (this.model as UserRole).exists(data.user_id, data.role_id);
      if (exists) {
        throw new ConflictError('Esta associação user-role já existe');
      }

      // Verificar se user e role existem
      const userExists = await this.model.db('users').where('id', data.user_id).whereNull('deleted_at').first();
      if (!userExists) {
        throw new NotFoundError('Usuário não encontrado');
      }

      const roleExists = await this.model.db('roles').where('id', data.role_id).first();
      if (!roleExists) {
        throw new NotFoundError('Role não encontrado');
      }

      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar associação user-role');
      }

      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro ao criar associação user-role', error as Error);
    }
  }

  /**
   * Remove uma associação user-role
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
      throw new DatabaseError('Erro ao remover associação user-role', error as Error);
    }
  }

  /**
   * Remove uma associação específica por user_id e role_id
   */
  async deleteByUserAndRole(userId: number, roleId: number): Promise<boolean> {
    if (!userId || !roleId) {
      throw new ValidationError('User ID e Role ID são obrigatórios');
    }

    try {
      const deletedCount = await this.model.db(this.model.tableName)
        .where({ user_id: userId, role_id: roleId })
        .whereNull('deleted_at')
        .update({ deleted_at: new Date() });

      if (deletedCount > 0) {
        await this.invalidateCache();
        return true;
      }
      return false;
    } catch (error) {
      throw new DatabaseError('Erro ao remover associação user-role', error as Error);
    }
  }

  /**
   * Define todos os roles de um usuário (remove existentes e adiciona novos)
   */
  async setUserRoles(userId: number, roleIds: number[]): Promise<IUserRoleDetailed[]> {
    if (!userId) {
      throw new ValidationError('ID do usuário não fornecido');
    }

    if (!Array.isArray(roleIds)) {
      throw new ValidationError('Lista de roles deve ser um array');
    }

    try {
      // Verificar se o usuário existe
      const userExists = await this.model.db('users').where('id', userId).whereNull('deleted_at').first();
      if (!userExists) {
        throw new NotFoundError('Usuário não encontrado');
      }

      // Verificar se todos os roles existem
      if (roleIds.length > 0) {
        const existingRoles = await this.model.db('roles')
          .whereIn('id', roleIds)
          .select('id');
        
        if (existingRoles.length !== roleIds.length) {
          throw new ValidationError('Um ou mais roles não foram encontrados');
        }
      }

      // Remover todos os roles existentes do usuário
      await (this.model as UserRole).removeAllByUserId(userId);

      // Adicionar os novos roles
      if (roleIds.length > 0) {
        const newAssociations = roleIds.map(roleId => ({
          user_id: userId,
          role_id: roleId
        }));

        await this.model.db(this.model.tableName).insert(newAssociations);
      }

      await this.invalidateCache();

      // Retornar as associações atualizadas
      return await this.findRolesByUserId(userId);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro ao definir roles do usuário', error as Error);
    }
  }

  /**
   * Busca com filtros e paginação
   */
  async search(
    filters: {
      user_id?: number;
      role_id?: number;
      user_name?: string;
      role_name?: string;
    } = {},
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const { user_id, role_id, user_name, role_name } = filters;
      
      let query = this.model.db(this.model.tableName)
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

      if (user_id) {
        query = query.where('user_roles.user_id', user_id);
      }
      if (role_id) {
        query = query.where('user_roles.role_id', role_id);
      }
      if (user_name) {
        query = query.where('users.username', 'ilike', `%${user_name}%`);
      }
      if (role_name) {
        query = query.where('roles.name', 'ilike', `%${role_name}%`);
      }

      const offset = (page - 1) * limit;
      
      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .offset(offset)
        .limit(limit)
        .orderBy('users.username', 'asc')
        .orderBy('roles.name', 'asc');

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
      throw new DatabaseError('Erro ao buscar associações user-role', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { UserRoleService };

// Exporta uma instância padrão para uso comum
const userRoleServiceInstance = new UserRoleService();
export default userRoleServiceInstance;