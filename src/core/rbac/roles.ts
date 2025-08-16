/**
 * RBAC Roles - Sistema de controle de acesso baseado em papéis
 */

export type Role = 'admin' | 'manager' | 'operator' | 'viewer';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
}

export interface RoleDefinition {
  name: Role;
  displayName: string;
  description: string;
  permissions: Permission[];
  routes: string[];
}

// Definições de papéis
export const roles: Record<Role, RoleDefinition> = {
  admin: {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Acesso completo a todas as funcionalidades',
    permissions: [
      // Todas as permissões
      { resource: '*', action: 'create' },
      { resource: '*', action: 'read' },
      { resource: '*', action: 'update' },
      { resource: '*', action: 'delete' },
      { resource: '*', action: 'execute' },
    ],
    routes: [
      '/app',
      '/app/planning',
      '/app/bi',
      '/app/chat',
      '/app/market',
      '/app/ads',
      '/app/operations',
      '/app/reports',
      '/app/settings',
      '/app/settings/company',
      '/app/settings/integrations',
      '/app/settings/users',
      '/app/settings/billing',
      '/app/profile',
    ],
  },
  manager: {
    name: 'manager',
    displayName: 'Gerente',
    description: 'Acesso a gestão e configurações limitadas',
    permissions: [
      // Dashboard
      { resource: 'dashboard', action: 'read' },
      // Planning
      { resource: 'planning', action: 'create' },
      { resource: 'planning', action: 'read' },
      { resource: 'planning', action: 'update' },
      { resource: 'planning', action: 'delete' },
      // BI
      { resource: 'bi', action: 'read' },
      { resource: 'bi', action: 'create' },
      { resource: 'bi', action: 'update' },
      // Chat
      { resource: 'chat', action: 'read' },
      { resource: 'chat', action: 'create' },
      { resource: 'chat', action: 'update' },
      // Market Intelligence
      { resource: 'market', action: 'read' },
      // Ads & Marketing
      { resource: 'ads', action: 'create' },
      { resource: 'ads', action: 'read' },
      { resource: 'ads', action: 'update' },
      { resource: 'ads', action: 'delete' },
      // Operations
      { resource: 'operations', action: 'create' },
      { resource: 'operations', action: 'read' },
      { resource: 'operations', action: 'update' },
      // Reports
      { resource: 'reports', action: 'read' },
      { resource: 'reports', action: 'create' },
      // Settings (limited)
      { resource: 'settings.integrations', action: 'read' },
      { resource: 'settings.integrations', action: 'update' },
      { resource: 'settings.users', action: 'read' },
      { resource: 'settings.users', action: 'create' },
      // Missions
      { resource: 'missions', action: 'create' },
      { resource: 'missions', action: 'read' },
      { resource: 'missions', action: 'update' },
      { resource: 'missions', action: 'execute' },
    ],
    routes: [
      '/app',
      '/app/planning',
      '/app/bi',
      '/app/chat',
      '/app/market',
      '/app/ads',
      '/app/operations',
      '/app/reports',
      '/app/settings/integrations',
      '/app/settings/users',
      '/app/profile',
    ],
  },
  operator: {
    name: 'operator',
    displayName: 'Operador',
    description: 'Acesso a operações diárias e execução de tarefas',
    permissions: [
      // Dashboard
      { resource: 'dashboard', action: 'read' },
      // Planning
      { resource: 'planning', action: 'read' },
      { resource: 'planning', action: 'update' },
      // BI
      { resource: 'bi', action: 'read' },
      // Chat
      { resource: 'chat', action: 'read' },
      { resource: 'chat', action: 'create' },
      { resource: 'chat', action: 'update' },
      // Market Intelligence
      { resource: 'market', action: 'read' },
      // Ads & Marketing
      { resource: 'ads', action: 'read' },
      { resource: 'ads', action: 'update' },
      // Operations
      { resource: 'operations', action: 'read' },
      { resource: 'operations', action: 'update' },
      { resource: 'operations', action: 'execute' },
      // Reports
      { resource: 'reports', action: 'read' },
      // Missions
      { resource: 'missions', action: 'read' },
      { resource: 'missions', action: 'execute' },
    ],
    routes: [
      '/app',
      '/app/planning',
      '/app/bi',
      '/app/chat',
      '/app/market',
      '/app/ads',
      '/app/operations',
      '/app/reports',
      '/app/profile',
    ],
  },
  viewer: {
    name: 'viewer',
    displayName: 'Visualizador',
    description: 'Acesso somente leitura a relatórios e dashboards',
    permissions: [
      // Dashboard
      { resource: 'dashboard', action: 'read' },
      // BI
      { resource: 'bi', action: 'read' },
      // Market Intelligence
      { resource: 'market', action: 'read' },
      // Reports
      { resource: 'reports', action: 'read' },
    ],
    routes: [
      '/app',
      '/app/bi',
      '/app/market',
      '/app/reports',
      '/app/profile',
    ],
  },
};

// Mapeamento de rotas para papéis permitidos
export const routePermissions: Record<string, Role[]> = {
  '/app': ['admin', 'manager', 'operator', 'viewer'],
  '/app/planning': ['admin', 'manager', 'operator'],
  '/app/bi': ['admin', 'manager', 'operator', 'viewer'],
  '/app/chat': ['admin', 'manager', 'operator'],
  '/app/market': ['admin', 'manager', 'operator', 'viewer'],
  '/app/ads': ['admin', 'manager', 'operator'],
  '/app/operations': ['admin', 'manager', 'operator'],
  '/app/reports': ['admin', 'manager', 'operator', 'viewer'],
  '/app/settings': ['admin'],
  '/app/settings/company': ['admin'],
  '/app/settings/integrations': ['admin', 'manager'],
  '/app/settings/users': ['admin', 'manager'],
  '/app/settings/billing': ['admin'],
  '/app/profile': ['admin', 'manager', 'operator', 'viewer'],
};

/**
 * Verifica se um papel tem permissão para acessar uma rota
 */
export function canAccessRoute(route: string, userRole: Role): boolean {
  // Admin tem acesso a tudo
  if (userRole === 'admin') {
    return true;
  }

  // Verificar permissão específica da rota
  const allowedRoles = routePermissions[route];
  if (allowedRoles) {
    return allowedRoles.includes(userRole);
  }

  // Verificar rotas pai (ex: /app/settings/company -> /app/settings)
  const routeParts = route.split('/').filter(Boolean);
  for (let i = routeParts.length - 1; i > 0; i--) {
    const parentRoute = '/' + routeParts.slice(0, i).join('/');
    const parentAllowedRoles = routePermissions[parentRoute];
    if (parentAllowedRoles) {
      return parentAllowedRoles.includes(userRole);
    }
  }

  // Por padrão, negar acesso
  return false;
}

/**
 * Verifica se um papel tem permissão para executar uma ação em um recurso
 */
export function canPerformAction(
  resource: string,
  action: Permission['action'],
  userRole: Role
): boolean {
  const roleDefinition = roles[userRole];
  
  // Verificar permissão específica
  const hasSpecificPermission = roleDefinition.permissions.some(
    permission => 
      (permission.resource === resource || permission.resource === '*') &&
      (permission.action === action || permission.action === '*')
  );

  return hasSpecificPermission;
}

/**
 * Obtém todas as rotas que um papel pode acessar
 */
export function getAccessibleRoutes(userRole: Role): string[] {
  return roles[userRole].routes;
}

/**
 * Obtém informações de um papel
 */
export function getRoleInfo(role: Role): RoleDefinition {
  return roles[role];
}
