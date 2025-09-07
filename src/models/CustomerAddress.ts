
import BaseModel from './BaseModel';

export interface ICustomerAddress {
  id?: number;
  customer_id: number;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  type?: 'billing' | 'shipping' | 'both';
  is_default?: boolean;
  metadata?: Record<string, any> | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

class CustomerAddress extends BaseModel<ICustomerAddress> {
  constructor() {
    super('customer_addresses');
  }

  /**
   * Encontra um endereço pelo ID do cliente e tipo
   * @param customerId ID do cliente
   * @param type Tipo de endereço (billing, shipping, both)
   * @returns Promise com o endereço encontrado ou undefined
   */
  async findByCustomerAndType(customerId: string, type: string): Promise<ICustomerAddress | undefined> {
    if (!customerId || !type) return undefined;
    
    return this.db(this.tableName)
      .where('customer_id', customerId)
      .where('type', type.toLowerCase())
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Lista todos os endereços de um cliente
   * @param customerId ID do cliente
   * @returns Lista de endereços do cliente
   */
  async listByCustomer(customerId: string): Promise<ICustomerAddress[]> {
    if (!customerId) return [];
    
    return this.db(this.tableName)
      .where('customer_id', customerId)
      .whereNull('deleted_at')
      .orderBy('is_default', 'desc')
      .orderBy('created_at', 'asc');
  }

  /**
   * Define um endereço como padrão para o cliente
   * @param id ID do endereço
   * @param customerId ID do cliente
   * @returns Promise com o endereço atualizado
   */
  async setAsDefault(id: string, customerId: string): Promise<ICustomerAddress> {
    if (!id || !customerId) {
      throw new Error('ID do endereço e ID do cliente são obrigatórios');
    }

    // Inicia uma transação
    const trx = await this.db.transaction();

    try {
      // Remove o status de padrão de todos os endereços do cliente
      await trx(this.tableName)
        .where('customer_id', customerId)
        .update({ is_default: false });

      // Define o endereço como padrão
      const [updatedAddress] = await trx(this.tableName)
        .where({ id, customer_id: customerId })
        .update({ is_default: true, updated_at: new Date() }, ['*']);

      await trx.commit();
      return updatedAddress;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

export default new CustomerAddress();
