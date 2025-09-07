import Customer, { CustomerStatus, ICustomer } from '../models/Customer';
import { DatabaseError, NotFoundError, ValidationError } from '../utils/errors';
import BaseService from './BaseService';

class CustomerService extends BaseService<ICustomer> {
  constructor() {
    super(Customer);
  }

  /**
   * Cria um novo cliente com validações adicionais
   * @param data Dados do cliente
   * @returns Cliente criado
   */
  async create(data: Omit<ICustomer, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<ICustomer> {
    if (!data) {
      throw new ValidationError('Dados do cliente não fornecidos');
    }

    try {
      // Validar campos obrigatórios
      if (!data.email) {
        throw new ValidationError('O email é obrigatório');
      }

      if (!data.name) {
        throw new ValidationError('O nome é obrigatório');
      }

      if (!data.company_id) {
        throw new ValidationError('O ID da empresa é obrigatório');
      }

      // Normalizar email
      const normalizedEmail = data.email.toLowerCase().trim();

      // Verificar unicidade do email
      const isEmailInUse = await ((this.model as any)).isEmailInUse(normalizedEmail);
      if (isEmailInUse) {
        throw new ValidationError('Email já está em uso por outro cliente');
      }

      // Garantir que o status padrão seja 'active' se não informado
      const customerData = {
        ...data,
        email: normalizedEmail,
        name: data.name.trim(),
        status: data.status || 'active' as CustomerStatus,
        // Garantir que campos opcionais sejam null se vazios
        phone: data.phone || null,
        document: data.document || null,
      };

      const result = await super.create(customerData);
      if (!result) {
        throw new DatabaseError('Falha ao criar o cliente');
      }
      await this.invalidateCache();
      return result;
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Erro ao criar cliente', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Atualiza um cliente existente
   * @param id ID do cliente
   * @param data Dados a serem atualizados
   * @returns Cliente atualizado
   */
  async update(id: number, data: Partial<Omit<ICustomer, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<ICustomer> {
    if (!id) {
      throw new ValidationError('ID do cliente não fornecido');
    }

    try {
      // Verificar se o cliente existe
      const existingCustomer = await this.findById(id);

      // Se estiver atualizando o email, verificar se já está em uso
      if (data.email) {
        const normalizedEmail = data.email.toLowerCase().trim();
        const isEmailInUse = await ((this.model as any)).isEmailInUse(normalizedEmail, id);
        if (isEmailInUse) {
          throw new ValidationError('Email já está em uso por outro cliente');
        }
        data.email = normalizedEmail;
      }

      // Garantir que campos opcionais sejam null se vazios
      if (data.phone === '') {
        data.phone = null;
      }

      const updatedCustomer = await super.update(id, data);
      if (!updatedCustomer) {
        throw new DatabaseError('Falha ao atualizar o cliente');
      }
      await this.invalidateCache();
      return updatedCustomer;
    } catch (error: unknown) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro ao atualizar cliente', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Busca um cliente pelo ID
   * @param id ID do cliente
   * @returns Cliente encontrado
   */
  async findById(id: number): Promise<ICustomer> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Cliente não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro ao buscar cliente', error as Error);
    }
  }

  /**
   * Remove um cliente (soft delete)
   * @param id ID do cliente
   * @returns true se o cliente foi removido com sucesso
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
      throw new DatabaseError('Erro ao remover cliente', error as Error);
    }
  }

  /**
   * Busca clientes com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de clientes
   */
  async search(
    filters: {
      name?: string;
      email?: string;
      phone?: string;
      status?: CustomerStatus;
      company_id?: number;
    },
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const { name, email, phone, status, company_id } = filters;
      const query = (this.model as any).db((this.model as any).tableName).whereNull('deleted_at');

      if (name) {
        query.where('name', 'ilike', `%${name}%`);
      }
      if (email) {
        query.where('email', 'ilike', `%${email}%`);
      }
      if (phone) {
        query.where('phone', 'ilike', `%${phone}%`);
      }
      if (status) {
        query.where('status', status);
      }
      if (company_id) {
        query.where('company_id', company_id);
      }

      const countQuery = query.clone().count('* as count').first();
      const offset = (page - 1) * limit;

      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('name', 'asc');

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
      throw new DatabaseError('Erro ao buscar clientes', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { CustomerService };

// Exporta uma instância padrão para uso comum
const customerServiceInstance = new CustomerService();
export default customerServiceInstance;
