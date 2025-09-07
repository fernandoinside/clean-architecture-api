import CustomerAddress, { ICustomerAddress } from '../models/CustomerAddress';

type AddressType = 'billing' | 'shipping' | 'both';

interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

interface ISearchFilters {
  customer_id?: number;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  type?: string;
  is_default?: boolean;
}
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';
import logger from '../config/logger';

class CustomerAddressService extends BaseService<ICustomerAddress> {
  constructor() {
    super(CustomerAddress);
  }

  /**
   * Cria um novo endereço de cliente com validações adicionais
   * @param data Dados do endereço
   * @returns Endereço criado
   * @throws {ValidationError} Se os dados forem inválidos
   * @throws {DatabaseError} Se ocorrer um erro no banco de dados
   */
  async create(data: any): Promise<ICustomerAddress> {
    try {
      // Validações iniciais
      if (!data) {
        logger.error('Dados do endereço não fornecidos');
        throw new ValidationError('Dados do endereço não fornecidos');
      }

      logger.info('Dados recebidos na criação de endereço:', JSON.stringify(data, null, 2));
      
      // Mapeia os campos de camelCase para snake_case
      const createData: any = {};
      
      if (data.customerId !== undefined || data.customer_id !== undefined) {
        createData.customer_id = data.customerId || data.customer_id;
      }
      if (data.street !== undefined) createData.street = data.street;
      if (data.number !== undefined) createData.number = data.number;
      if (data.complement !== undefined) createData.complement = data.complement;
      if (data.neighborhood !== undefined) createData.neighborhood = data.neighborhood;
      if (data.city !== undefined) createData.city = data.city;
      if (data.state !== undefined) createData.state = data.state;
      if (data.zipCode !== undefined || data.zip_code !== undefined) {
        createData.zip_code = (data.zipCode || data.zip_code).replace(/\D/g, '');
      }
      if (data.country !== undefined) createData.country = data.country;
      if (data.type !== undefined) createData.type = data.type;
      if (data.isDefault !== undefined || data.is_default !== undefined) {
        createData.is_default = data.isDefault !== undefined ? data.isDefault : data.is_default;
      }

      // Se for para criar como endereço padrão, desativa os outros padrões
      if (createData.is_default === true) {
        await this.model.db(this.model.tableName)
          .where({ 
            customer_id: createData.customer_id,
            is_default: true
          })
          .update({ 
            is_default: false,
            updated_at: new Date()
          });
      }

      logger.info(`Criando novo endereço para o cliente ${createData.customer_id}`, { customer_id: createData.customer_id });
      
      const result = await super.create(createData);
      
      if (!result) {
        throw new DatabaseError('Falha ao criar endereço do cliente');
      }

      await this.invalidateCache();
      logger.info(`Endereço ${result.id} criado com sucesso para o cliente ${data.customer_id}`);
      
      return result;
    } catch (error) {
      logger.error('Erro ao criar endereço do cliente:', { error, customer_id: data?.customer_id });
      
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      throw new DatabaseError('Erro ao criar endereço do cliente', error as Error);
    }
  }

