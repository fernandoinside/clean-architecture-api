import BaseService from './BaseService';
import Company, { ICompany } from '../models/Company';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class CompanyService extends BaseService<ICompany> {
  constructor() {
    super(Company);
  }

  /**
   * Cria uma nova empresa com validações adicionais
   * @param data Dados da empresa
   * @returns Empresa criada
   */
  async create(data: Omit<ICompany, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<ICompany> {
    if (!data) {
      throw new ValidationError('Dados da empresa não fornecidos');
    }
    try {
      if (!data.email) {
        throw new ValidationError('O email é obrigatório');
      }
      
      // Normalizar email
      const normalizedEmail = data.email.toLowerCase().trim();
      
      // Verificar unicidade do email
      const existingEmail = await ((this.model as any)).findByEmail(normalizedEmail);
      if (existingEmail) {
        throw new ValidationError('Email já está em uso por outra empresa');
      }

      // Verificar unicidade do documento, se fornecido
      if (data.document) {
        const existingDoc = await ((this.model as any)).findByDocument(data.document);
        if (existingDoc) {
          throw new ValidationError('Documento já está em uso por outra empresa');
        }
      }

      // Garantir que o status padrão seja 'active' se não informado
      const companyData = {
        ...data,
        email: normalizedEmail,
        status: data.status || 'active',
        // Garantir que campos opcionais sejam null se vazios
        document: data.document || null,
        phone: data.phone || null,
        website: data.website || null,
        industry: data.industry || null,
      };

      const result = await super.create(companyData);
      if (!result) {
        throw new Error('Falha ao criar a empresa');
      }
      
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Erro ao criar empresa', error as Error);
    }
  }

  /**
   * Atualiza uma empresa existente
   * @param id ID da empresa
   * @param data Dados para atualização
   * @returns Empresa atualizada
   */
  async update(id: number, data: Partial<Omit<ICompany, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<ICompany> {
    if (!id) {
      throw new ValidationError('ID da empresa não fornecido');
    }
    
    try {
      // Buscar a empresa existente para validações
      const existingCompany = await this.findById(id);

      let normalizedEmail: string | undefined;
      if (data.email) {
        normalizedEmail = data.email.toLowerCase().trim();
        
        // Verificar se o novo email já está em uso por outra empresa
        if (normalizedEmail !== existingCompany.email) {
          const emailInUse = await ((this.model as any)).findByEmail(normalizedEmail);
          if (emailInUse) {
            throw new ValidationError('Email já está em uso por outra empresa');
          }
          data.email = normalizedEmail;
        }
      }

      // Verificar unicidade do documento, se fornecido e alterado
      if (data.document && data.document !== existingCompany.document) {
        const docInUse = await ((this.model as any)).findByDocument(data.document);
        if (docInUse) {
          throw new ValidationError('Documento já está em uso por outra empresa');
        }
      }

      const result = await super.update(id, data);
      if (!result) {
        throw new Error('Falha ao atualizar a empresa');
      }
      
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro ao atualizar empresa', error as Error);
    }
  }

  /**
   * Busca uma empresa pelo ID
   * @param id ID da empresa
   * @returns Empresa encontrada
   */
  async findById(id: number): Promise<ICompany> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Empresa não encontrada');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Erro ao buscar empresa', error as Error);
    }
  }

  /**
   * Remove uma empresa (soft delete)
   * @param id ID da empresa
   * @returns true se a empresa foi removida com sucesso
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
      throw new DatabaseError('Erro ao remover empresa', error as Error);
    }
  }

  /**
   * Busca empresas com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de empresas
   */
  async search(
    filters: {
      name?: string;
      document?: string;
      email?: string;
      status?: 'active' | 'inactive' | 'pending';
      industry?: string;
    } = {},
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const { name, document, email, status, industry } = filters;
      const query = (this.model as any).db((this.model as any).tableName).whereNull('deleted_at');

      if (name) {
        query.where('name', 'ilike', `%${name}%`);
      }
      if (document) {
        const cleanDocument = document.replace(/\D/g, '');
        query.whereRaw("REPLACE(REPLACE(REPLACE(document, '.', ''), '-', ''), '/', '') = ?", cleanDocument);
      }
      if (email) {
        query.where('email', 'ilike', `%${email}%`);
      }
      if (status) {
        query.where('status', status);
      }
      if (industry) {
        query.where('industry', 'ilike', `%${industry}%`);
      }

      const offset = (page - 1) * limit;
      
      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
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
      throw new DatabaseError('Erro ao buscar empresas', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { CompanyService };

// Exporta uma instância padrão para uso comum
const companyServiceInstance = new CompanyService();
export default companyServiceInstance;
