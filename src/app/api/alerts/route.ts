import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/alerts - Get company alerts
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const isRead = searchParams.get('is_read')
    const isResolved = searchParams.get('is_resolved')

    let query = supabase
      .from('alerts')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add filters
    if (type) {
      query = query.eq('type', type)
    }
    
    if (priority) {
      query = query.eq('priority', priority)
    }

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true')
    }

    if (isResolved !== null) {
      query = query.eq('is_resolved', isResolved === 'true')
    }

    const { data: alerts, error: alertsError } = await query

    if (alertsError) {
      console.error('Alerts fetch error:', alertsError)
      return NextResponse.json(
        { error: 'Failed to fetch alerts' },
        { status: 400 }
      )
    }

    // Get counts for different categories
    const { data: counts } = await supabase
      .from('alerts')
      .select('type, priority, is_read, is_resolved')
      .eq('company_id', profile.company_id)

    const summary = {
      total: counts?.length || 0,
      unread: counts?.filter(a => !a.is_read).length || 0,
      unresolved: counts?.filter(a => !a.is_resolved).length || 0,
      critical: counts?.filter(a => a.priority === 'critical').length || 0,
      high: counts?.filter(a => a.priority === 'high').length || 0
    }

    return NextResponse.json({ alerts, summary })

  } catch (error) {
    console.error('Alerts GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/alerts - Create new alert
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

    const body = await request.json()
    const {
      type,
      priority = 'medium',
      title,
      message,
      data = {}
    } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, title, and message are required' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      )
    }

    // Create alert
    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .insert({
        company_id: profile.company_id,
        type,
        priority,
        title,
        message,
        data
      })
      .select()
      .single()

    if (alertError) {
      console.error('Alert creation error:', alertError)
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 400 }
      )
    }

    // TODO: Send WhatsApp notification if priority is high or critical
    if (priority === 'high' || priority === 'critical') {
      // This will be implemented when WhatsApp integration is ready
      console.log(`High priority alert created: ${alert.id}`)
    }

    return NextResponse.json({ alert }, { status: 201 })

  } catch (error) {
    console.error('Alerts POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/alerts - Update alert (mark as read/resolved)
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const {
      id,
      is_read,
      is_resolved
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (typeof is_read === 'boolean') {
      updateData.is_read = is_read
    }
    
    if (typeof is_resolved === 'boolean') {
      updateData.is_resolved = is_resolved
      if (is_resolved) {
        updateData.resolved_at = new Date().toISOString()
        updateData.resolved_by = user.id
      } else {
        updateData.resolved_at = null
        updateData.resolved_by = null
      }
    }

    // Update alert
    const { data: alert, error: updateError } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .select()
      .single()

    if (updateError) {
      console.error('Alert update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 400 }
      )
    }

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ alert })

  } catch (error) {
    console.error('Alerts PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
