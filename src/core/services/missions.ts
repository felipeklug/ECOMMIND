/**
 * Missions Service
 * Handles creation and management of AI missions and insights
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface Mission {
  id: string;
  company_id: string;
  origin_insight_id?: string;
  module: string;
  title: string;
  description?: string;
  status: 'backlog' | 'planned' | 'in_progress' | 'done' | 'dismissed';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  assignee_id?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  payload?: any;
  tags?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateMissionPayload {
  module: string;
  title: string;
  description?: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  assignee_id?: string;
  due_date?: string;
  estimated_hours?: number;
  payload?: any;
  tags?: string[];
}

export interface MissionsService {
  createMission(companyId: string, mission: CreateMissionPayload): Promise<Mission>;
  createSeedMissions(companyId: string, assigneeId: string): Promise<Mission[]>;
  getMissions(companyId: string, filters?: {
    status?: string;
    module?: string;
    assignee_id?: string;
  }): Promise<Mission[]>;
  updateMissionStatus(missionId: string, status: Mission['status']): Promise<void>;
}

class MissionsServiceImpl implements MissionsService {
  private supabase = createClient();

  /**
   * Create a new mission
   */
  async createMission(companyId: string, mission: CreateMissionPayload): Promise<Mission> {
    try {
      const missionData = {
        company_id: companyId,
        module: mission.module,
        title: mission.title,
        description: mission.description,
        status: 'backlog' as const,
        priority: mission.priority || 'P2',
        assignee_id: mission.assignee_id,
        due_date: mission.due_date,
        estimated_hours: mission.estimated_hours,
        payload: mission.payload || {},
        tags: mission.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('missions')
        .insert(missionData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create mission: ${error.message}`);
      }

      logger.info('Mission created', { 
        companyId, 
        missionId: data.id, 
        module: mission.module,
        title: mission.title 
      });

      return data as Mission;
    } catch (error) {
      logger.error('Error creating mission', { companyId, mission, error });
      throw error;
    }
  }

  /**
   * Create seed missions for onboarding
   */
  async createSeedMissions(companyId: string, assigneeId: string): Promise<Mission[]> {
    try {
      const seedMissions: CreateMissionPayload[] = [
        {
          module: 'planning',
          title: 'Configurar metas do mês',
          description: 'Definir metas de vendas por canal e produto para o mês atual. Acesse o módulo de Planejamento e configure suas metas baseadas no histórico de vendas.',
          priority: 'P1',
          assignee_id: assigneeId,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
          estimated_hours: 2,
          payload: {
            type: 'onboarding_seed',
            category: 'planning',
            steps: [
              'Analisar histórico de vendas',
              'Definir metas por canal',
              'Configurar alertas de acompanhamento'
            ]
          },
          tags: ['onboarding', 'planning', 'metas']
        },
        {
          module: 'bi',
          title: 'Rodar backfill de pedidos',
          description: 'Sincronizar histórico de pedidos dos últimos 90 dias para análise completa. Esta tarefa irá importar dados históricos dos seus canais de venda.',
          priority: 'P1',
          assignee_id: assigneeId,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
          estimated_hours: 1,
          payload: {
            type: 'onboarding_seed',
            category: 'data_sync',
            backfill_days: 90,
            channels: ['all']
          },
          tags: ['onboarding', 'bi', 'sync']
        },
        {
          module: 'bi',
          title: 'Revisar margem alvo por canal',
          description: 'Analisar e ajustar as margens alvo configuradas para cada canal de venda baseado na performance histórica e concorrência.',
          priority: 'P2',
          assignee_id: assigneeId,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days
          estimated_hours: 3,
          payload: {
            type: 'onboarding_seed',
            category: 'optimization',
            focus: 'margin_analysis'
          },
          tags: ['onboarding', 'bi', 'margem']
        }
      ];

      const createdMissions: Mission[] = [];

      for (const missionPayload of seedMissions) {
        const mission = await this.createMission(companyId, missionPayload);
        createdMissions.push(mission);
      }

      logger.info('Seed missions created', { 
        companyId, 
        assigneeId, 
        count: createdMissions.length 
      });

      return createdMissions;
    } catch (error) {
      logger.error('Error creating seed missions', { companyId, assigneeId, error });
      throw error;
    }
  }

  /**
   * Get missions with optional filters
   */
  async getMissions(companyId: string, filters?: {
    status?: string;
    module?: string;
    assignee_id?: string;
  }): Promise<Mission[]> {
    try {
      let query = this.supabase
        .from('missions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.module) {
        query = query.eq('module', filters.module);
      }

      if (filters?.assignee_id) {
        query = query.eq('assignee_id', filters.assignee_id);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get missions: ${error.message}`);
      }

      return data as Mission[];
    } catch (error) {
      logger.error('Error getting missions', { companyId, filters, error });
      throw error;
    }
  }

  /**
   * Update mission status
   */
  async updateMissionStatus(missionId: string, status: Mission['status']): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Set completed_at when marking as done
      if (status === 'done') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await this.supabase
        .from('missions')
        .update(updateData)
        .eq('id', missionId);

      if (error) {
        throw new Error(`Failed to update mission status: ${error.message}`);
      }

      logger.info('Mission status updated', { missionId, status });
    } catch (error) {
      logger.error('Error updating mission status', { missionId, status, error });
      throw error;
    }
  }

  /**
   * Get mission statistics for dashboard
   */
  async getMissionStats(companyId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byModule: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const missions = await this.getMissions(companyId);

      const stats = {
        total: missions.length,
        byStatus: {} as Record<string, number>,
        byModule: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
      };

      missions.forEach(mission => {
        // Count by status
        stats.byStatus[mission.status] = (stats.byStatus[mission.status] || 0) + 1;
        
        // Count by module
        stats.byModule[mission.module] = (stats.byModule[mission.module] || 0) + 1;
        
        // Count by priority
        stats.byPriority[mission.priority] = (stats.byPriority[mission.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting mission stats', { companyId, error });
      throw error;
    }
  }
}

// Export singleton instance
export const missionsService = new MissionsServiceImpl();
