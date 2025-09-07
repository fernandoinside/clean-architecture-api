/**
 * Classe base para erros personalizados
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    
    // Garante que o stack trace seja capturado corretamente
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro para validação de dados
 */
class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
  }
}

/**
 * Erro para recursos não encontrados
 */
class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Erro para conflitos (ex: registro duplicado)
 */
class ConflictError extends AppError {
  constructor(message: string = 'Conflito ao processar a requisição') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Erro de autenticação
 */
class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Erro de permissão
 */
class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Erro de banco de dados
 */
class DatabaseError extends AppError {
  public readonly originalError: Error | undefined;

  constructor(
    message: string = 'Erro no banco de dados',
    originalError?: Error
  ) {
    super(message, 500, true);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

export {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError
};
