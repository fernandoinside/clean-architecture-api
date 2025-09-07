import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { DatabaseError, NotFoundError, ValidationError } from '../utils/errors';
import BaseService from './BaseService';

class UserService extends BaseService<IUser> {
  constructor() {
    super(new User());
  }

  /**
   * Cria um novo usuário com validações adicionais
   * @param data Dados do usuário
   * @returns Usuário criado
   */
  async create(data: Omit<IUser, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IUser> {
    if (!data || !data.username || !data.email || !data.password || !data.role_id) {
      throw new ValidationError('Nome de usuário, e-mail, senha e ID do papel são obrigatórios');
    }

    try {
      const normalizedEmail = data.email.toLowerCase().trim();
      const existingUsername = await this.model.db(this.model.tableName).where({ username: data.username }).first();
      if (existingUsername) {
        throw new ValidationError('Nome de usuário já existe');
      }
      const existingEmail = await this.model.db(this.model.tableName).where({ email: normalizedEmail }).first();
      if (existingEmail) {
        throw new ValidationError('E-mail já existe');
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const userData = { ...data, email: normalizedEmail, password: hashedPassword };
      const result = await super.create(userData);
      if (!result) {
        throw new DatabaseError('Falha ao criar usuário');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar usuário', error as Error);
    }
  }

  /**
   * Atualiza um usuário existente
   * @param id ID do usuário
   * @param data Dados para atualização
   * @returns Usuário atualizado
   */
  async update(id: number, data: Partial<Omit<IUser, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IUser> {
    if (!id) {
      throw new ValidationError('ID do usuário não fornecido');
    }

    try {
      const existingUser = await this.findById(id);

      if (data.username && data.username !== existingUser.username) {
        const existingUsername = await this.model.db(this.model.tableName).where({ username: data.username }).whereNot('id', id).first();
        if (existingUsername) {
          throw new ValidationError('Nome de usuário já existe');
        }
      }

      if (data.email && data.email !== existingUser.email) {
        const normalizedEmail = data.email.toLowerCase().trim();
        const existingEmail = await this.model.db(this.model.tableName).where({ email: normalizedEmail }).whereNot('id', id).first();
        if (existingEmail) {
          throw new ValidationError('E-mail já existe');
        }
        data.email = normalizedEmail;
      }

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar usuário');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar usuário', error as Error);
    }
  }

  /**
   * Busca um usuário pelo ID
   * @param id ID do usuário
   * @returns Usuário encontrado
   */
  async findById(id: number): Promise<IUser> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Usuário não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar usuário', error as Error);
    }
  }

  /**
   * Remove um usuário (soft delete)
   * @param id ID do usuário
   * @returns true se o usuário foi removido com sucesso
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await super.delete(id);
      if (result) {
        await this.invalidateCache();
        return true;
      }
      return false;
    } catch (error) {
      throw new DatabaseError('Erro ao remover usuário', error as Error);
    }
  }

  /**
   * Busca usuários com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de usuários
   */
  async search(filters: { username?: string; email?: string; first_name?: string; last_name?: string; isActive?: boolean; role_id?: number }, page = 1, limit = 10) {
    try {
      const { username, email, first_name, last_name, isActive, role_id } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (username) {
        query.where('username', 'ilike', `%${username}%`);
      }
      if (email) {
        query.where('email', 'ilike', `%${email}%`);
      }
      if (first_name) {
        query.where('first_name', 'ilike', `%${first_name}%`);
      }
      if (last_name) {
        query.where('last_name', 'ilike', `%${last_name}%`);
      }
      if (typeof isActive === 'boolean') {
        query.where('isActive', isActive);
      }
      if (role_id) {
        query.where('role_id', role_id);
      }

      const offset = (page - 1) * limit;

      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('username', 'asc');

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
      throw new DatabaseError('Erro ao buscar usuários', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { UserService };

// Exporta uma instância padrão para uso comum
const userServiceInstance = new UserService();
export default userServiceInstance;