/**
 * RBAC Guard - Funções de proteção e validação de acesso
 */

import { Role, canAccessRoute, canPerformAction, Permission } from './roles';

/**
 * Verifica se o usuário pode acessar uma rota específica
 */
export function canAccess(route: string, userRole?: Role, allowedRoles?: Role[]): boolean {
  // Se não há papel do usuário, negar acesso
  if (!userRole) {
    return false;
  }

  // Se há lista de papéis permitidos, verificar contra ela
  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles.includes(userRole);
  }

  // Usar sistema de rotas padrão
  return canAccessRoute(route, userRole);
}

/**
 * Verifica se o usuário pode executar uma ação em um recurso
 */
export function canPerform(
  resource: string,
  action: Permission['action'],
  userRole?: Role
): boolean {
  if (!userRole) {
    return false;
  }

  return canPerformAction(resource, action, userRole);
}

/**
 * Guard para componentes - renderiza children apenas se o usuário tiver acesso
 */
interface AccessGuardProps {
  children: React.ReactNode;
  route?: string;
  roles?: Role[];
  resource?: string;
  action?: Permission['action'];
  userRole?: Role;
  fallback?: React.ReactNode;
}

export function AccessGuard({
  children,
  route,
  roles,
  resource,
  action,
  userRole,
  fallback = null,
}: AccessGuardProps) {
  let hasAccess = false;

  if (route) {
    hasAccess = canAccess(route, userRole, roles);
  } else if (resource && action) {
    hasAccess = canPerform(resource, action, userRole);
  } else if (roles && userRole) {
    hasAccess = roles.includes(userRole);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook para verificação de acesso em componentes
 */
export function useAccessControl(userRole?: Role) {
  return {
    canAccess: (route: string, allowedRoles?: Role[]) => 
      canAccess(route, userRole, allowedRoles),
    canPerform: (resource: string, action: Permission['action']) => 
      canPerform(resource, action, userRole),
    hasRole: (role: Role) => userRole === role,
    hasAnyRole: (roles: Role[]) => userRole ? roles.includes(userRole) : false,
  };
}

/**
 * Middleware para validação de acesso em APIs
 */
export function requireRole(allowedRoles: Role[]) {
  return function (userRole?: Role) {
    if (!userRole) {
      throw new Error('Usuário não autenticado');
    }

    if (!allowedRoles.includes(userRole)) {
      throw new Error('Acesso negado - papel insuficiente');
    }

    return true;
  };
}

/**
 * Middleware para validação de permissão específica
 */
export function requirePermission(resource: string, action: Permission['action']) {
  return function (userRole?: Role) {
    if (!userRole) {
      throw new Error('Usuário não autenticado');
    }

    if (!canPerform(resource, action, userRole)) {
      throw new Error(`Acesso negado - sem permissão para ${action} em ${resource}`);
    }

    return true;
  };
}

/**
 * Utilitário para filtrar itens de menu baseado em permissões
 */
export function filterMenuItems<T extends { roles?: Role[]; route?: string }>(
  items: T[],
  userRole?: Role
): T[] {
  if (!userRole) {
    return [];
  }

  return items.filter(item => {
    if (item.roles) {
      return item.roles.includes(userRole);
    }
    if (item.route) {
      return canAccess(item.route, userRole);
    }
    return true;
  });
}

/**
 * Utilitário para verificar se o usuário é admin
 */
export function isAdmin(userRole?: Role): boolean {
  return userRole === 'admin';
}

/**
 * Utilitário para verificar se o usuário pode gerenciar outros usuários
 */
export function canManageUsers(userRole?: Role): boolean {
  return userRole === 'admin' || userRole === 'manager';
}

/**
 * Utilitário para verificar se o usuário pode acessar configurações
 */
export function canAccessSettings(userRole?: Role): boolean {
  return userRole === 'admin' || userRole === 'manager';
}

/**
 * Utilitário para verificar se o usuário pode executar missões
 */
export function canExecuteMissions(userRole?: Role): boolean {
  return userRole === 'admin' || userRole === 'manager' || userRole === 'operator';
}

/**
 * Utilitário para verificar se o usuário pode criar/editar conteúdo
 */
export function canCreateContent(userRole?: Role): boolean {
  return userRole === 'admin' || userRole === 'manager' || userRole === 'operator';
}

/**
 * Utilitário para verificar se o usuário tem acesso apenas de leitura
 */
export function isReadOnly(userRole?: Role): boolean {
  return userRole === 'viewer';
}
