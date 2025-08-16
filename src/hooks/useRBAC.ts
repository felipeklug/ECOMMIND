/**
 * useRBAC Hook - Hook para controle de acesso baseado em papéis
 */

'use client';

import { useAuth } from './useAuth';
import { useAccessControl } from '@/core/rbac/guard';
import { Role } from '@/core/rbac/roles';

export function useRBAC() {
  const { profile, loading } = useAuth();
  const userRole = profile?.role;
  
  const accessControl = useAccessControl(userRole);

  return {
    ...accessControl,
    userRole,
    loading,
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isOperator: userRole === 'operator',
    isViewer: userRole === 'viewer',
    canManageUsers: userRole === 'admin' || userRole === 'manager',
    canAccessSettings: userRole === 'admin' || userRole === 'manager',
    canExecuteMissions: userRole === 'admin' || userRole === 'manager' || userRole === 'operator',
    canCreateContent: userRole === 'admin' || userRole === 'manager' || userRole === 'operator',
    isReadOnly: userRole === 'viewer',
  };
}
