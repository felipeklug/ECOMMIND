/**
 * Niche Resolver Service
 * Resolve company niches from marketplace categories and products
 */

import { createClient } from '@/lib/supabase/server';

export interface NicheScore {
  niche: string;
  score: number;
  confidence: number;
  categories: string[];
  revenue_weight: number;
  product_count: number;
}

export interface ResolvedNiches {
  primary_niches: string[];
  all_niches: NicheScore[];
  confidence_score: number;
  last_resolved: string;
  data_sources: string[];
}

export class NicheResolver {
  private companyId: string;
  private supabase: ReturnType<typeof createClient>;

  constructor(companyId: string) {
    this.companyId = companyId;
    this.supabase = createClient();
  }

  /**
   * Resolve company niches from available data
   */
  async resolveNiches(): Promise<ResolvedNiches> {
    // Get company settings for preferred niches
    const { data: company } = await this.supabase
      .from('companies')
      .select('settings')
      .eq('id', this.companyId)
      .single();

    const preferredNiches = company?.settings?.preferred_niches || [];
    const marketScope = company?.settings?.marketScope || 'category';

    // Get data sources
    const dataSources = await this.getAvailableDataSources();
    
    // Calculate niche scores from different sources
    const nicheScores = new Map<string, NicheScore>();

    // 1. From marketplace categories (if available)
    if (dataSources.includes('marketplace_categories')) {
      const categoryNiches = await this.resolveFromCategories();
      this.mergeNicheScores(nicheScores, categoryNiches, 0.4);
    }

    // 2. From product data
    if (dataSources.includes('products')) {
      const productNiches = await this.resolveFromProducts();
      this.mergeNicheScores(nicheScores, productNiches, 0.3);
    }

    // 3. From order history
    if (dataSources.includes('orders')) {
      const orderNiches = await this.resolveFromOrders();
      this.mergeNicheScores(nicheScores, orderNiches, 0.2);
    }

    // 4. From preferred niches (manual override)
    if (preferredNiches.length > 0) {
      const preferredNicheScores = this.createPreferredNicheScores(preferredNiches);
      this.mergeNicheScores(nicheScores, preferredNicheScores, 0.1);
    }

    // Convert to array and sort by score
    const allNiches = Array.from(nicheScores.values())
      .sort((a, b) => b.score - a.score);

    // Determine primary niches (score > 0.3 or top 3)
    const primaryNiches = allNiches
      .filter(n => n.score > 0.3)
      .slice(0, 3)
      .map(n => n.niche);

    // If no strong niches found, take top 2
    if (primaryNiches.length === 0 && allNiches.length > 0) {
      primaryNiches.push(...allNiches.slice(0, 2).map(n => n.niche));
    }

    // Calculate overall confidence
    const confidenceScore = this.calculateConfidenceScore(allNiches, dataSources);

    const result: ResolvedNiches = {
      primary_niches: primaryNiches,
      all_niches: allNiches,
      confidence_score: confidenceScore,
      last_resolved: new Date().toISOString(),
      data_sources: dataSources,
    };

    // Save to company settings
    await this.saveResolvedNiches(result);

    return result;
  }

  /**
   * Get available data sources for niche resolution
   */
  private async getAvailableDataSources(): Promise<string[]> {
    const sources: string[] = [];

    // Check for products
    const { count: productCount } = await this.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', this.companyId);

    if (productCount && productCount > 0) {
      sources.push('products');
    }

    // Check for orders
    const { count: orderCount } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', this.companyId);

    if (orderCount && orderCount > 0) {
      sources.push('orders');
    }

    // Check for marketplace categories (would come from integrations)
    // For now, we'll simulate this based on products with categories
    const { count: categorizedProductCount } = await this.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', this.companyId)
      .not('category', 'is', null);

    if (categorizedProductCount && categorizedProductCount > 0) {
      sources.push('marketplace_categories');
    }

    return sources;
  }

  /**
   * Resolve niches from marketplace categories
   */
  private async resolveFromCategories(): Promise<NicheScore[]> {
    const { data: products } = await this.supabase
      .from('products')
      .select('category, price')
      .eq('company_id', this.companyId)
      .not('category', 'is', null);

    if (!products || products.length === 0) return [];

    // Group by category and calculate revenue weight
    const categoryStats = new Map<string, { count: number; revenue: number }>();
    
    for (const product of products) {
      const category = product.category;
      const price = product.price || 0;
      
      if (!categoryStats.has(category)) {
        categoryStats.set(category, { count: 0, revenue: 0 });
      }
      
      const stats = categoryStats.get(category)!;
      stats.count += 1;
      stats.revenue += price;
    }

    // Map categories to niches
    const nicheScores: NicheScore[] = [];
    
    for (const [category, stats] of categoryStats) {
      const mappedNiches = await this.mapCategoryToNiches(category);
      
      for (const mapping of mappedNiches) {
        const existingNiche = nicheScores.find(n => n.niche === mapping.niche);
        
        if (existingNiche) {
          existingNiche.score += stats.count * mapping.confidence;
          existingNiche.revenue_weight += stats.revenue;
          existingNiche.product_count += stats.count;
          existingNiche.categories.push(category);
        } else {
          nicheScores.push({
            niche: mapping.niche,
            score: stats.count * mapping.confidence,
            confidence: mapping.confidence,
            categories: [category],
            revenue_weight: stats.revenue,
            product_count: stats.count,
          });
        }
      }
    }

    // Normalize scores
    const maxScore = Math.max(...nicheScores.map(n => n.score));
    if (maxScore > 0) {
      nicheScores.forEach(n => n.score = n.score / maxScore);
    }

    return nicheScores;
  }

