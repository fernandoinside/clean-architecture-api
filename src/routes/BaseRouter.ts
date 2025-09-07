import { Router, RequestHandler } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import authorize from '../middleware/permissionMiddleware';
import validate from '../middleware/validationMiddleware'; // Assuming this is the generic validation middleware
import { auditMiddleware, IAuditRequest } from '../middleware/auditMiddleware';
import BaseModel, { auditContext } from '../models/BaseModel';

// Define a generic controller interface if not already present
interface IBaseController {
  index?: RequestHandler;
  show?: RequestHandler;
  store?: RequestHandler;
  update?: RequestHandler;
  destroy?: RequestHandler;
  // Add other common methods as needed
}

class BaseRouter<T extends IBaseController> {
  public router: Router;
  protected controller: T;

  constructor(controller: T) {
    this.router = Router();
    this.controller = controller;
  }

  protected addRoute(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    controllerMethod: keyof T,
    options?: {
      auth?: boolean;
      permissions?: string[];
      requiredPermissions?: string[]; // Permissões específicas (ex: ['settings_read'])
      validationSchema?: any; // Yup schema
      validationOptions?: object; // Options for yup validation
      customValidation?: RequestHandler; // For custom validation logic like in listCompaniesSchema
      disableAudit?: boolean; // Option to disable audit for specific routes
    }
  ) {
    const handlers: RequestHandler[] = [];

    // Sempre adiciona o middleware de auditoria primeiro, a menos que seja desabilitado
    if (!options?.disableAudit) {
      handlers.push(auditMiddleware);
    }

    if (options?.auth) {
      handlers.push(authMiddleware);
    }

    if (options?.permissions && options.permissions.length > 0) {
      handlers.push(authorize(options.permissions, options.requiredPermissions || []));
    }

    if (options?.validationSchema) {
      handlers.push(validate(options.validationSchema, options.validationOptions));
    } else if (options?.customValidation) {
      handlers.push(options.customValidation);
    }

    // Wrapper para executar operações do controller dentro do contexto de auditoria
    const auditContextWrapper: RequestHandler = async (req: IAuditRequest, res, next) => {
      if (!options?.disableAudit && req.auditContext) {
        // Executa o método do controller dentro do contexto de auditoria
        await auditContext.run(req.auditContext, async () => {
          if (typeof this.controller[controllerMethod] === 'function') {
            await (this.controller[controllerMethod] as RequestHandler).call(this.controller, req, res, next);
          } else {
            console.warn(`Controller method ${String(controllerMethod)} not found for path ${path}`);
            next();
          }
        });
      } else {
        // Executa normalmente se auditoria estiver desabilitada
        if (typeof this.controller[controllerMethod] === 'function') {
          await (this.controller[controllerMethod] as RequestHandler).call(this.controller, req, res, next);
        } else {
          console.warn(`Controller method ${String(controllerMethod)} not found for path ${path}`);
          next();
        }
      }
    };

    handlers.push(auditContextWrapper);

    this.router[method](path, ...handlers);
  }

  // Public methods for common CRUD operations
  get(path: string, controllerMethod: keyof T, options?: Parameters<BaseRouter<T>['addRoute']>[3]) {
    this.addRoute('get', path, controllerMethod, options);
  }

  post(path: string, controllerMethod: keyof T, options?: Parameters<BaseRouter<T>['addRoute']>[3]) {
    this.addRoute('post', path, controllerMethod, options);
  }

  put(path: string, controllerMethod: keyof T, options?: Parameters<BaseRouter<T>['addRoute']>[3]) {
    this.addRoute('put', path, controllerMethod, options);
  }

  delete(path: string, controllerMethod: keyof T, options?: Parameters<BaseRouter<T>['addRoute']>[3]) {
    this.addRoute('delete', path, controllerMethod, options);
  }
}

export default BaseRouter;