  /**
   * Atualiza um endereço de cliente existente
   * @param id ID do endereço
   * @param data Dados para atualização
   * @returns Endereço atualizado
   * @throws {ValidationError} Se os dados forem inválidos
   * @throws {NotFoundError} Se o endereço não for encontrado
   * @throws {DatabaseError} Se ocorrer um erro no banco de dados
   */
  async update(id: number, data: any): Promise<ICustomerAddress> {
    // Validações iniciais
    if (!data) {
      throw new ValidationError('Dados do endereço não fornecidos');
    }

    // Mapeia os campos de camelCase para snake_case
    const updateData: any = {};
    
    if (data.customerId !== undefined || data.customer_id !== undefined) {
      updateData.customer_id = data.customerId || data.customer_id;
    }
    if (data.street !== undefined) updateData.street = data.street;
    if (data.number !== undefined) updateData.number = data.number;
    if (data.complement !== undefined) updateData.complement = data.complement;
    if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zipCode !== undefined || data.zip_code !== undefined) {
      updateData.zip_code = (data.zipCode || data.zip_code).replace(/\D/g, '');
    }
    if (data.country !== undefined) updateData.country = data.country;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.isDefault !== undefined || data.is_default !== undefined) {
      updateData.is_default = data.isDefault !== undefined ? data.isDefault : data.is_default;
    }

    // Verifica se o endereço existe
    const address = await this.findById(id);
    if (!address) {
      throw new NotFoundError('Endereço não encontrado');
    }

    try {
      logger.info(`Atualizando endereço ${id}`, { address_id: id, update_data: data });
      
      // Busca o endereço existente
      const existingAddress = await this.findById(id);
      if (!existingAddress) {
        throw new NotFoundError('Endereço não encontrado');
      }

      // Validações de campos, se fornecidos
      const updateData: Partial<ICustomerAddress> = { ...data };
      
      // Normaliza o CEP se fornecido
      if (updateData.zip_code) {
        updateData.zip_code = updateData.zip_code.replace(/\D/g, '');
      }

      // Validação do tipo de endereço
      if (updateData.type) {
        const validTypes = ['billing', 'shipping', 'both'] as const;
        if (!validTypes.includes(updateData.type as any)) {
          throw new ValidationError(`Tipo de endereço inválido. Valores aceitos: ${validTypes.join(', ')}`);
        }
      }

      // Se for para atualizar para endereço padrão, desativa os outros padrões
      if (updateData.is_default === true && existingAddress.is_default !== true) {
        logger.info(`Definindo endereço ${id} como padrão para o cliente ${existingAddress.customer_id}`, {
          address_id: id,
          customer_id: existingAddress.customer_id
        });
        
        await this.model.db(this.model.tableName)
          .where('customer_id', existingAddress.customer_id)
          .where('id', '!=', id)
          .where('is_default', true)
          .update({ 
            is_default: false,
            updated_at: new Date()
          });
      }

      // Atualiza o endereço
      const updatedAddress = await super.update(id, updateData);
      
      if (!updatedAddress) {
        throw new DatabaseError('Falha ao atualizar endereço do cliente');
      }

      await this.invalidateCache();
      logger.info(`Endereço ${id} atualizado com sucesso`, { address_id: id });
      
      return updatedAddress;
    } catch (error) {
      logger.error(`Erro ao atualizar endereço ${id}:`, { 
        error, 
        address_id: id,
        update_data: data 
      });
      
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      throw new DatabaseError('Erro ao atualizar endereço do cliente', error as Error);
    }
  }

  /**
   * Busca um endereço pelo ID
   * @param id ID do endereço
   * @returns Endereço encontrado
   */
  async findById(id: number): Promise<ICustomerAddress> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Endereço do cliente não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar endereço do cliente', error as Error);
    }
  }

  /**
   * Exclui um endereço de cliente (soft delete)
   * @param id ID do endereço a ser excluído
   * @returns Verdadeiro se a exclusão for bem-sucedida
   * @throws {ValidationError} Se o ID não for fornecido
   * @throws {NotFoundError} Se o endereço não for encontrado
   * @throws {DatabaseError} Se ocorrer um erro no banco de dados
   */
  async delete(id: number): Promise<boolean> {
    // Validações iniciais
    if (!id) {
      throw new ValidationError('ID do endereço não fornecido');
    }

    try {
      logger.info(`Iniciando exclusão do endereço ${id}`, { address_id: id });
      
      // Verifica se o endereço existe antes de tentar excluir
      const existingAddress = await this.findById(id);
      if (!existingAddress) {
        throw new NotFoundError('Endereço não encontrado');
      }

      // Verifica se é o último endereço do cliente
      const otherAddresses = await this.model.db(this.model.tableName)
        .where('customer_id', existingAddress.customer_id)
        .where('id', '!=', id)
        .whereNull('deleted_at')
        .count('id as count')
        .first();

      if (parseInt(otherAddresses?.count as any, 10) === 0) {
        throw new ValidationError('Não é possível excluir o único endereço do cliente');
      }

      // Realiza a exclusão lógica (soft delete)
      const result = await super.delete(id);
      
      if (!result) {
        throw new DatabaseError('Falha ao excluir endereço do cliente');
      }

      // Se o endereço excluído era o padrão, define outro como padrão
      if (existingAddress.is_default) {
        logger.info(`Definindo novo endereço padrão para o cliente ${existingAddress.customer_id}`, {
          customer_id: existingAddress.customer_id,
          deleted_address_id: id
        });
        
        // Define o primeiro endereço disponível como padrão
        const newDefault = await this.model.db(this.model.tableName)
          .where('customer_id', existingAddress.customer_id)
          .where('id', '!=', id)
          .whereNull('deleted_at')
          .orderBy('created_at', 'asc')
          .first();

        if (newDefault) {
          await this.model.db(this.model.tableName)
            .where('id', newDefault.id)
            .update({ 
              is_default: true,
              updated_at: new Date()
            });
        }
      }

      await this.invalidateCache();
      logger.info(`Endereço ${id} excluído com sucesso`, { address_id: id });
      
      return true;
    } catch (error) {
      logger.error(`Erro ao excluir endereço ${id}:`, { 
        error, 
        address_id: id 
      });
      
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      throw new DatabaseError('Erro ao excluir endereço do cliente', error as Error);
    }
  }

  /**
   * Busca endereços com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de endereços
   */
  async search(filters: ISearchFilters, page = 1, limit = 10): Promise<{ data: ICustomerAddress[]; pagination: IPagination }> {
    try {
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (filters.customer_id) {
        query.where('customer_id', filters.customer_id);
      }
      if (filters.street) {
        query.where('street', 'ilike', `%${filters.street}%`);
      }
      if (filters.city) {
        query.where('city', 'ilike', `%${filters.city}%`);
      }
      if (filters.state) {
        query.where('state', 'ilike', `%${filters.state}%`);
      }
      if (filters.zip_code) {
        query.where('zip_code', 'ilike', `%${filters.zip_code}%`);
      }
      if (filters.country) {
        query.where('country', 'ilike', `%${filters.country}%`);
      }
      if (filters.type) {
        query.where('type', filters.type);
      }
      if (typeof filters.is_default === 'boolean') {
        query.where('is_default', filters.is_default);
      }

      const offset = (page - 1) * limit;
      
      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('created_at', 'desc');

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
      throw new DatabaseError('Erro ao buscar endereços de clientes', error as Error);
    }
  }

  /**
   * Encontra um endereço pelo ID do cliente e tipo
   * @param customer_id ID do cliente
   * @param type Tipo de endereço (billing, shipping, both)
   * @returns Endereço encontrado
   */
  async findByCustomerAndType(customer_id: number, type: string): Promise<ICustomerAddress> {
    if (!customer_id || !type) {
      throw new ValidationError('ID do cliente e tipo são obrigatórios');
    }
    try {
      const result = await this.model.db(this.model.tableName).where({ customer_id, type }).first();
      if (!result) {
        throw new NotFoundError('Endereço não encontrado para o cliente e tipo especificados');
      }
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar endereço por cliente e tipo', error as Error);
    }
  }

  /**
   * Lista todos os endereços de um cliente
   * @param customer_id ID do cliente
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de endereços do cliente
   */
  async listByCustomer(customer_id: number, page = 1, limit = 10): Promise<{ data: ICustomerAddress[]; pagination: IPagination }> {
    if (!customer_id) {
      throw new ValidationError('ID do cliente é obrigatório');
    }
    try {
      const offset = (page - 1) * limit;
      const countQuery = this.model.db(this.model.tableName).where({ customer_id }).count('* as count').first();
      const dataQuery = this.model.db(this.model.tableName).where({ customer_id }).offset(offset).limit(limit).orderBy('created_at', 'desc');

      const [data, total] = await Promise.all([dataQuery, countQuery]);
      const totalCount = Number(total?.count) || 0;

      return { data, pagination: { total: totalCount, page, limit } };
    } catch (error) {
      throw new DatabaseError('Erro ao listar endereços por cliente', error as Error);
    }
  }

  /**
   * Define um endereço como padrão para o cliente
   * @param id ID do endereço
   * @param customer_id ID do cliente
   * @returns Endereço atualizado
   */
  async setAsDefault(id: number, customer_id: number): Promise<ICustomerAddress> {
    if (!id || !customer_id) {
      throw new ValidationError('ID do endereço e ID do cliente são obrigatórios');
    }
    try {
      // Desativa todos os outros endereços padrão para este cliente
      await this.model.db(this.model.tableName).where({ customer_id }).update({ is_default: false });

      // Define o endereço especificado como padrão
      const updatedAddress = await super.update(id, { is_default: true });
      if (!updatedAddress) {
        throw new NotFoundError('Endereço não encontrado para definir como padrão');
      }
      await this.invalidateCache();
      return updatedAddress;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao definir endereço como padrão', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { CustomerAddressService };

// Exporta uma instância padrão para uso comum
const customerAddressService = new CustomerAddressService();
export default customerAddressService;