  /**
   * Resolve niches from product data
   */
  private async resolveFromProducts(): Promise<NicheScore[]> {
    const { data: products } = await this.supabase
      .from('products')
      .select('title, category, price')
      .eq('company_id', this.companyId);

    if (!products || products.length === 0) return [];

    // Simple keyword-based niche detection
    const nicheKeywords = {
      pet: ['pet', 'animal', 'cachorro', 'gato', 'ração', 'coleira', 'brinquedo pet'],
      moda: ['roupa', 'calça', 'camisa', 'vestido', 'sapato', 'tênis', 'bolsa', 'acessório'],
      beleza: ['maquiagem', 'perfume', 'creme', 'shampoo', 'hidratante', 'batom'],
      saude: ['vitamina', 'suplemento', 'medicamento', 'saúde', 'bem-estar'],
      auto: ['carro', 'moto', 'pneu', 'óleo', 'peça', 'automotivo'],
      casa: ['móvel', 'decoração', 'cozinha', 'quarto', 'sala', 'casa'],
      eletronicos: ['eletrônico', 'celular', 'computador', 'tv', 'fone', 'cabo'],
      infantil: ['criança', 'bebê', 'brinquedo', 'fralda', 'mamadeira'],
      esportes: ['esporte', 'academia', 'fitness', 'corrida', 'futebol'],
      games: ['game', 'jogo', 'console', 'playstation', 'xbox'],
    };

    const nicheScores = new Map<string, NicheScore>();

    for (const product of products) {
      const text = `${product.title} ${product.category || ''}`.toLowerCase();
      
      for (const [niche, keywords] of Object.entries(nicheKeywords)) {
        const matches = keywords.filter(keyword => text.includes(keyword)).length;
        
        if (matches > 0) {
          const confidence = Math.min(matches / keywords.length, 1);
          const score = matches * confidence;
          
          if (!nicheScores.has(niche)) {
            nicheScores.set(niche, {
              niche,
              score: 0,
              confidence: 0,
              categories: [],
              revenue_weight: 0,
              product_count: 0,
            });
          }
          
          const nicheScore = nicheScores.get(niche)!;
          nicheScore.score += score;
          nicheScore.confidence = Math.max(nicheScore.confidence, confidence);
          nicheScore.revenue_weight += product.price || 0;
          nicheScore.product_count += 1;
          
          if (product.category && !nicheScore.categories.includes(product.category)) {
            nicheScore.categories.push(product.category);
          }
        }
      }
    }

    return Array.from(nicheScores.values());
  }

  /**
   * Resolve niches from order history
   */
  private async resolveFromOrders(): Promise<NicheScore[]> {
    // Get recent orders (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: orderItems } = await this.supabase
      .from('order_items')
      .select(`
        qty,
        unit_price,
        products!inner(title, category)
      `)
      .eq('company_id', this.companyId)
      .gte('created_dt', ninetyDaysAgo.toISOString());

    if (!orderItems || orderItems.length === 0) return [];

    // Use product-based resolution but weight by sales volume
    const productNiches = await this.resolveFromProducts();
    
    // Weight by order volume
    for (const item of orderItems) {
      const product = item.products as any;
      if (!product) continue;
      
      const revenue = item.qty * item.unit_price;
      
      // Find matching niches and boost their scores
      for (const nicheScore of productNiches) {
        const text = `${product.title} ${product.category || ''}`.toLowerCase();
        
        // Simple check if this product matches the niche
        if (this.productMatchesNiche(text, nicheScore.niche)) {
          nicheScore.score += revenue * 0.001; // Scale factor
          nicheScore.revenue_weight += revenue;
        }
      }
    }

    return productNiches;
  }

  /**
   * Map category to niches using the mapping table
   */
  private async mapCategoryToNiches(category: string): Promise<Array<{ niche: string; confidence: number }>> {
    const { data: mappings } = await this.supabase
      .from('category_niche_map')
      .select('niche, confidence')
      .ilike('category_path', `%${category}%`)
      .order('confidence', { ascending: false });

    if (!mappings || mappings.length === 0) {
      // Fallback to keyword matching
      return this.fallbackCategoryMapping(category);
    }

    return mappings;
  }

