/**
 * Market Intelligence Engine
 * Generates insights from market data records
 */

import { createClient } from '@/lib/supabase/server';

export interface MarketRecord {
  id: string;
  channel: string;
  category: string;
  identifier: string;
  record_type: 'listing' | 'keyword' | 'category';
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

export interface CompanyContext {
  id: string;
  focusCategories: string[];
  activeChannels: string[];
  products: Array<{
    sku: string;
    title: string;
    category: string;
    price: number;
  }>;
  settings: {
    commissions: Record<string, number>;
    margins: Record<string, number>;
  };
}

export interface InsightPayload {
  agent: string;
  module: string;
  type: string;
  title: string;
  summary: string;
  evidence: Record<string, any>;
  scope: Record<string, any>;
  confidence: number;
  impact: string;
  impact_estimate: Record<string, any>;
  dedupe_key: string;
  create_mission: boolean;
  priority: 'P0' | 'P1' | 'P2';
  sla_days: number;
}

export class MarketIntelEngine {
  private companyId: string;
  private context: CompanyContext;
  private records: MarketRecord[];

  constructor(companyId: string, context: CompanyContext, records: MarketRecord[]) {
    this.companyId = companyId;
    this.context = context;
    this.records = records;
  }

  /**
   * Generate all insights from the records
   */
  async generateInsights(): Promise<InsightPayload[]> {
    const insights: InsightPayload[] = [];

    // Generate different types of insights
    insights.push(...this.generateTrendOpportunities());
    insights.push(...this.generateGapPortfolio());
    insights.push(...this.generatePriceGaps());
    insights.push(...this.generateVariationOpportunities());
    insights.push(...this.generateBundleOpportunities());

    return insights;
  }

  /**
   * TrendOpportunity: High growth + high demand
   */
  private generateTrendOpportunities(): InsightPayload[] {
    const insights: InsightPayload[] = [];

    const trendingRecords = this.records.filter(record => 
      (record.growth_rate || 0) >= 0.15 && 
      (record.demand_index || 0) >= 60
    );

    for (const record of trendingRecords) {
      const isTopCategory = this.context.focusCategories.includes(record.category);
      const priority = isTopCategory ? 'P0' : 'P1';
      const sla_days = priority === 'P0' ? 2 : 5;

      const insight: InsightPayload = {
        agent: 'market',
        module: 'market',
        type: 'trend_opportunity',
        title: `Tendência em alta: ${record.identifier}`,
        summary: `${record.category} apresenta crescimento de ${((record.growth_rate || 0) * 100).toFixed(1)}% com demanda ${record.demand_index}/100`,
        evidence: {
          growth_rate: record.growth_rate,
          demand_index: record.demand_index,
          price_median: record.price_median,
          revenue_est: record.revenue_est,
          sellers_top: record.sellers_top,
        },
        scope: {
          category: record.category,
          channel: record.channel,
          identifier: record.identifier,
          record_type: record.record_type,
        },
        confidence: this.calculateConfidence(record),
        impact: 'revenue',
        impact_estimate: {
          potential_revenue: record.revenue_est || 0,
          market_size: record.units_sold_est || 0,
        },
        dedupe_key: `market:trend_opportunity:${record.identifier}:${this.getPeriodKey()}`,
        create_mission: true,
        priority,
        sla_days,
      };

      insights.push(insight);
    }

    return insights;
  }

  /**
   * GapPortfolio: High demand but not in our portfolio
   */
  private generateGapPortfolio(): InsightPayload[] {
    const insights: InsightPayload[] = [];

    const gapRecords = this.records.filter(record => {
      const hasGoodDemand = (record.demand_index || 0) >= 50;
      const notInPortfolio = !this.isInPortfolio(record);
      return hasGoodDemand && notInPortfolio;
    });

    for (const record of gapRecords) {
      const insight: InsightPayload = {
        agent: 'market',
        module: 'market',
        type: 'gap_portfolio',
        title: `Gap no portfólio: ${record.identifier}`,
        summary: `Oportunidade com demanda ${record.demand_index}/100 não coberta pelo portfólio atual`,
        evidence: {
          demand_index: record.demand_index,
          sellers_top: record.sellers_top,
          price_median: record.price_median,
          category: record.category,
        },
        scope: {
          category: record.category,
          channel: record.channel,
          identifier: record.identifier,
          record_type: record.record_type,
        },
        confidence: this.calculateConfidence(record),
        impact: 'portfolio',
        impact_estimate: {
          potential_revenue: record.revenue_est || 0,
          competition_level: record.sellers_top || 0,
        },
        dedupe_key: `market:gap_portfolio:${record.identifier}:${this.getPeriodKey()}`,
        create_mission: true,
        priority: 'P1',
        sla_days: 5,
      };

      insights.push(insight);
    }

    return insights;
  }

  /**
   * PriceGap: Price difference vs market median
   */
  private generatePriceGaps(): InsightPayload[] {
    const insights: InsightPayload[] = [];

    for (const record of this.records) {
      if (!record.price_median) continue;

      const similarProduct = this.findSimilarProduct(record);
      if (!similarProduct) continue;

      const gapPercent = ((record.price_median - similarProduct.price) / similarProduct.price) * 100;
      
      // Only flag significant gaps (>15%)
      if (Math.abs(gapPercent) < 15) continue;

      const insight: InsightPayload = {
        agent: 'market',
        module: 'market',
        type: 'price_gap',
        title: `Gap de preço: ${similarProduct.sku}`,
        summary: `Preço ${gapPercent > 0 ? 'abaixo' : 'acima'} do mercado em ${Math.abs(gapPercent).toFixed(1)}%`,
        evidence: {
          current_price: similarProduct.price,
          market_median: record.price_median,
          gap_percent: gapPercent,
          channel: record.channel,
        },
        scope: {
          sku: similarProduct.sku,
          category: record.category,
          channel: record.channel,
          identifier: record.identifier,
        },
        confidence: 0.8,
        impact: 'pricing',
        impact_estimate: {
          price_adjustment: record.price_median,
          revenue_impact: (record.revenue_est || 0) * 0.1, // Estimate 10% impact
        },
        dedupe_key: `market:price_gap:${similarProduct.sku}:${record.channel}:${this.getPeriodKey()}`,
        create_mission: true,
        priority: 'P2',
        sla_days: 14,
      };

      insights.push(insight);
    }

    return insights;
  }

