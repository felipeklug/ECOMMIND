// Bling Sync Service
// Synchronizes data between Bling ERP and ECOMMIND database

import { createClient } from '@/lib/supabase/server'
import { BlingApiClient } from './client'
import type { 
  BlingProduct, 
  BlingOrder, 
  BlingStock, 
  BlingReceivable, 
  BlingPayable,
  BlingContact,
  BlingCategory
} from './types'

export interface SyncResult {
  success: boolean
  message: string
  data?: {
    created: number
    updated: number
    errors: number
  }
  errors?: string[]
}

export class BlingSync {
  private blingClient: BlingApiClient
  private supabase: any

  constructor(blingClient: BlingApiClient) {
    this.blingClient = blingClient
  }

  async initialize() {
    this.supabase = await createClient()
  }

  // Sync products from Bling to our database
  async syncProducts(companyId: string, options?: {
    fullSync?: boolean
    limit?: number
  }): Promise<SyncResult> {
    try {
      await this.initialize()
      
      const { fullSync = false, limit = 100 } = options || {}
      let page = 1
      let totalCreated = 0
      let totalUpdated = 0
      let totalErrors = 0
      const errors: string[] = []

      while (true) {
        const response = await this.blingClient.getProducts({
          pagina: page,
          limite: Math.min(limit, 100) // Bling max is 100 per page
        })

        if (response.errors || !response.data) {
          errors.push(`Failed to fetch products page ${page}: ${JSON.stringify(response.errors)}`)
          break
        }

        const products = Array.isArray(response.data) ? response.data : [response.data]
        
        if (products.length === 0) break

        for (const blingProduct of products) {
          try {
            const result = await this.syncSingleProduct(companyId, blingProduct)
            if (result.created) totalCreated++
            if (result.updated) totalUpdated++
          } catch (error) {
            totalErrors++
            errors.push(`Product ${blingProduct.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

        // If we got less than the limit, we're done
        if (products.length < Math.min(limit, 100)) break
        
        page++
        
        // For incremental sync, only do one page
        if (!fullSync) break
      }

      return {
        success: totalErrors === 0,
        message: `Sync completed: ${totalCreated} created, ${totalUpdated} updated, ${totalErrors} errors`,
        data: {
          created: totalCreated,
          updated: totalUpdated,
          errors: totalErrors
        },
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  private async syncSingleProduct(companyId: string, blingProduct: BlingProduct): Promise<{created: boolean, updated: boolean}> {
    // Check if product already exists
    const { data: existingProduct } = await this.supabase
      .from('products')
      .select('id, bling_id')
      .eq('company_id', companyId)
      .eq('bling_id', blingProduct.id)
      .single()

    const productData = {
      company_id: companyId,
      bling_id: blingProduct.id,
      name: blingProduct.nome,
      sku: blingProduct.codigo || `BLING-${blingProduct.id}`,
      description: blingProduct.descricaoCurta || blingProduct.descricaoComplementar,
      cost_price: blingProduct.precoCusto || 0,
      category: blingProduct.categoria?.descricao,
      brand: blingProduct.marca,
      weight: blingProduct.pesoLiquido,
      dimensions: blingProduct.dimensoes ? {
        width: blingProduct.dimensoes.largura,
        height: blingProduct.dimensoes.altura,
        depth: blingProduct.dimensoes.profundidade
      } : null,
      is_active: blingProduct.situacao === 'Ativo',
      bling_data: blingProduct, // Store full Bling data for reference
      updated_at: new Date().toISOString()
    }

    if (existingProduct) {
      // Update existing product
      const { error } = await this.supabase
        .from('products')
        .update(productData)
        .eq('id', existingProduct.id)

      if (error) throw error
      return { created: false, updated: true }
    } else {
      // Create new product
      const { error } = await this.supabase
        .from('products')
        .insert(productData)

      if (error) throw error
      return { created: true, updated: false }
    }
  }

  // Sync orders from Bling to our database
  async syncOrders(companyId: string, options?: {
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<SyncResult> {
    try {
      await this.initialize()
      
      const { startDate, endDate, limit = 100 } = options || {}
      let page = 1
      let totalCreated = 0
      let totalUpdated = 0
      let totalErrors = 0
      const errors: string[] = []

      // Default to last 30 days if no date range specified
      const defaultEndDate = new Date().toISOString().split('T')[0]
      const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      while (true) {
        const response = await this.blingClient.getOrders({
          pagina: page,
          limite: Math.min(limit, 100),
          dataInicial: startDate || defaultStartDate,
          dataFinal: endDate || defaultEndDate
        })

        if (response.errors || !response.data) {
          errors.push(`Failed to fetch orders page ${page}: ${JSON.stringify(response.errors)}`)
          break
        }

        const orders = Array.isArray(response.data) ? response.data : [response.data]
        
        if (orders.length === 0) break

        for (const blingOrder of orders) {
          try {
            const result = await this.syncSingleOrder(companyId, blingOrder)
            if (result.created) totalCreated++
            if (result.updated) totalUpdated++
          } catch (error) {
            totalErrors++
            errors.push(`Order ${blingOrder.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

        if (orders.length < Math.min(limit, 100)) break
        page++
      }

      return {
        success: totalErrors === 0,
        message: `Orders sync completed: ${totalCreated} created, ${totalUpdated} updated, ${totalErrors} errors`,
        data: {
          created: totalCreated,
          updated: totalUpdated,
          errors: totalErrors
        },
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      return {
        success: false,
        message: `Orders sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  private async syncSingleOrder(companyId: string, blingOrder: BlingOrder): Promise<{created: boolean, updated: boolean}> {
    // Check if order already exists
    const { data: existingOrder } = await this.supabase
      .from('orders')
      .select('id, bling_id')
      .eq('company_id', companyId)
      .eq('bling_id', blingOrder.id)
      .single()

    // Map Bling order status to our status
    const statusMap: Record<string, string> = {
      'Em aberto': 'pending',
      'Em andamento': 'processing',
      'Venda agendada': 'pending',
      'Em produção': 'processing',
      'Pronto para envio': 'ready_to_ship',
      'Enviado': 'shipped',
      'Entregue': 'delivered',
      'Cancelado': 'cancelled',
      'Devolvido': 'returned'
    }

    const orderData = {
      company_id: companyId,
      bling_id: blingOrder.id,
      external_id: blingOrder.numero.toString(),
      customer_name: blingOrder.contato.nome,
      customer_email: blingOrder.contato.email,
      customer_phone: blingOrder.contato.telefone,
      total_amount: blingOrder.totalVenda,
      shipping_cost: blingOrder.transporte?.frete || 0,
      discount_amount: blingOrder.desconto.valor,
      tax_amount: (blingOrder.tributacao?.totalICMS || 0) + 
                  (blingOrder.tributacao?.totalIPI || 0) + 
                  (blingOrder.tributacao?.totalPIS || 0) + 
                  (blingOrder.tributacao?.totalCOFINS || 0),
      status: statusMap[blingOrder.situacao.nome] || 'pending',
      bling_data: blingOrder,
      created_at: new Date(blingOrder.data).toISOString(),
      updated_at: new Date().toISOString()
    }

    if (existingOrder) {
      // Update existing order
      const { error } = await this.supabase
        .from('orders')
        .update(orderData)
        .eq('id', existingOrder.id)

      if (error) throw error

      // Update order items
      await this.syncOrderItems(existingOrder.id, blingOrder.itens)
      
      return { created: false, updated: true }
    } else {
      // Create new order
      const { data: newOrder, error } = await this.supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single()

      if (error) throw error

      // Create order items
      await this.syncOrderItems(newOrder.id, blingOrder.itens)
      
      return { created: true, updated: false }
    }
  }

  private async syncOrderItems(orderId: string, blingItems: BlingOrder['itens']) {
    // Delete existing items
    await this.supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)

    // Create new items
    const items = blingItems.map(item => ({
      order_id: orderId,
      bling_product_id: item.produto?.id,
      quantity: item.quantidade,
      unit_price: item.valor,
      total_price: item.valor * item.quantidade,
      product_name: item.descricao,
      product_sku: item.codigo,
      bling_data: item
    }))

    const { error } = await this.supabase
      .from('order_items')
      .insert(items)

    if (error) throw error
  }

  // Sync stock levels from Bling
  async syncStock(companyId: string): Promise<SyncResult> {
    try {
      await this.initialize()
      
      let page = 1
      let totalUpdated = 0
      let totalErrors = 0
      const errors: string[] = []

      while (true) {
        const response = await this.blingClient.getStock({
          pagina: page,
          limite: 100
        })

        if (response.errors || !response.data) {
          errors.push(`Failed to fetch stock page ${page}: ${JSON.stringify(response.errors)}`)
          break
        }

        const stockItems = Array.isArray(response.data) ? response.data : [response.data]
        
        if (stockItems.length === 0) break

        for (const stockItem of stockItems) {
          try {
            await this.updateProductStock(companyId, stockItem)
            totalUpdated++
          } catch (error) {
            totalErrors++
            errors.push(`Stock ${stockItem.produto.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

        if (stockItems.length < 100) break
        page++
      }

      return {
        success: totalErrors === 0,
        message: `Stock sync completed: ${totalUpdated} updated, ${totalErrors} errors`,
        data: {
          created: 0,
          updated: totalUpdated,
          errors: totalErrors
        },
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      return {
        success: false,
        message: `Stock sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  private async updateProductStock(companyId: string, stockItem: BlingStock) {
    // Find product by Bling ID
    const { data: product } = await this.supabase
      .from('products')
      .select('id')
      .eq('company_id', companyId)
      .eq('bling_id', stockItem.produto.id)
      .single()

    if (!product) {
      throw new Error(`Product not found for Bling ID ${stockItem.produto.id}`)
    }

    // Update stock in product_channels table (assuming default channel)
    const { error } = await this.supabase
      .from('product_channels')
      .upsert({
        product_id: product.id,
        stock: stockItem.saldoFisicoTotal,
        cost_price: stockItem.custoMedio,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'product_id'
      })

    if (error) throw error
  }
}
