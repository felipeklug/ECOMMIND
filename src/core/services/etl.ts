/**
 * ETL Service
 * Handles data extraction, transformation, and loading with checkpoints
 */

import { createClient } from '@/lib/supabase/server';
import { logger, createTimer } from '@/lib/logger';
import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
import { decryptToken } from '@/lib/crypto';
import type { 
  EncryptedTokenData, 
  MappedProduct, 
  MappedOrder, 
  MappedOrderItem,
  ETLRun 
} from '@/core/types/bling';

export interface ETLResult {
  success: boolean;
  pages: number;
  rows: number;
  duration: number;
  error?: string;
}

export class ETLService {
  private supabase = createClient();
  private blingAdapter = new BlingAdapter();

  /**
   * Get last checkpoint for a source
   */
  private async getLastCheckpoint(companyId: string, source: string): Promise<Date | null> {
    try {
      const { data, error } = await this.supabase
        .from('etl_checkpoints')
        .select('last_run_at')
        .eq('company_id', companyId)
        .eq('source', source)
        .single();

      if (error || !data) {
        return null;
      }

      return new Date(data.last_run_at);
    } catch (error) {
      logger.error('Failed to get ETL checkpoint', { companyId, source, error });
      return null;
    }
  }

  /**
   * Update checkpoint for a source
   */
  private async updateCheckpoint(companyId: string, source: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      const { error } = await this.supabase
        .from('etl_checkpoints')
        .upsert({
          company_id: companyId,
          source,
          last_run_at: now,
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Failed to update ETL checkpoint', { companyId, source, error });
      throw error;
    }
  }

  /**
   * Create ETL run record
   */
  private async createETLRun(
    companyId: string,
    source: string,
    metadata?: any
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('etl_runs')
        .insert({
          company_id: companyId,
          source,
          started_at: new Date().toISOString(),
          ok: false,
          metadata,
        })
        .select('id')
        .single();

      if (error || !data) {
        throw error || new Error('Failed to create ETL run');
      }

      return data.id;
    } catch (error) {
      logger.error('Failed to create ETL run', { companyId, source, error });
      throw error;
    }
  }

