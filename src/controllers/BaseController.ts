import { Request, Response, NextFunction } from 'express';
import { IBaseService } from '../services/BaseService';
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  DatabaseError,
  UnauthorizedError,
  ForbiddenError 
} from '../utils/errors';
import logger from '../config/logger';

/**
 * Interface para tipagem genérica do BaseController
 * @template T - Tipo da entidade
 */
export interface IBaseController<T> {
  index(req: Request, res: Response, next: NextFunction): Promise<void>;
  show(req: Request, res: Response, next: NextFunction): Promise<void>;
  store(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  destroy(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Classe base para controladores com operações CRUD
 * @template T - Tipo da entidade
 */
class BaseController<T> implements IBaseController<T> {
  protected service: IBaseService<T>;
  protected resourceName: string;

  /**
   * @param service - Instância do serviço que será usado pelo controlador
   * @param resourceName - Nome do recurso (para mensagens de log e erro)
   */
  constructor(service: IBaseService<T>, resourceName: string = 'recurso') {
    this.service = service;
    this.resourceName = resourceName;
  }

  /**
   * Manipulador para listar todos os registros
   */
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.service.getAll();
      res.json({
        success: true,
        data,
        meta: {
          total: Array.isArray(data) ? data.length : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manipulador para buscar um registro por ID
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError('ID do recurso não fornecido');
      }

      const data = await this.service.findById(Number(id));
      if (!data) {
        throw new NotFoundError(`${this.resourceName} não encontrado`);
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manipulador para criar um novo registro
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.service.create(req.body);
      
      res.status(201).json({
        success: true,
        message: `${this.resourceName} criado com sucesso`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manipulador para atualizar um registro existente
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError('ID do recurso não fornecido');
      }

      const data = await this.service.update(Number(id), req.body);
      if (!data) {
        throw new NotFoundError(`${this.resourceName} não encontrado`);
      }

      res.json({
        success: true,
        message: `${this.resourceName} atualizado com sucesso`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manipulador para excluir um registro
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError('ID do recurso não fornecido');
      }

      const deleted = await this.service.delete(Number(id));
      if (!deleted) {
        throw new NotFoundError(`${this.resourceName} não encontrado`);
      }

      res.json({
        success: true,
        message: `${this.resourceName} excluído com sucesso`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Middleware para tratamento de erros
   */
  static errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Log do erro
    logger.error(`[${req.method} ${req.originalUrl}] ${err.message}`, {
      error: err,
      body: req.body,
      params: req.params,
      query: req.query,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // Tratamento de erros conhecidos
    if (err instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: err.message,
        errors: (err as any).details,
      });
    } else if (err instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        message: err.message,
      });
    } else if (err instanceof ConflictError) {
      res.status(409).json({
        success: false,
        message: err.message,
      });
    } else if (err instanceof UnauthorizedError) {
      res.status(401).json({
        success: false,
        message: err.message || 'Não autorizado',
      });
    } else if (err instanceof ForbiddenError) {
      res.status(403).json({
        success: false,
        message: err.message || 'Acesso negado',
      });
    } else if (err instanceof DatabaseError) {
      res.status(500).json({
        success: false,
        message: 'Erro no banco de dados',
        // Não expor detalhes internos em produção
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    } else {
      // Erro não tratado
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        // Não expor detalhes internos em produção
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
}

export default BaseController;
