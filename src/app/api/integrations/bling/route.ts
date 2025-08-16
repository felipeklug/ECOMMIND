import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/integrations/bling - Check Bling integration status
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's profile and company
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        company_id,
        companies (
          id,
          name,
          bling_access_token,
          bling_refresh_token,
          bling_token_expires_at
        )
      `)
      .eq('id', user.id)
      .single()

    if (!profile?.company_id || !profile.companies) {
      // For development, return a mock company status
      // In production, this would create a real company
      console.log('User has no company, returning mock status for development')
      return NextResponse.json({
        connected: false,
        company: {
          id: 'mock-company-id',
          name: 'Minha Empresa'
        },
        development: true
      })
    }

    const company = Array.isArray(profile.companies) ? profile.companies[0] : profile.companies

    // Check if Bling is connected
    const isConnected = !!(company.bling_access_token && company.bling_refresh_token)

    return NextResponse.json({
      connected: isConnected,
      company: {
        id: company.id,
        name: company.name
      },
      tokenExpiresAt: company.bling_token_expires_at
    })

  } catch (error) {
    console.error('Bling status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
