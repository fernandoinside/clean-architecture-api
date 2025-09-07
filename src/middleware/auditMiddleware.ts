import { Request, Response, NextFunction } from 'express';
import db from '../config/db';

/**
 * Interface para dados de auditoria
 */
export interface IAuditData {
  userId?: number;
  userEmail?: string;
  action: 'create' | 'update' | 'delete' | 'read';
  table: string;
  recordId?: number | string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
}

/**
 * Interface para requisições com contexto de auditoria
 */
export interface IAuditRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
  auditContext?: {
    userId?: number;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
  };
}

/**
 * Classe para gerenciar auditoria de operações no banco de dados
 */
export class AuditLogger {
  /**
   * Registra uma operação de auditoria no banco
   */
  static async log(auditData: IAuditData): Promise<void> {
    try {
      const logMessage = `${auditData.action.toUpperCase()} operation on table '${auditData.table}'${auditData.recordId ? ` for record ID ${auditData.recordId}` : ''}`;
      
      const meta = {
        action: auditData.action,
        table: auditData.table,
        recordId: auditData.recordId,
        userId: auditData.userId,
        userEmail: auditData.userEmail,
        ip: auditData.ip,
        userAgent: auditData.userAgent,
        endpoint: auditData.endpoint,
        method: auditData.method,
        ...(auditData.oldData && { oldData: auditData.oldData }),
        ...(auditData.newData && { newData: auditData.newData })
      };

      // Usa raw insert para evitar dependência circular com Log model
      await db('logs').insert({
        level: 'info',
        message: logMessage,
        meta: JSON.stringify(meta),
        source: 'backend',
        created_at: new Date(),
        updated_at: new Date()
      });
    } catch (error) {
      // Em caso de erro no log de auditoria, registra no console para não quebrar a aplicação
      console.error('Erro ao registrar auditoria:', error);
    }
  }

  /**
   * Cria logs de auditoria para operações CRUD
   */
  static async logCreate(table: string, newData: any, context?: Partial<IAuditData>): Promise<void> {
    await this.log({
      action: 'create',
      table,
      recordId: newData?.id,
      newData,
      ...context
    });
  }

  static async logUpdate(table: string, recordId: number | string, oldData: any, newData: any, context?: Partial<IAuditData>): Promise<void> {
    await this.log({
      action: 'update',
      table,
      recordId,
      oldData,
      newData,
      ...context
    });
  }

  static async logDelete(table: string, recordId: number | string, oldData?: any, context?: Partial<IAuditData>): Promise<void> {
    await this.log({
      action: 'delete',
      table,
      recordId,
      oldData,
      ...context
    });
  }

  static async logRead(table: string, recordId?: number | string, context?: Partial<IAuditData>): Promise<void> {
    await this.log({
      action: 'read',
      table,
      recordId,
      ...context
    });
  }
}

/**
 * Middleware para capturar contexto de auditoria nas requisições
 */
export const auditMiddleware = (req: IAuditRequest, res: Response, next: NextFunction): void => {
  // Define o contexto de auditoria na requisição
  req.auditContext = {
    userId: req.user?.id,
    userEmail: req.user?.email,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    endpoint: req.originalUrl,
    method: req.method
  };

  next();
};

/**
 * Helper para obter contexto de auditoria de uma requisição
 */
export const getAuditContext = (req?: IAuditRequest): Partial<IAuditData> => {
  if (!req?.auditContext) {
    return {};
  }

  return {
    userId: req.auditContext.userId,
    userEmail: req.auditContext.userEmail,
    ip: req.auditContext.ip,
    userAgent: req.auditContext.userAgent,
    endpoint: req.auditContext.endpoint,
    method: req.auditContext.method
  };
};

export default auditMiddleware;