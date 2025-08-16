/**
 * Data Normalizers
 * Normalize uploaded data for calendar and market intelligence
 */

import { z } from 'zod';

// Calendar Event Schema
const CalendarEventSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  title: z.string().min(1).max(200).trim(),
  channel: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  importance: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Market Record Schema
const MarketRecordSchema = z.object({
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  scope: z.enum(['niche', 'category']),
  channel: z.string().min(1),
  category: z.string().min(1).max(100),
  record_type: z.enum(['listing', 'keyword', 'category']),
  identifier: z.string().min(1).max(100),
  title: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  price_median: z.number().nullable().optional(),
  demand_index: z.number().min(0).max(100).nullable().optional(),
  growth_rate: z.number().min(-1).max(5).nullable().optional(),
  sellers_top: z.number().int().min(0).nullable().optional(),
  units_sold_est: z.number().min(0).nullable().optional(),
  revenue_est: z.number().min(0).nullable().optional(),
  attributes: z.string().optional(),
});

export interface NormalizedCalendarEvent {
  date: string;
  title: string;
  channel: string | null;
  category: string | null;
  importance: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
}

export interface NormalizedMarketRecord {
  period_start: string;
  period_end: string;
  scope: 'niche' | 'category';
  channel: string;
  category: string;
  record_type: 'listing' | 'keyword' | 'category';
  identifier: string;
  title: string | null;
  price: number | null;
  price_median: number | null;
  demand_index: number | null;
  growth_rate: number | null;
  sellers_top: number | null;
  units_sold_est: number | null;
  revenue_est: number | null;
  attributes: Record<string, any>;
}

export class CalendarNormalizer {
  static normalize(rawData: any[]): { 
    valid: NormalizedCalendarEvent[], 
    errors: Array<{ row: number, errors: string[] }> 
  } {
    const valid: NormalizedCalendarEvent[] = [];
    const errors: Array<{ row: number, errors: string[] }> = [];

    rawData.forEach((row, index) => {
      try {
        const parsed = CalendarEventSchema.parse(row);
        
        // Normalize channel
        let channel = parsed.channel?.toLowerCase().trim() || null;
        if (channel === 'all' || channel === 'todos') {
          channel = null; // Global event
        } else if (channel && !['meli', 'shopee', 'amazon', 'site'].includes(channel)) {
          channel = 'site'; // Default fallback
        }

        // Sanitize and trim strings
        const title = parsed.title.trim().substring(0, 200);
        const category = parsed.category?.trim().substring(0, 100) || null;

        valid.push({
          date: new Date(parsed.date).toISOString().split('T')[0],
          title,
          channel,
          category,
          importance: parsed.importance,
          metadata: {
            source: 'upload',
            originalRow: index + 1,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: index + 1,
            errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          });
        } else {
          errors.push({
            row: index + 1,
            errors: ['Unknown validation error'],
          });
        }
      }
    });

    return { valid, errors };
  }
}

export class MarketDatasetNormalizer {
  static normalize(rawData: any[]): {
    valid: NormalizedMarketRecord[],
    errors: Array<{ row: number, errors: string[] }>
  } {
    const valid: NormalizedMarketRecord[] = [];
    const errors: Array<{ row: number, errors: string[] }> = [];

    rawData.forEach((row, index) => {
      try {
        // Parse numeric fields
        const numericFields = ['price', 'price_median', 'demand_index', 'growth_rate', 'sellers_top', 'units_sold_est', 'revenue_est'];
        const processedRow = { ...row };
        
        numericFields.forEach(field => {
          if (processedRow[field] !== undefined && processedRow[field] !== null && processedRow[field] !== '') {
            const num = parseFloat(processedRow[field]);
            processedRow[field] = isNaN(num) ? null : num;
          } else {
            processedRow[field] = null;
          }
        });

        const parsed = MarketRecordSchema.parse(processedRow);

        // Normalize channel
        let channel = parsed.channel.toLowerCase().trim();
        if (!['meli', 'shopee', 'amazon', 'site'].includes(channel)) {
          channel = 'unknown';
        }

        // Parse attributes JSON
        let attributes: Record<string, any> = {};
        if (parsed.attributes) {
          try {
            attributes = JSON.parse(parsed.attributes);
          } catch {
            attributes = { raw: parsed.attributes };
          }
        }

        // Sanitize strings
        const category = parsed.category.trim().substring(0, 100);
        const identifier = parsed.identifier.trim().substring(0, 100);
        const title = parsed.title?.trim().substring(0, 200) || null;

        valid.push({
          period_start: new Date(parsed.period_start).toISOString().split('T')[0],
          period_end: new Date(parsed.period_end).toISOString().split('T')[0],
          scope: parsed.scope,
          channel,
          category,
          record_type: parsed.record_type,
          identifier,
          title,
          price: parsed.price,
          price_median: parsed.price_median,
          demand_index: parsed.demand_index,
          growth_rate: parsed.growth_rate,
          sellers_top: parsed.sellers_top,
          units_sold_est: parsed.units_sold_est,
          revenue_est: parsed.revenue_est,
          attributes,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: index + 1,
            errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          });
        } else {
          errors.push({
            row: index + 1,
            errors: ['Unknown validation error'],
          });
        }
      }
    });

    return { valid, errors };
  }
}

/**
 * Utility functions for data validation
 */
export class DataValidator {
  static isValidChannel(channel: string): boolean {
    return ['meli', 'shopee', 'amazon', 'site', 'all', 'todos'].includes(channel.toLowerCase());
  }

  static isValidImportance(importance: string): boolean {
    return ['low', 'medium', 'high'].includes(importance.toLowerCase());
  }

  static isValidRecordType(type: string): boolean {
    return ['listing', 'keyword', 'category'].includes(type.toLowerCase());
  }

  static isValidScope(scope: string): boolean {
    return ['niche', 'category'].includes(scope.toLowerCase());
  }

  static sanitizeText(text: string, maxLength: number = 200): string {
    return text.trim().substring(0, maxLength);
  }

  static parseNumeric(value: any): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  static parseAttributes(attributesString: string): Record<string, any> {
    if (!attributesString) return {};
    
    try {
      return JSON.parse(attributesString);
    } catch {
      return { raw: attributesString };
    }
  }
}
