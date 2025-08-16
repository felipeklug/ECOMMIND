import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBlingClient } from '@/lib/integrations/bling/client'
import { BlingSync } from '@/lib/integrations/bling/sync'

// POST /api/integrations/bling/sync - Sync data from Bling
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's company
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get company with Bling tokens
    const { data: company } = await supabase
      .from('companies')
      .select('id, bling_access_token, bling_refresh_token, bling_token_expires_at')
      .eq('id', profile.company_id)
      .single()

    if (!company?.bling_access_token) {
      return NextResponse.json(
        { error: 'Bling not connected. Please connect Bling first.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      syncType = 'all', // 'products', 'orders', 'stock', 'all'
      fullSync = false,
      startDate,
      endDate,
      limit = 100
    } = body

    // Create Bling client with stored tokens
    const blingClient = createBlingClient()
    
    // Set stored tokens
    ;(blingClient as any).accessToken = company.bling_access_token
    ;(blingClient as any).refreshToken = company.bling_refresh_token
    ;(blingClient as any).tokenExpiry = company.bling_token_expires_at 
      ? new Date(company.bling_token_expires_at) 
      : null

    const blingSync = new BlingSync(blingClient)
    const results: any = {}

    try {
      // Sync products
      if (syncType === 'all' || syncType === 'products') {
        console.log('Starting products sync...')
        results.products = await blingSync.syncProducts(company.id, {
          fullSync,
          limit
        })
      }

      // Sync orders
      if (syncType === 'all' || syncType === 'orders') {
        console.log('Starting orders sync...')
        results.orders = await blingSync.syncOrders(company.id, {
          startDate,
          endDate,
          limit
        })
      }

      // Sync stock
      if (syncType === 'all' || syncType === 'stock') {
        console.log('Starting stock sync...')
        results.stock = await blingSync.syncStock(company.id)
      }

      // Update last sync timestamp
      await supabase
        .from('companies')
        .update({
          bling_last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)

      // Calculate overall success
      const allSuccessful = Object.values(results).every((result: any) => result.success)
      
      return NextResponse.json({
        success: allSuccessful,
        message: allSuccessful 
          ? 'Sync completed successfully' 
          : 'Sync completed with some errors',
        results,
        timestamp: new Date().toISOString()
      })

    } catch (syncError) {
      console.error('Sync error:', syncError)
      return NextResponse.json(
        { 
          error: 'Sync failed',
          details: syncError instanceof Error ? syncError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Bling sync API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/integrations/bling/sync - Get sync status
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's company
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get company sync status
    const { data: company } = await supabase
      .from('companies')
      .select(`
        id,
        bling_access_token,
        bling_last_sync,
        created_at
      `)
      .eq('id', profile.company_id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get data counts
    const [
      { count: productsCount },
      { count: ordersCount },
      { count: alertsCount }
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id),
      supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('is_resolved', false)
    ])

    const isConnected = !!company.bling_access_token
    const lastSync = company.bling_last_sync ? new Date(company.bling_last_sync) : null
    const daysSinceLastSync = lastSync 
      ? Math.floor((Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({
      connected: isConnected,
      lastSync: lastSync?.toISOString(),
      daysSinceLastSync,
      needsSync: !lastSync || (daysSinceLastSync !== null && daysSinceLastSync > 1),
      data: {
        products: productsCount || 0,
        orders: ordersCount || 0,
        alerts: alertsCount || 0
      },
      recommendations: generateSyncRecommendations(isConnected, daysSinceLastSync, {
        products: productsCount || 0,
        orders: ordersCount || 0
      })
    })

  } catch (error) {
    console.error('Bling sync status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSyncRecommendations(
  isConnected: boolean, 
  daysSinceLastSync: number | null,
  data: { products: number; orders: number }
): string[] {
  const recommendations: string[] = []

  if (!isConnected) {
    recommendations.push('Conecte sua conta Bling para começar a sincronizar dados')
    return recommendations
  }

  if (daysSinceLastSync === null) {
    recommendations.push('Execute a primeira sincronização para importar seus dados')
  } else if (daysSinceLastSync > 7) {
    recommendations.push('Sincronização desatualizada. Execute uma sincronização completa')
  } else if (daysSinceLastSync > 1) {
    recommendations.push('Execute uma sincronização incremental para atualizar dados')
  }

  if (data.products === 0) {
    recommendations.push('Nenhum produto encontrado. Verifique se há produtos no Bling')
  }

  if (data.orders === 0) {
    recommendations.push('Nenhum pedido encontrado. Verifique o período de sincronização')
  }

  if (recommendations.length === 0) {
    recommendations.push('Dados atualizados. Próxima sincronização recomendada em 24h')
  }

  return recommendations
}
