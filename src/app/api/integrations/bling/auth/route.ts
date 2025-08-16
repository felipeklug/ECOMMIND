import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/integrations/bling/auth - Get Bling OAuth URL
export async function GET(request: NextRequest) {
  try {
    console.log('Iniciando processo de autenticação Bling...')

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // For development, use a mock company ID
    // In production, this would get the real company from the database
    const companyId = 'mock-company-id'

    // Real Bling OAuth flow - validate credentials
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error('Bling credentials not configured')
      return NextResponse.json({
        error: 'Bling integration not configured. Please contact administrator.'
      }, { status: 500 })
    }

    if (clientId === 'your_bling_client_id_here' || clientSecret === 'your_bling_client_secret_here') {
      console.error('Bling credentials not properly configured - using placeholder values')
      return NextResponse.json({
        error: 'Bling integration not properly configured. Please contact administrator.'
      }, { status: 500 })
    }

    // Generate a unique state for security (company_id + timestamp)
    const state = `${companyId}-${Date.now()}`

    // TODO: Store state in database or session for validation

    // Correct Bling OAuth URL as per documentation
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&state=${encodeURIComponent(state)}`

    console.log('URL de autorização do Bling:', authUrl)

    return NextResponse.json({
      connected: false,
      authUrl: authUrl,
      development: false,
      message: 'Redirecionando para autorização do Bling'
    })

  } catch (error) {
    console.error('Bling auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/integrations/bling/auth - Disconnect Bling
export async function POST() {
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

    // Remove Bling tokens from company
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        bling_access_token: null,
        bling_refresh_token: null,
        bling_token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.company_id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to disconnect Bling' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Bling disconnected successfully'
    })

  } catch (error) {
    console.error('Bling disconnect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
