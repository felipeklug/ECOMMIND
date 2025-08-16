import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/analytics/products - Get product analytics
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // week, month, quarter
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'sales' // sales, margin, quantity

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Get orders with items for the period
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        created_at,
        channel_id,
        channels (
          id,
          name,
          platform
        ),
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            sku,
            cost_price,
            category,
            brand
          )
        )
      `)
      .eq('company_id', profile.company_id)
      .in('status', ['confirmed', 'shipped', 'delivered'])
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString())

    if (ordersError) {
      console.error('Orders fetch error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders data' },
        { status: 400 }
      )
    }

    // Get all products with their channel information
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        cost_price,
        category,
        brand,
        product_channels (
          id,
          channel_id,
          price,
          stock,
          is_active,
          channels (
            id,
            name,
            platform
          )
        )
      `)
      .eq('company_id', profile.company_id)

    if (productsError) {
      console.error('Products fetch error:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products data' },
        { status: 400 }
      )
    }

    // Calculate product metrics
    const productMetrics = calculateProductMetrics(orders || [], products || [])

    // Sort and limit results
    const sortedProducts = sortProductMetrics(productMetrics, sortBy).slice(0, limit)

    // Calculate category performance
    const categoryMetrics = calculateCategoryMetrics(productMetrics)

    // Calculate stock alerts
    const stockAlerts = calculateStockAlerts(products || [], productMetrics)

    return NextResponse.json({
      period,
      products: sortedProducts,
      categories: categoryMetrics,
      stockAlerts,
      summary: {
        totalProducts: products?.length || 0,
        activeProducts: products?.filter(p => p.product_channels?.some(pc => pc.is_active)).length || 0,
        lowStockProducts: stockAlerts.filter(alert => alert.type === 'low_stock').length,
        outOfStockProducts: stockAlerts.filter(alert => alert.type === 'out_of_stock').length
      },
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    })

  } catch (error) {
    console.error('Product analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateProductMetrics(orders: any[], products: any[]) {
  const productMap = new Map()

  // Initialize products map
  products.forEach(product => {
    productMap.set(product.id, {
      id: product.id,
      name: product.name,
      sku: product.sku,
      costPrice: product.cost_price || 0,
      category: product.category,
      brand: product.brand,
      totalSales: 0,
      totalQuantity: 0,
      totalOrders: 0,
      totalMargin: 0,
      marginPercentage: 0,
      averagePrice: 0,
      channels: product.product_channels?.map((pc: any) => ({
        id: pc.channel_id,
        name: pc.channels?.name,
        platform: pc.channels?.platform,
        price: pc.price,
        stock: pc.stock,
        isActive: pc.is_active
      })) || []
    })
  })

  // Calculate metrics from orders
  orders.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const productId = item.product_id
      const product = productMap.get(productId)
      
      if (product) {
        product.totalSales += item.total_price || 0
        product.totalQuantity += item.quantity || 0
        product.totalOrders += 1
        
        const itemMargin = (item.total_price || 0) - (product.costPrice * (item.quantity || 0))
        product.totalMargin += itemMargin
      }
    })
  })

  // Calculate derived metrics
  productMap.forEach(product => {
    if (product.totalSales > 0) {
      product.marginPercentage = (product.totalMargin / product.totalSales) * 100
      product.averagePrice = product.totalSales / product.totalQuantity
    }
  })

  return Array.from(productMap.values())
}

function sortProductMetrics(products: any[], sortBy: string) {
  switch (sortBy) {
    case 'margin':
      return products.sort((a, b) => b.totalMargin - a.totalMargin)
    case 'quantity':
      return products.sort((a, b) => b.totalQuantity - a.totalQuantity)
    case 'sales':
    default:
      return products.sort((a, b) => b.totalSales - a.totalSales)
  }
}

function calculateCategoryMetrics(products: any[]) {
  const categoryMap = new Map()

  products.forEach(product => {
    const category = product.category || 'Sem Categoria'
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        totalSales: 0,
        totalQuantity: 0,
        totalMargin: 0,
        productCount: 0
      })
    }
    
    const cat = categoryMap.get(category)
    cat.totalSales += product.totalSales
    cat.totalQuantity += product.totalQuantity
    cat.totalMargin += product.totalMargin
    cat.productCount += 1
  })

  return Array.from(categoryMap.values())
    .sort((a, b) => b.totalSales - a.totalSales)
}

function calculateStockAlerts(products: any[], productMetrics: any[]) {
  const alerts: any[] = []

  products.forEach(product => {
    const metrics = productMetrics.find(m => m.id === product.id)
    
    product.product_channels?.forEach((pc: any) => {
      if (!pc.is_active) return

      const stock = pc.stock || 0
      const channelName = pc.channels?.name || 'Unknown'

      if (stock === 0) {
        alerts.push({
          type: 'out_of_stock',
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          channelId: pc.channel_id,
          channelName,
          stock: 0,
          priority: 'high'
        })
      } else if (stock <= 10) {
        // Calculate days of coverage based on recent sales
        const dailySales = metrics ? metrics.totalQuantity / 30 : 0
        const daysOfCoverage = dailySales > 0 ? stock / dailySales : 999
        
        if (daysOfCoverage <= 7) {
          alerts.push({
            type: 'low_stock',
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            channelId: pc.channel_id,
            channelName,
            stock,
            daysOfCoverage: Math.round(daysOfCoverage),
            priority: daysOfCoverage <= 3 ? 'high' : 'medium'
          })
        }
      }
    })
  })

  return alerts.sort((a, b) => {
    const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 }
    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1)
  })
}
