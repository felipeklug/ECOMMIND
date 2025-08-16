import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/channels - Get company channels
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

    // Get channels
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('name')

    if (channelsError) {
      console.error('Channels fetch error:', channelsError)
      return NextResponse.json(
        { error: 'Failed to fetch channels' },
        { status: 400 }
      )
    }

    return NextResponse.json({ channels })

  } catch (error) {
    console.error('Channels GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/channels - Create new channel
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
      name,
      type,
      platform,
      is_active = true,
      config = {},
      fees = {}
    } = body

    if (!name || !type || !platform) {
      return NextResponse.json(
        { error: 'Name, type, and platform are required' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['marketplace', 'ecommerce', 'physical']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid channel type' },
        { status: 400 }
      )
    }

    // Create channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert({
        company_id: profile.company_id,
        name,
        type,
        platform,
        is_active,
        config,
        fees
      })
      .select()
      .single()

    if (channelError) {
      console.error('Channel creation error:', channelError)
      return NextResponse.json(
        { error: 'Failed to create channel' },
        { status: 400 }
      )
    }

    return NextResponse.json({ channel }, { status: 201 })

  } catch (error) {
    console.error('Channels POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/channels - Update channel
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
      name,
      type,
      platform,
      is_active,
      config,
      fees
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    // Update channel
    const { data: channel, error: updateError } = await supabase
      .from('channels')
      .update({
        name,
        type,
        platform,
        is_active,
        config,
        fees,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .select()
      .single()

    if (updateError) {
      console.error('Channel update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update channel' },
        { status: 400 }
      )
    }

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ channel })

  } catch (error) {
    console.error('Channels PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
