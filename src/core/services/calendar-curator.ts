/**
 * Calendar Curator Service
 * Curates calendar events based on company niches and preferences
 */

import { createClient } from '@/lib/supabase/server';
import { NicheResolver, type ResolvedNiches } from './niche-resolver';

export interface CurationResult {
  events_added: number;
  events_updated: number;
  events_silenced: number;
  niches_applied: string[];
  confidence_score: number;
  last_curated: string;
}

export interface CurationOptions {
  force_refresh?: boolean;
  include_global?: boolean;
  max_events_per_niche?: number;
  importance_threshold?: 'low' | 'medium' | 'high';
}

export class CalendarCurator {
  private companyId: string;
  private supabase: ReturnType<typeof createClient>;
  private nicheResolver: NicheResolver;

  constructor(companyId: string) {
    this.companyId = companyId;
    this.supabase = createClient();
    this.nicheResolver = new NicheResolver(companyId);
  }

  /**
   * Curate calendar events for the company
   */
  async curateCalendar(options: CurationOptions = {}): Promise<CurationResult> {
    const {
      force_refresh = false,
      include_global = true,
      max_events_per_niche = 20,
      importance_threshold = 'low'
    } = options;

    // Get or resolve company niches
    const resolvedNiches = await this.getOrResolveNiches(force_refresh);
    
    if (!resolvedNiches || resolvedNiches.primary_niches.length === 0) {
      throw new Error('No niches resolved for company');
    }

    // Get company settings for silenced events
    const { data: company } = await this.supabase
      .from('companies')
      .select('settings')
      .eq('id', this.companyId)
      .single();

    const silencedEvents = company?.settings?.silenced_events || [];
    const leadTimes = company?.settings?.lead_times || {};

    let eventsAdded = 0;
    let eventsUpdated = 0;
    let eventsSilenced = 0;

    // 1. Curate global events (if enabled)
    if (include_global) {
      const globalResult = await this.curateGlobalEvents(silencedEvents);
      eventsAdded += globalResult.added;
      eventsUpdated += globalResult.updated;
    }

    // 2. Curate niche-specific events
    for (const niche of resolvedNiches.primary_niches) {
      const nicheResult = await this.curateNicheEvents(
        niche,
        silencedEvents,
        max_events_per_niche,
        importance_threshold
      );
      eventsAdded += nicheResult.added;
      eventsUpdated += nicheResult.updated;
    }

    // 3. Apply lead times and adjust due dates
    await this.applyLeadTimes(leadTimes);

    // 4. Silence low-relevance events based on niche
    const silencedResult = await this.silenceLowRelevanceEvents(
      resolvedNiches.primary_niches,
      silencedEvents
    );
    eventsSilenced += silencedResult.silenced;

    // 5. Update company settings with curation metadata
    await this.updateCurationMetadata(resolvedNiches);

    return {
      events_added: eventsAdded,
      events_updated: eventsUpdated,
      events_silenced: eventsSilenced,
      niches_applied: resolvedNiches.primary_niches,
      confidence_score: resolvedNiches.confidence_score,
      last_curated: new Date().toISOString(),
    };
  }

  /**
   * Get existing resolved niches or resolve new ones
   */
  private async getOrResolveNiches(forceRefresh: boolean): Promise<ResolvedNiches | null> {
    if (!forceRefresh) {
      // Try to get existing resolved niches
      const { data: company } = await this.supabase
        .from('companies')
        .select('settings')
        .eq('id', this.companyId)
        .single();

      const settings = company?.settings;
      if (settings?.niches_resolved && settings.niches_last_resolved) {
        const lastResolved = new Date(settings.niches_last_resolved);
        const daysSinceResolved = (Date.now() - lastResolved.getTime()) / (1000 * 60 * 60 * 24);
        
        // Use cached niches if resolved within last 7 days
        if (daysSinceResolved < 7) {
          return {
            primary_niches: settings.niches_resolved,
            all_niches: settings.niches_all || [],
            confidence_score: settings.niches_confidence || 0,
            last_resolved: settings.niches_last_resolved,
            data_sources: settings.niches_data_sources || [],
          };
        }
      }
    }

    // Resolve new niches
    return await this.nicheResolver.resolveNiches();
  }

