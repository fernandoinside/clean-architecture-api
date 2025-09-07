import BaseModel from './BaseModel';

export interface ICompany {
  id?: number;
  name: string;
  email: string;
  document?: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

class Company extends BaseModel<ICompany> {
  constructor() {
    super('companies');
  }

  /**
   * Encontra uma empresa pelo documento (CPF/CNPJ)
   * @param document Número do documento (CPF/CNPJ)
   * @returns Promise com a empresa encontrada ou undefined
   */
  async findByDocument(document: string): Promise<ICompany | undefined> {
    if (!document) return undefined;
    // Remove formatação para busca
    const cleanDocument = document.replace(/\D/g, '');
    return this.db(this.tableName)
      .whereRaw("REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = ?", cleanDocument)
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Encontra uma empresa pelo email
   * @param email Email da empresa
   * @returns Promise com a empresa encontrada ou undefined
   */
  async findByEmail(email: string): Promise<ICompany | undefined> {
    if (!email) return undefined;
    return this.db(this.tableName)
      .where('email', email.toLowerCase().trim())
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Encontra uma empresa pelo ID
   * @param id ID da empresa
   * @returns Promise com a empresa encontrada ou undefined
   */
  async findById(id: number): Promise<ICompany | undefined> {
    if (!id) return undefined;
    return this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  /**
   * Lista empresas com paginação
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @param status Filtro por status
   * @returns Promise com lista de empresas e metadados de paginação
   */
  async listPaginated(page: number = 1, limit: number = 10, status?: string) {
    const offset = (page - 1) * limit;
    
    const query = this.db(this.tableName).whereNull('deleted_at');
    
    if (status) {
      query.where('status', status);
    }

    // Clonar a query para contar o total sem afetar a paginação
    const countQuery = query.clone().clearSelect().count('* as count').first();
    const dataQuery = query
      .clone()
      .select('*')
      .offset(offset)
      .limit(limit)
      .orderBy('name', 'asc');

    const [data, total] = await Promise.all([dataQuery, countQuery]);

    return {
      data,
      pagination: {
        total: Number(total?.count) || 0,
        page,
        limit,
        totalPages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }
}

export default new Company();