  /**
   * Update ETL run with results
   */
  private async updateETLRun(
    runId: string,
    result: Partial<ETLRun>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('etl_runs')
        .update({
          ...result,
          finished_at: new Date().toISOString(),
        })
        .eq('id', runId);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Failed to update ETL run', { runId, error });
      throw error;
    }
  }

  /**
   * Get encrypted Bling tokens for company
   */
  private async getBlingTokens(companyId: string): Promise<EncryptedTokenData> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('bling_tokens')
        .eq('id', companyId)
        .single();

      if (error || !data?.bling_tokens) {
        throw new Error('Bling integration not found or not configured');
      }

      return data.bling_tokens as EncryptedTokenData;
    } catch (error) {
      logger.error('Failed to get Bling tokens', { companyId, error });
      throw error;
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getValidAccessToken(companyId: string): Promise<string> {
    try {
      let tokenData = await this.getBlingTokens(companyId);
      
      // Check if token is expired (with 5 minute buffer)
      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      
      if (expiresAt.getTime() - now.getTime() < bufferTime) {
        logger.info('Bling token expired, refreshing', { companyId });
        
        // Refresh token
        tokenData = await this.blingAdapter.refreshToken(tokenData);
        
        // Save refreshed tokens
        await this.supabase
          .from('companies')
          .update({ bling_tokens: tokenData })
          .eq('id', companyId);
      }
      
      return decryptToken(tokenData.access_token);
    } catch (error) {
      logger.error('Failed to get valid access token', { companyId, error });
      throw error;
    }
  }

  /**
   * Calculate since timestamp with 30-minute overlap
   */
  private calculateSinceTimestamp(lastCheckpoint: Date | null): string | undefined {
    if (!lastCheckpoint) {
      return undefined; // First run, get all data
    }
    
    // Subtract 30 minutes for overlap
    const since = new Date(lastCheckpoint.getTime() - (30 * 60 * 1000));
    return since.toISOString();
  }

  /**
   * ETL Products from Bling
   */
  async syncProducts(companyId: string): Promise<ETLResult> {
    const timer = createTimer('bling_products_etl');
    const source = 'bling.products';
    let runId: string | null = null;
    
    try {
      // Create ETL run record
      runId = await this.createETLRun(companyId, source);
      
      // Get access token
      const accessToken = await this.getValidAccessToken(companyId);
      
      // Get last checkpoint
      const lastCheckpoint = await this.getLastCheckpoint(companyId, source);
      const since = this.calculateSinceTimestamp(lastCheckpoint);
      
      logger.info('Starting Bling products ETL', { 
        companyId, 
        since, 
        lastCheckpoint: lastCheckpoint?.toISOString() 
      });

      let page = 1;
      let totalRows = 0;
      let totalPages = 0;
      let hasMore = true;

      while (hasMore) {
        // Fetch products page
        const productsPage = await this.blingAdapter.getProducts(accessToken, since, page);
        
        if (productsPage.data.length === 0) {
          break;
        }

        // Map products to our schema
        const mappedProducts: MappedProduct[] = productsPage.data.map(product => 
          this.blingAdapter.mapProduct(product, companyId)
        );

        // Upsert products in batch
        const { error } = await this.supabase
          .from('products')
          .upsert(mappedProducts, {
            onConflict: 'company_id,sku',
            ignoreDuplicates: false,
          });

        if (error) {
          throw new Error(`Failed to upsert products: ${error.message}`);
        }

        totalRows += mappedProducts.length;
        totalPages = page;
        hasMore = productsPage.hasMore;
        page++;

        logger.info('Processed products page', { 
          companyId, 
          page: page - 1, 
          rows: mappedProducts.length,
          totalRows 
        });
      }

      // Update checkpoint
      await this.updateCheckpoint(companyId, source);

      // Update ETL run with success
      if (runId) {
        await this.updateETLRun(runId, {
          ok: true,
          pages: totalPages,
          rows: totalRows,
        });
      }

      const duration = timer.end({ companyId, pages: totalPages, rows: totalRows });

      logger.info('Bling products ETL completed', { 
        companyId, 
        pages: totalPages, 
        rows: totalRows,
        duration 
      });

      return {
        success: true,
        pages: totalPages,
        rows: totalRows,
        duration,
      };

    } catch (error) {
      const duration = timer.end({ error: true });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update ETL run with error
      if (runId) {
        await this.updateETLRun(runId, {
          ok: false,
          error: errorMessage,
        });
      }

      logger.error('Bling products ETL failed', { 
        companyId, 
        error: errorMessage,
        duration 
      });

      return {
        success: false,
        pages: 0,
        rows: 0,
        duration,
        error: errorMessage,
      };
    }
  }

  /**
   * ETL Orders from Bling
   */
  async syncOrders(companyId: string): Promise<ETLResult> {
    const timer = createTimer('bling_orders_etl');
    const source = 'bling.orders';
    let runId: string | null = null;
    
    try {
      // Create ETL run record
      runId = await this.createETLRun(companyId, source);
      
      // Get access token
      const accessToken = await this.getValidAccessToken(companyId);
      
      // Get last checkpoint
      const lastCheckpoint = await this.getLastCheckpoint(companyId, source);
      const since = this.calculateSinceTimestamp(lastCheckpoint);
      
      logger.info('Starting Bling orders ETL', { 
        companyId, 
        since, 
        lastCheckpoint: lastCheckpoint?.toISOString() 
      });

      let page = 1;
      let totalRows = 0;
      let totalPages = 0;
      let hasMore = true;

      while (hasMore) {
        // Fetch orders page
        const ordersPage = await this.blingAdapter.getOrders(accessToken, since, page);
        
        if (ordersPage.data.length === 0) {
          break;
        }

        // Process each order
        for (const blingOrder of ordersPage.data) {
          // Map order
          const mappedOrder = this.blingAdapter.mapOrder(blingOrder, companyId);
          
          // Map order items
          const mappedItems = this.blingAdapter.mapOrderItems(blingOrder, companyId);

          // Upsert order
          const { error: orderError } = await this.supabase
            .from('orders')
            .upsert(mappedOrder, {
              onConflict: 'company_id,order_id',
              ignoreDuplicates: false,
            });

          if (orderError) {
            throw new Error(`Failed to upsert order ${mappedOrder.order_id}: ${orderError.message}`);
          }

          // Upsert order items
          if (mappedItems.length > 0) {
            const { error: itemsError } = await this.supabase
              .from('order_items')
              .upsert(mappedItems, {
                onConflict: 'company_id,order_id,item_seq',
                ignoreDuplicates: false,
              });

            if (itemsError) {
              throw new Error(`Failed to upsert order items for ${mappedOrder.order_id}: ${itemsError.message}`);
            }
          }
        }

        totalRows += ordersPage.data.length;
        totalPages = page;
        hasMore = ordersPage.hasMore;
        page++;

        logger.info('Processed orders page', { 
          companyId, 
          page: page - 1, 
          rows: ordersPage.data.length,
          totalRows 
        });
      }

      // Update checkpoint
      await this.updateCheckpoint(companyId, source);

      // Update ETL run with success
      if (runId) {
        await this.updateETLRun(runId, {
          ok: true,
          pages: totalPages,
          rows: totalRows,
        });
      }

      const duration = timer.end({ companyId, pages: totalPages, rows: totalRows });

      logger.info('Bling orders ETL completed', { 
        companyId, 
        pages: totalPages, 
        rows: totalRows,
        duration 
      });

      return {
        success: true,
        pages: totalPages,
        rows: totalRows,
        duration,
      };

    } catch (error) {
      const duration = timer.end({ error: true });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update ETL run with error
      if (runId) {
        await this.updateETLRun(runId, {
          ok: false,
          error: errorMessage,
        });
      }

      logger.error('Bling orders ETL failed', { 
        companyId, 
        error: errorMessage,
        duration 
      });

      return {
        success: false,
        pages: 0,
        rows: 0,
        duration,
        error: errorMessage,
      };
    }
  }
}

// Export singleton instance
export const etlService = new ETLService();
