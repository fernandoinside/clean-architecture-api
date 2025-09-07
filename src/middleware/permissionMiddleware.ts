
import { NextFunction, Request, Response } from 'express';
import db from '../config/db';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware de autorização granular que implementa:
 * - Admin: Acesso total (bypass)
 * - Manager/company_admin: Verificação baseada nas permissões específicas do role
 * - User: Acesso limitado baseado em roles
 * 
 * @param requiredRoles - Roles que podem acessar (ex: ['admin', 'manager', 'user'])
 * @param requiredPermissions - Permissões específicas necessárias (ex: ['setting:read', 'user:create'])
 */
const authorize = (requiredRoles: string[] = [], requiredPermissions: string[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Não autenticado' });
      return;
    }

    try {
      // 1. Buscar todos os roles do usuário
      const userRoles = await db('user_roles')
        .join('roles', 'user_roles.role_id', 'roles.id')
        .where('user_roles.user_id', req.user.id)
        .select('roles.name', 'roles.id');

      // 2. ADMIN: Acesso total sem verificação adicional
      const isAdmin = userRoles.some((role: any) => role.name === 'admin');
      if (isAdmin) {
        console.log(`[PERMISSION] Admin bypass for user ${req.user.id}`);
        return next();
      }

      // 3. Para não-admins, buscar permissões específicas baseadas nos roles
      const userPermissions = await db('role_permissions')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .join('roles', 'role_permissions.role_id', 'roles.id')
        .whereIn('roles.id', userRoles.map((role: any) => role.id))
        .select('permissions.name', 'permissions.resource', 'permissions.action');

      // 4. Mapear "manager" para "company_admin" para compatibilidade
      const mappedRoles = requiredRoles.map(role => role === 'manager' ? 'company_admin' : role);
      
      const hasRequiredRole = mappedRoles.length === 0 || 
        mappedRoles.some(role => userRoles.some((ur: any) => ur.name === role));

      // 5. Para managers (company_admin), verificar permissões específicas
      const isManager = userRoles.some((role: any) => role.name === 'company_admin');
      
      if (isManager) {
        // Manager deve ter permissões específicas para a ação
        if (requiredPermissions.length > 0) {
          const hasSpecificPermission = requiredPermissions.some(permission => 
            userPermissions.some((up: any) => up.name === permission)
          );
          
          if (!hasSpecificPermission) {
            console.log(`[PERMISSION] Manager ${req.user.id} denied - missing specific permissions:`, requiredPermissions);
            res.status(403).json({ 
              success: false, 
              message: 'Acesso negado: Você não tem permissão específica para realizar esta ação.' 
            });
            return;
          }
        }
        
        // Manager tem o role necessário?
        if (!hasRequiredRole) {
          console.log(`[PERMISSION] Manager ${req.user.id} denied - missing required role:`, requiredRoles);
          res.status(403).json({ 
            success: false, 
            message: 'Acesso negado: Você não tem o role necessário para esta ação.' 
          });
          return;
        }
        
        console.log(`[PERMISSION] Manager access granted for user ${req.user.id}`);
        return next();
      }

      // 6. Para usuários comuns, verificar role OU permissão
      const hasRequiredPermission = requiredPermissions.length === 0 || 
        requiredPermissions.some(permission => userPermissions.some((up: any) => up.name === permission));

      if (hasRequiredRole && hasRequiredPermission) {
        console.log(`[PERMISSION] Regular user access granted for user ${req.user.id}`);
        next();
      } else {
        console.log(`[PERMISSION] Access denied for user ${req.user.id} - roles:`, userRoles.map(r => r.name), 'permissions:', userPermissions.map(p => p.name));
        res.status(403).json({ 
          success: false, 
          message: 'Acesso negado: Você não tem permissão para realizar esta ação.' 
        });
      }
    } catch (error: any) {
      console.error('[PERMISSION] Error in authorization middleware:', error);
      res.status(500).json({ success: false, message: 'Erro interno de autorização' });
    }
  };
};

export default authorize;