  /**
   * VariationOpportunity: Missing variations
   */
  private generateVariationOpportunities(): InsightPayload[] {
    const insights: InsightPayload[] = [];

    const variationRecords = this.records.filter(record => 
      record.attributes.variations || record.attributes.colors || record.attributes.sizes
    );

    for (const record of variationRecords) {
      const similarProduct = this.findSimilarProduct(record);
      if (!similarProduct) continue;

      const marketVariations = this.extractVariations(record.attributes);
      const missingVariations = marketVariations.filter(v => !this.hasVariation(similarProduct, v));

      if (missingVariations.length === 0) continue;

      const insight: InsightPayload = {
        agent: 'market',
        module: 'market',
        type: 'variation_opportunity',
        title: `Variações ausentes: ${similarProduct.sku}`,
        summary: `${missingVariations.length} variações populares não disponíveis`,
        evidence: {
          missing_variations: missingVariations,
          market_variations: marketVariations,
          demand_index: record.demand_index,
        },
        scope: {
          sku: similarProduct.sku,
          category: record.category,
          channel: record.channel,
        },
        confidence: 0.7,
        impact: 'portfolio',
        impact_estimate: {
          additional_skus: missingVariations.length,
          revenue_potential: (record.revenue_est || 0) * 0.2,
        },
        dedupe_key: `market:variation_opportunity:${similarProduct.sku}:${this.getPeriodKey()}`,
        create_mission: true,
        priority: 'P2',
        sla_days: 14,
      };

      insights.push(insight);
    }

    return insights;
  }

  /**
   * BundleOpportunity: Kit/combo opportunities
   */
  private generateBundleOpportunities(): InsightPayload[] {
    const insights: InsightPayload[] = [];

    const bundleRecords = this.records.filter(record => 
      record.attributes.bundle || 
      (record.title && /kit|combo|conjunto/i.test(record.title)) ||
      (record.identifier && /kit|combo/i.test(record.identifier))
    );

    for (const record of bundleRecords) {
      if ((record.revenue_est || 0) < 10000) continue; // Only significant bundles

      const insight: InsightPayload = {
        agent: 'market',
        module: 'market',
        type: 'bundle_opportunity',
        title: `Oportunidade de kit: ${record.identifier}`,
        summary: `Kit com receita estimada de R$ ${(record.revenue_est || 0).toLocaleString('pt-BR')}`,
        evidence: {
          revenue_est: record.revenue_est,
          units_sold_est: record.units_sold_est,
          price_median: record.price_median,
          pattern: 'kit',
        },
        scope: {
          category: record.category,
          channel: record.channel,
          identifier: record.identifier,
        },
        confidence: 0.6,
        impact: 'portfolio',
        impact_estimate: {
          bundle_revenue: record.revenue_est || 0,
          market_size: record.units_sold_est || 0,
        },
        dedupe_key: `market:bundle_opportunity:${record.identifier}:${this.getPeriodKey()}`,
        create_mission: true,
        priority: 'P2',
        sla_days: 14,
      };

      insights.push(insight);
    }

    return insights;
  }

  /**
   * Helper methods
   */
  private calculateConfidence(record: MarketRecord): number {
    let confidence = 0.5;

    // Higher confidence for more data points
    if (record.demand_index !== null) confidence += 0.1;
    if (record.growth_rate !== null) confidence += 0.1;
    if (record.revenue_est !== null) confidence += 0.1;
    if (record.sellers_top !== null) confidence += 0.1;
    if (record.price_median !== null) confidence += 0.1;

    // Higher confidence for established channels
    if (['meli', 'shopee'].includes(record.channel)) confidence += 0.1;

    return Math.min(confidence, 0.95);
  }

  private isInPortfolio(record: MarketRecord): boolean {
    return this.context.products.some(product => 
      this.isSimilar(product.title, record.title || record.identifier) ||
      this.isSimilar(product.sku, record.identifier)
    );
  }

  private findSimilarProduct(record: MarketRecord) {
    return this.context.products.find(product =>
      this.isSimilar(product.title, record.title || record.identifier) ||
      product.category === record.category
    );
  }

  private isSimilar(text1: string, text2: string): boolean {
    if (!text1 || !text2) return false;
    
    const normalize = (text: string) => text.toLowerCase().trim();
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);

    // Simple similarity check
    return normalized1.includes(normalized2) || 
           normalized2.includes(normalized1) ||
           this.calculateSimilarity(normalized1, normalized2) > 0.7;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  private extractVariations(attributes: Record<string, any>): string[] {
    const variations: string[] = [];
    
    if (attributes.variations) variations.push(...attributes.variations);
    if (attributes.colors) variations.push(...attributes.colors);
    if (attributes.sizes) variations.push(...attributes.sizes);
    
    return variations;
  }

  private hasVariation(product: any, variation: string): boolean {
    // Simplified check - in real implementation, would check product variations
    return false;
  }

  private getPeriodKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
