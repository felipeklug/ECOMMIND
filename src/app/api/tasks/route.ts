import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/tasks - Get company tasks
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
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assigned_to')

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:assigned_to (
          id,
          full_name
        )
      `)
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (priority) {
      query = query.eq('priority', priority)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    const { data: tasks, error: tasksError } = await query

    if (tasksError) {
      console.error('Tasks fetch error:', tasksError)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 400 }
      )
    }

    // Get task counts by status
    const { data: counts } = await supabase
      .from('tasks')
      .select('status, priority')
      .eq('company_id', profile.company_id)

    const summary = {
      total: counts?.length || 0,
      todo: counts?.filter(t => t.status === 'todo').length || 0,
      inProgress: counts?.filter(t => t.status === 'in_progress').length || 0,
      done: counts?.filter(t => t.status === 'done').length || 0,
      cancelled: counts?.filter(t => t.status === 'cancelled').length || 0,
      high: counts?.filter(t => t.priority === 'high').length || 0
    }

    return NextResponse.json({ tasks, summary })

  } catch (error) {
    console.error('Tasks GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create new task
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
      title,
      description,
      assigned_to,
      priority = 'medium',
      due_date,
      related_entity,
      tags = []
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      )
    }

    // Validate assigned user belongs to company
    if (assigned_to) {
      const { data: assignedUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', assigned_to)
        .eq('company_id', profile.company_id)
        .single()

      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Assigned user not found in company' },
          { status: 400 }
        )
      }
    }

    // Create task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        company_id: profile.company_id,
        title,
        description,
        assigned_to,
        priority,
        due_date,
        related_entity,
        tags
      })
      .select(`
        *,
        assigned_user:assigned_to (
          id,
          full_name
        )
      `)
      .single()

    if (taskError) {
      console.error('Task creation error:', taskError)
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 400 }
      )
    }

    return NextResponse.json({ task }, { status: 201 })

  } catch (error) {
    console.error('Tasks POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks - Update task
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
      title,
      description,
      status,
      assigned_to,
      priority,
      due_date,
      related_entity,
      tags
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['todo', 'in_progress', 'done', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ['low', 'medium', 'high']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority level' },
          { status: 400 }
        )
      }
    }

    // Validate assigned user if provided
    if (assigned_to) {
      const { data: assignedUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', assigned_to)
        .eq('company_id', profile.company_id)
        .single()

      if (!assignedUser) {
        return NextResponse.json(
          { error: 'Assigned user not found in company' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to
    if (priority !== undefined) updateData.priority = priority
    if (due_date !== undefined) updateData.due_date = due_date
    if (related_entity !== undefined) updateData.related_entity = related_entity
    if (tags !== undefined) updateData.tags = tags

    // Update task
    const { data: task, error: updateError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .select(`
        *,
        assigned_user:assigned_to (
          id,
          full_name
        )
      `)
      .single()

    if (updateError) {
      console.error('Task update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 400 }
      )
    }

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })

  } catch (error) {
    console.error('Tasks PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