  /**
   * Curate global events
   */
  private async curateGlobalEvents(silencedEvents: string[]): Promise<{ added: number; updated: number }> {
    // Get all global seed events
    const { data: globalSeedEvents } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('global', true)
      .eq('ai_origin', 'seed')
      .is('company_id', null); // Template events

    if (!globalSeedEvents) return { added: 0, updated: 0 };

    let added = 0;
    let updated = 0;

    for (const seedEvent of globalSeedEvents) {
      // Skip if silenced
      const eventKey = `${seedEvent.date}-${seedEvent.title}`;
      if (silencedEvents.includes(eventKey)) continue;

      // Check if event already exists for this company
      const { data: existingEvent } = await this.supabase
        .from('calendar_events')
        .select('id, metadata')
        .eq('company_id', this.companyId)
        .eq('date', seedEvent.date)
        .eq('title', seedEvent.title)
        .eq('global', true)
        .single();

      if (existingEvent) {
        // Update if needed
        const needsUpdate = !existingEvent.metadata?.curated_at;
        if (needsUpdate) {
          await this.supabase
            .from('calendar_events')
            .update({
              ai_origin: 'curated_ai',
              metadata: {
                ...existingEvent.metadata,
                curated_at: new Date().toISOString(),
                curated_from: 'global_seed',
              },
            })
            .eq('id', existingEvent.id);
          updated++;
        }
      } else {
        // Create new event for this company
        await this.supabase
          .from('calendar_events')
          .insert({
            company_id: this.companyId,
            date: seedEvent.date,
            title: seedEvent.title,
            channel: seedEvent.channel,
            category: seedEvent.category,
            importance: seedEvent.importance,
            source: 'seed',
            niche: null,
            global: true,
            ai_origin: 'curated_ai',
            metadata: {
              ...seedEvent.metadata,
              curated_at: new Date().toISOString(),
              curated_from: 'global_seed',
            },
          });
        added++;
      }
    }

    return { added, updated };
  }

  /**
   * Curate niche-specific events
   */
  private async curateNicheEvents(
    niche: string,
    silencedEvents: string[],
    maxEvents: number,
    importanceThreshold: string
  ): Promise<{ added: number; updated: number }> {
    // Get niche seed events
    const { data: nicheSeedEvents } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('niche', niche)
      .eq('ai_origin', 'seed')
      .is('company_id', null) // Template events
      .order('importance', { ascending: false })
      .limit(maxEvents);

    if (!nicheSeedEvents) return { added: 0, updated: 0 };

    let added = 0;
    let updated = 0;

    for (const seedEvent of nicheSeedEvents) {
      // Skip if below importance threshold
      if (!this.meetsImportanceThreshold(seedEvent.importance, importanceThreshold)) {
        continue;
      }

      // Skip if silenced
      const eventKey = `${seedEvent.date}-${seedEvent.title}`;
      if (silencedEvents.includes(eventKey)) continue;

      // Check if event already exists for this company
      const { data: existingEvent } = await this.supabase
        .from('calendar_events')
        .select('id, metadata')
        .eq('company_id', this.companyId)
        .eq('date', seedEvent.date)
        .eq('title', seedEvent.title)
        .eq('niche', niche)
        .single();

      if (existingEvent) {
        // Update if needed
        const needsUpdate = !existingEvent.metadata?.curated_at;
        if (needsUpdate) {
          await this.supabase
            .from('calendar_events')
            .update({
              ai_origin: 'curated_ai',
              metadata: {
                ...existingEvent.metadata,
                curated_at: new Date().toISOString(),
                curated_from: `niche_seed_${niche}`,
              },
            })
            .eq('id', existingEvent.id);
          updated++;
        }
      } else {
        // Create new event for this company
        await this.supabase
          .from('calendar_events')
          .insert({
            company_id: this.companyId,
            date: seedEvent.date,
            title: seedEvent.title,
            channel: seedEvent.channel,
            category: seedEvent.category,
            importance: seedEvent.importance,
            source: 'seed',
            niche: niche,
            global: false,
            ai_origin: 'curated_ai',
            metadata: {
              ...seedEvent.metadata,
              curated_at: new Date().toISOString(),
              curated_from: `niche_seed_${niche}`,
            },
          });
        added++;
      }
    }

    return { added, updated };
  }

  /**
   * Apply lead times to events
   */
  private async applyLeadTimes(leadTimes: Record<string, number>): Promise<void> {
    const defaultLeadTime = leadTimes.default || 7; // 7 days default

    // Get all curated events without lead time applied
    const { data: events } = await this.supabase
      .from('calendar_events')
      .select('id, date, channel, niche, metadata')
      .eq('company_id', this.companyId)
      .eq('ai_origin', 'curated_ai')
      .is('metadata->lead_time_applied', null);

    if (!events) return;

    for (const event of events) {
      // Determine lead time
      let leadTime = defaultLeadTime;
      
      if (event.channel && leadTimes[event.channel]) {
        leadTime = leadTimes[event.channel];
      } else if (event.niche && leadTimes[event.niche]) {
        leadTime = leadTimes[event.niche];
      }

      // Calculate preparation date
      const eventDate = new Date(event.date);
      const preparationDate = new Date(eventDate);
      preparationDate.setDate(preparationDate.getDate() - leadTime);

      // Update event metadata
      await this.supabase
        .from('calendar_events')
        .update({
          metadata: {
            ...event.metadata,
            lead_time_applied: leadTime,
            preparation_date: preparationDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          },
        })
        .eq('id', event.id);
    }
  }

