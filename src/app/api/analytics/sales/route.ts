import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/analytics/sales - Get sales analytics
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
    const period = searchParams.get('period') || 'today' // today, yesterday, week, month
    const channelId = searchParams.get('channel_id')

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    let endDate: Date = now
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
        previousEndDate = startDate
        break
      case 'yesterday':
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
        previousEndDate = startDate
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousEndDate = startDate
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = startDate
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
        previousEndDate = startDate
    }

    // Build base query
    let baseQuery = supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        shipping_cost,
        discount_amount,
        tax_amount,
        created_at,
        channel_id,
        channels (
          id,
          name,
          platform
        ),
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            sku,
            cost_price
          )
        )
      `)
      .eq('company_id', profile.company_id)
      .in('status', ['confirmed', 'shipped', 'delivered'])

    // Add channel filter if specified
    if (channelId) {
      baseQuery = baseQuery.eq('channel_id', channelId)
    }

    // Get current period data
    const { data: currentOrders, error: currentError } = await baseQuery
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (currentError) {
      console.error('Current orders fetch error:', currentError)
      return NextResponse.json(
        { error: 'Failed to fetch current period data' },
        { status: 400 }
      )
    }

    // Get previous period data for comparison
    const { data: previousOrders, error: previousError } = await baseQuery
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', previousEndDate.toISOString())

    if (previousError) {
      console.error('Previous orders fetch error:', previousError)
      return NextResponse.json(
        { error: 'Failed to fetch previous period data' },
        { status: 400 }
      )
    }

    // Calculate metrics
    const currentMetrics = calculateSalesMetrics(currentOrders || [])
    const previousMetrics = calculateSalesMetrics(previousOrders || [])

    // Calculate changes
    const changes = {
      totalSales: calculatePercentageChange(currentMetrics.totalSales, previousMetrics.totalSales),
      totalOrders: calculatePercentageChange(currentMetrics.totalOrders, previousMetrics.totalOrders),
      averageOrderValue: calculatePercentageChange(currentMetrics.averageOrderValue, previousMetrics.averageOrderValue),
      totalMargin: calculatePercentageChange(currentMetrics.totalMargin, previousMetrics.totalMargin)
    }

    // Group by channel
    const channelMetrics = groupByChannel(currentOrders || [])

    return NextResponse.json({
      period,
      current: currentMetrics,
      previous: previousMetrics,
      changes,
      channels: channelMetrics,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    })

  } catch (error) {
    console.error('Sales analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateSalesMetrics(orders: any[]) {
  const totalSales = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
  
  // Calculate total margin
  let totalMargin = 0
  let totalCost = 0
  
  orders.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const itemCost = (item.products?.cost_price || 0) * item.quantity
      totalCost += itemCost
    })
  })
  
  totalMargin = totalSales - totalCost

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    totalMargin,
    marginPercentage: totalSales > 0 ? (totalMargin / totalSales) * 100 : 0
  }
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function groupByChannel(orders: any[]) {
  const channelMap = new Map()
  
  orders.forEach(order => {
    const channelId = order.channel_id
    const channelName = order.channels?.name || 'Unknown'
    
    if (!channelMap.has(channelId)) {
      channelMap.set(channelId, {
        id: channelId,
        name: channelName,
        platform: order.channels?.platform,
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0
      })
    }
    
    const channel = channelMap.get(channelId)
    channel.totalSales += order.total_amount || 0
    channel.totalOrders += 1
  })
  
  // Calculate average order values
  channelMap.forEach(channel => {
    channel.averageOrderValue = channel.totalOrders > 0 
      ? channel.totalSales / channel.totalOrders 
      : 0
  })
  
  return Array.from(channelMap.values())
}
