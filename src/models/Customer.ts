import BaseModel from './BaseModel';

export type CustomerStatus = 'active' | 'inactive' | 'suspended';

export interface ICustomer {
  id?: number;
  company_id: number;
  name: string;
  email: string;
  phone?: string | null;
  document?: string | null;
  status?: CustomerStatus;
  metadata?: Record<string, any> | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

class Customer extends BaseModel<ICustomer> {
  constructor() {
    super('customers');
  }

  /**
   * Encontra um cliente pelo email
   * @param email Email do cliente
   * @returns Promise com o cliente encontrado ou undefined
   */
  async findByEmail(email: string): Promise<ICustomer | undefined> {
    if (!email) return undefined;
    return this.db(this.tableName)
      .where('email', email.toLowerCase().trim())
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Encontra um cliente pelo ID
   * @param id ID do cliente
   * @returns Promise com o cliente encontrado ou undefined
   */
  async findById(id: number): Promise<ICustomer | undefined> {
    if (!id) return undefined;
    return this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Encontra clientes pelo ID da empresa
   * @param companyId ID da empresa
   * @returns Promise com a lista de clientes da empresa
   */
  async findByCompanyId(companyId: number): Promise<ICustomer[]> {
    if (!companyId) return [];
    return this.db(this.tableName)
      .where('company_id', companyId)
      .whereNull('deleted_at');
  }

  /**
   * Verifica se um email já está em uso por outro cliente
   * @param email Email a ser verificado
   * @param excludeId ID do cliente a ser excluído da verificação (para atualização)
   * @returns Promise<boolean> true se o email já estiver em uso
   */
  async isEmailInUse(email: string, excludeId?: number): Promise<boolean> {
    if (!email) return false;
    const query = this.db(this.tableName)
      .where('email', email.toLowerCase().trim())
      .whereNull('deleted_at');

    if (excludeId) {
      query.whereNot('id', excludeId);
    }

    const result = await query.first();
    return !!result;
  }
}

export default new Customer();