  /**
   * Silence low-relevance events based on niche
   */
  private async silenceLowRelevanceEvents(
    primaryNiches: string[],
    currentSilencedEvents: string[]
  ): Promise<{ silenced: number }> {
    // Define low-relevance rules
    const lowRelevanceRules = [
      // If company is not in 'infantil' niche, reduce importance of children events
      {
        condition: !primaryNiches.includes('infantil'),
        events: ['Dia das Crianças', 'Dia da Infância'],
        action: 'reduce_importance',
      },
      // If company is not in 'moda' niche, reduce fashion events
      {
        condition: !primaryNiches.includes('moda'),
        events: ['São Paulo Fashion Week', 'Rio Fashion Week'],
        action: 'reduce_importance',
      },
      // If company is not in 'auto' niche, reduce auto events
      {
        condition: !primaryNiches.includes('auto'),
        events: ['Salão do Automóvel', 'Dia do Motorista'],
        action: 'reduce_importance',
      },
    ];

    let silenced = 0;

    for (const rule of lowRelevanceRules) {
      if (!rule.condition) continue;

      for (const eventTitle of rule.events) {
        const { data: events } = await this.supabase
          .from('calendar_events')
          .select('id, importance')
          .eq('company_id', this.companyId)
          .eq('title', eventTitle);

        if (!events) continue;

        for (const event of events) {
          if (rule.action === 'reduce_importance' && event.importance === 'high') {
            await this.supabase
              .from('calendar_events')
              .update({
                importance: 'low',
                metadata: {
                  original_importance: 'high',
                  silenced_reason: 'low_relevance_for_niche',
                  silenced_at: new Date().toISOString(),
                },
              })
              .eq('id', event.id);
            silenced++;
          }
        }
      }
    }

    return { silenced };
  }

  /**
   * Update company settings with curation metadata
   */
  private async updateCurationMetadata(resolvedNiches: ResolvedNiches): Promise<void> {
    const { data: company } = await this.supabase
      .from('companies')
      .select('settings')
      .eq('id', this.companyId)
      .single();

    const currentSettings = company?.settings || {};
    
    const updatedSettings = {
      ...currentSettings,
      calendar_last_curated: new Date().toISOString(),
      calendar_niches_applied: resolvedNiches.primary_niches,
      calendar_confidence: resolvedNiches.confidence_score,
    };

    await this.supabase
      .from('companies')
      .update({ settings: updatedSettings })
      .eq('id', this.companyId);
  }

  /**
   * Check if event meets importance threshold
   */
  private meetsImportanceThreshold(eventImportance: string, threshold: string): boolean {
    const importanceOrder = { low: 0, medium: 1, high: 2 };
    const eventLevel = importanceOrder[eventImportance as keyof typeof importanceOrder] ?? 0;
    const thresholdLevel = importanceOrder[threshold as keyof typeof importanceOrder] ?? 0;
    
    return eventLevel >= thresholdLevel;
  }

  /**
   * Get curated events for display
   */
  async getCuratedEvents(filters: {
    from?: string;
    to?: string;
    niche?: string;
    channel?: string;
    importance?: string;
    include_silenced?: boolean;
  } = {}): Promise<any[]> {
    let query = this.supabase
      .from('calendar_events')
      .select('*')
      .eq('company_id', this.companyId)
      .order('date', { ascending: true });

    // Apply filters
    if (filters.from) {
      query = query.gte('date', filters.from);
    }
    
    if (filters.to) {
      query = query.lte('date', filters.to);
    }
    
    if (filters.niche && filters.niche !== 'all') {
      if (filters.niche === 'global') {
        query = query.eq('global', true);
      } else {
        query = query.eq('niche', filters.niche);
      }
    }
    
    if (filters.channel && filters.channel !== 'all') {
      if (filters.channel === 'global') {
        query = query.is('channel', null);
      } else {
        query = query.eq('channel', filters.channel);
      }
    }
    
    if (filters.importance && filters.importance !== 'all') {
      query = query.eq('importance', filters.importance);
    }

    // Exclude silenced events unless explicitly requested
    if (!filters.include_silenced) {
      query = query.neq('importance', 'silenced');
    }

    const { data: events } = await query;
    return events || [];
  }
}
