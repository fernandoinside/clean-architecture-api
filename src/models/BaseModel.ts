import { Knex } from 'knex';
import db from '../config/db';
import { AuditLogger } from '../middleware/auditMiddleware';
import { AsyncLocalStorage } from 'async_hooks';

// Contexto de auditoria usando AsyncLocalStorage
const auditContext = new AsyncLocalStorage<{
  userId?: number;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
}>();

export interface IBaseModel<T> {
  tableName: string;
  db: Knex;
  getAll(): Promise<T[]>;
  findById(id: number): Promise<T | undefined>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<T | undefined>;
  update(id: number, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<T | undefined>;
  delete(id: number): Promise<number>;
  softDelete?(id: number): Promise<number>;
}

abstract class BaseModel<T> implements IBaseModel<T> {
  public tableName: string;
  public db: Knex;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.db = db;
  }

  /**
   * Define o contexto de auditoria para operações do modelo
   */
  static setAuditContext(context: {
    userId?: number;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
  }) {
    return auditContext.run(context, () => {});
  }

  /**
   * Executa uma operação dentro de um contexto de auditoria
   */
  static async runWithAuditContext<T>(context: {
    userId?: number;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
  }, callback: () => Promise<T>): Promise<T> {
    return auditContext.run(context, callback);
  }

  /**
   * Obtém o contexto de auditoria atual
   */
  private getAuditContext() {
    return auditContext.getStore();
  }

  async getAll(): Promise<T[]> {
    const result = await this.db(this.tableName)
      .whereNull('deleted_at')
      .select('*');
    
    // Log de auditoria para leitura em massa
    const context = this.getAuditContext();
    if (context) {
      await AuditLogger.logRead(this.tableName, undefined, context);
    }
    
    return result;
  }

  async findById(id: number): Promise<T | undefined> {
    if (!id) return undefined;
    
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
    
    // Log de auditoria para leitura individual
    const context = this.getAuditContext();
    if (context && result) {
      await AuditLogger.logRead(this.tableName, id, context);
    }
    
    return result;
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<T | undefined> {
    try {
      const now = new Date();
      
      // Log dos dados que estão sendo inseridos para diagnóstico
      console.log(`[DEBUG] Criando registro em ${this.tableName} com dados:`, {
        ...data,
        created_at: now,
        updated_at: now
      });
      
      const [result] = await this.db(this.tableName)
        .insert({
          ...data,
          created_at: now,
          updated_at: now
        })
        .returning('*');
      
      console.log(`[SUCCESS] Registro criado em ${this.tableName} com ID:`, result?.id);
      
      // Log de auditoria para criação
      const context = this.getAuditContext();
      if (context && result) {
        await AuditLogger.logCreate(this.tableName, result, context);
      }
      
      return result as T;
    } catch (error: any) {
      // Log detalhado do erro para facilitar diagnóstico
      console.error(`[ERROR] Erro ao criar registro em ${this.tableName}:`);
      console.error(`[ERROR] Dados enviados:`, data);
      console.error(`[ERROR] Erro completo:`, {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table,
        column: error.column
      });
      
      // Verificar se é erro de sequência de ID
      if (error.code === '23505' && error.constraint?.includes('_pkey')) {
        console.error(`[ERROR] ⚠️  PROBLEMA DE SEQUÊNCIA DE ID DETECTADO!`);
        console.error(`[ERROR] Tabela: ${this.tableName}`);
        console.error(`[ERROR] Constraint: ${error.constraint}`);
        console.error(`[ERROR] 💡 Sugestão: Execute o comando para resetar a sequência:`);
        console.error(`[ERROR] SELECT setval('${this.tableName}_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM ${this.tableName}));`);
      }
      
      // Verificar se é erro de coluna inexistente  
      if (error.code === '42703') {
        console.error(`[ERROR] ⚠️  COLUNA INEXISTENTE DETECTADA!`);
        console.error(`[ERROR] Tabela: ${this.tableName}`);
        console.error(`[ERROR] 💡 Verificar se interface e migration estão alinhadas`);
      }
      
      throw error; // Propagar o erro para ser tratado nas camadas superiores
    }
  }

  async update(id: number, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<T | undefined> {
    if (!id) return undefined;
    
    // Busca os dados antes da atualização para auditoria
    const oldData = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
    
    if (!oldData) return undefined;
    
    await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        ...data,
        updated_at: new Date()
      });
    
    const newData = await this.findById(id);
    
    // Log de auditoria para atualização
    const context = this.getAuditContext();
    if (context && newData) {
      await AuditLogger.logUpdate(this.tableName, id, oldData, newData, context);
    }
      
    return newData;
  }

  async delete(id: number): Promise<number> {
    if (!id) return 0;
    
    // Busca os dados antes da exclusão para auditoria
    const oldData = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
    
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .del();
    
    // Log de auditoria para exclusão
    const context = this.getAuditContext();
    if (context && result > 0 && oldData) {
      await AuditLogger.logDelete(this.tableName, id, oldData, context);
    }
    
    return result;
  }

  async softDelete(id: number): Promise<number> {
    if (!id) return 0;
    
    // Busca os dados antes da exclusão para auditoria
    const oldData = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
    
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      });
    
    // Log de auditoria para soft delete
    const context = this.getAuditContext();
    if (context && result > 0 && oldData) {
      await AuditLogger.logDelete(this.tableName, id, oldData, context);
    }
    
    return result;
  }
}

// Exporta o contexto de auditoria para uso externo
export { auditContext };

export default BaseModel;
