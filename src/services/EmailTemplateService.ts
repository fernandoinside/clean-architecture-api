import EmailTemplate, { IEmailTemplate } from '../models/EmailTemplate';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class EmailTemplateService extends BaseService<IEmailTemplate> {
  constructor() {
    super(EmailTemplate);
  }

  private normalize<T extends Record<string, any>>(row: T | undefined): IEmailTemplate | undefined {
    if (!row) return undefined;
    const copy: any = { ...row };
    if (copy.is_active !== undefined && copy.isActive === undefined) {
      copy.isActive = copy.is_active;
    }
    // Opcionalmente ocultar o snake_case na resposta
    delete copy.is_active;
    return copy as IEmailTemplate;
  }

  /**
   * Cria um novo template de e-mail com validações adicionais
   * @param data Dados do template
   * @returns Template criado
   */
  async create(data: Omit<IEmailTemplate, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IEmailTemplate> {
    if (!data || !data.name || !data.subject || !data.body || !data.type) {
      throw new ValidationError('Nome, assunto, corpo e tipo do template são obrigatórios');
    }

    try {
      const existing = await this.model.db(this.model.tableName).where({ name: data.name }).first();
      if (existing) {
        throw new ValidationError('Um template de e-mail com este nome já existe');
      }

      // Mapear camelCase para snake_case antes de persistir
      const payload: any = { ...data };
      if (payload.isActive !== undefined) {
        payload.is_active = payload.isActive;
        delete payload.isActive;
      }
      if (payload.is_active === undefined) {
        payload.is_active = true; // default
      }

      const result = await super.create(payload);
      if (!result) {
        throw new DatabaseError('Falha ao criar template de e-mail');
      }
      await this.invalidateCache();
      return this.normalize(result) as IEmailTemplate;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar template de e-mail', error as Error);
    }
  }

  /**
   * Atualiza um template de e-mail existente
   * @param id ID do template
   * @param data Dados para atualização
   * @returns Template atualizado
   */
  async update(id: number, data: Partial<Omit<IEmailTemplate, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IEmailTemplate> {
    if (!id) {
      throw new ValidationError('ID do template não fornecido');
    }

    try {
      if (data.name) {
        const existing = await this.model.db(this.model.tableName).where({ name: data.name }).whereNot('id', id).first();
        if (existing) {
          throw new ValidationError('Um template de e-mail com este nome já existe');
        }
      }

      // Mapear camelCase para snake_case antes de atualizar
      const payload: any = { ...data };
      if (payload.isActive !== undefined) {
        payload.is_active = payload.isActive;
        delete payload.isActive;
      }

      const result = await super.update(id, payload);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar template de e-mail');
      }
      await this.invalidateCache();
      return this.normalize(result) as IEmailTemplate;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar template de e-mail', error as Error);
    }
  }

  /**
   * Busca um template de e-mail pelo ID
   * @param id ID do template
   * @returns Template encontrado
   */
  async findById(id: number): Promise<IEmailTemplate> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Template de e-mail não encontrado');
      }
      return this.normalize(result) as IEmailTemplate;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar template de e-mail', error as Error);
    }
  }

  /**
   * Remove um template de e-mail (soft delete)
   * @param id ID do template
   * @returns true se o template foi removido com sucesso
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
      throw new DatabaseError('Erro ao remover template de e-mail', error as Error);
    }
  }

  /**
   * Busca templates de e-mail com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de templates de e-mail
   */
  async search(filters: { name?: string; subject?: string; type?: string; isActive?: boolean }, page = 1, limit = 10) {
    try {
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (filters.name) {
        query.where('name', 'ilike', `%${filters.name}%`);
      }
      if (filters.subject) {
        query.where('subject', 'ilike', `%${filters.subject}%`);
      }
      if (filters.type) {
        query.where('type', filters.type);
      }
      if (typeof filters.isActive === 'boolean') {
        query.where('is_active', filters.isActive);
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
        data: (data as any[]).map(row => this.normalize(row)) as IEmailTemplate[],
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError('Erro ao buscar templates de e-mail', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { EmailTemplateService };

// Exporta uma instância padrão para uso comum
const emailTemplateServiceInstance = new EmailTemplateService();
export default emailTemplateServiceInstance;