  /**
   * Fallback category mapping using keywords
   */
  private fallbackCategoryMapping(category: string): Array<{ niche: string; confidence: number }> {
    const categoryLower = category.toLowerCase();
    const mappings: Array<{ niche: string; confidence: number }> = [];

    if (categoryLower.includes('pet') || categoryLower.includes('animal')) {
      mappings.push({ niche: 'pet', confidence: 0.8 });
    }
    if (categoryLower.includes('roupa') || categoryLower.includes('moda') || categoryLower.includes('calça')) {
      mappings.push({ niche: 'moda', confidence: 0.8 });
    }
    if (categoryLower.includes('beleza') || categoryLower.includes('cosmético')) {
      mappings.push({ niche: 'beleza', confidence: 0.8 });
    }
    if (categoryLower.includes('saúde') || categoryLower.includes('medicamento')) {
      mappings.push({ niche: 'saude', confidence: 0.8 });
    }
    if (categoryLower.includes('auto') || categoryLower.includes('carro') || categoryLower.includes('moto')) {
      mappings.push({ niche: 'auto', confidence: 0.8 });
    }
    if (categoryLower.includes('casa') || categoryLower.includes('móvel') || categoryLower.includes('decoração')) {
      mappings.push({ niche: 'casa', confidence: 0.8 });
    }
    if (categoryLower.includes('eletrônico') || categoryLower.includes('celular') || categoryLower.includes('computador')) {
      mappings.push({ niche: 'eletronicos', confidence: 0.8 });
    }
    if (categoryLower.includes('criança') || categoryLower.includes('bebê') || categoryLower.includes('infantil')) {
      mappings.push({ niche: 'infantil', confidence: 0.8 });
    }
    if (categoryLower.includes('esporte') || categoryLower.includes('fitness')) {
      mappings.push({ niche: 'esportes', confidence: 0.8 });
    }
    if (categoryLower.includes('game') || categoryLower.includes('jogo')) {
      mappings.push({ niche: 'games', confidence: 0.8 });
    }

    return mappings;
  }

  /**
   * Check if product matches niche
   */
  private productMatchesNiche(productText: string, niche: string): boolean {
    const nicheKeywords = {
      pet: ['pet', 'animal', 'cachorro', 'gato'],
      moda: ['roupa', 'calça', 'camisa', 'vestido'],
      beleza: ['maquiagem', 'perfume', 'creme'],
      saude: ['vitamina', 'suplemento', 'saúde'],
      auto: ['carro', 'moto', 'automotivo'],
      casa: ['móvel', 'decoração', 'casa'],
      eletronicos: ['eletrônico', 'celular', 'computador'],
      infantil: ['criança', 'bebê', 'brinquedo'],
      esportes: ['esporte', 'academia', 'fitness'],
      games: ['game', 'jogo', 'console'],
    };

    const keywords = nicheKeywords[niche as keyof typeof nicheKeywords] || [];
    return keywords.some(keyword => productText.includes(keyword));
  }

  /**
   * Create niche scores from preferred niches
   */
  private createPreferredNicheScores(preferredNiches: string[]): NicheScore[] {
    return preferredNiches.map((niche, index) => ({
      niche,
      score: 1.0 - (index * 0.1), // Decreasing score for order
      confidence: 1.0,
      categories: ['preferred'],
      revenue_weight: 0,
      product_count: 0,
    }));
  }

  /**
   * Merge niche scores with weight
   */
  private mergeNicheScores(
    target: Map<string, NicheScore>,
    source: NicheScore[],
    weight: number
  ): void {
    for (const sourceNiche of source) {
      const existing = target.get(sourceNiche.niche);
      
      if (existing) {
        existing.score += sourceNiche.score * weight;
        existing.confidence = Math.max(existing.confidence, sourceNiche.confidence);
        existing.revenue_weight += sourceNiche.revenue_weight;
        existing.product_count += sourceNiche.product_count;
        existing.categories.push(...sourceNiche.categories);
      } else {
        target.set(sourceNiche.niche, {
          ...sourceNiche,
          score: sourceNiche.score * weight,
        });
      }
    }
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidenceScore(niches: NicheScore[], dataSources: string[]): number {
    if (niches.length === 0) return 0;

    // Base confidence from data sources
    let confidence = dataSources.length * 0.2; // 0.2 per data source

    // Boost confidence if we have strong niches
    const strongNiches = niches.filter(n => n.score > 0.5);
    confidence += strongNiches.length * 0.1;

    // Boost confidence if we have good category mapping
    const wellMappedNiches = niches.filter(n => n.confidence > 0.8);
    confidence += wellMappedNiches.length * 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Save resolved niches to company settings
   */
  private async saveResolvedNiches(resolvedNiches: ResolvedNiches): Promise<void> {
    const { data: company } = await this.supabase
      .from('companies')
      .select('settings')
      .eq('id', this.companyId)
      .single();

    const currentSettings = company?.settings || {};
    
    const updatedSettings = {
      ...currentSettings,
      niches_resolved: resolvedNiches.primary_niches,
      niches_all: resolvedNiches.all_niches,
      niches_confidence: resolvedNiches.confidence_score,
      niches_last_resolved: resolvedNiches.last_resolved,
      niches_data_sources: resolvedNiches.data_sources,
    };

    await this.supabase
      .from('companies')
      .update({ settings: updatedSettings })
      .eq('id', this.companyId);
  }
}
