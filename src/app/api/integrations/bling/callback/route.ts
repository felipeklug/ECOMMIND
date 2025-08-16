import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to create Basic Auth header for Bling
function createBasicAuthHeader(clientId: string, clientSecret: string): string {
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
}

// GET /api/integrations/bling/callback - Handle Bling OAuth callback
export async function GET(request: NextRequest) {
  try {
    console.log('Callback do Bling recebido')

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('Parâmetros recebidos:', { code, state, error })

    if (error) {
      console.error('Bling OAuth error:', error)
      return NextResponse.redirect(
        new URL('/integrations/bling?error=' + encodeURIComponent(error), request.url)
      )
    }

    if (!code || !state) {
      console.error('Parâmetros obrigatórios ausentes')
      return NextResponse.redirect(
        new URL('/integrations/bling?error=missing_parameters', request.url)
      )
    }

    // Extract company ID from state (format: companyId-timestamp)
    const companyId = state.split('-')[0]
    if (!companyId) {
      console.error('State inválido:', state)
      return NextResponse.redirect(
        new URL('/integrations/bling?error=invalid_state', request.url)
      )
    }

    // Real OAuth flow with Bling API
    const clientId = process.env.BLING_CLIENT_ID
    const clientSecret = process.env.BLING_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error('Credenciais do Bling não configuradas')
      return NextResponse.redirect(
        new URL('/integrations/bling?error=credentials_not_configured', request.url)
      )
    }

    // Exchange code for tokens (must be done within 60 seconds)
    console.log('Trocando code por tokens...')

    const tokenResponse = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '1.0',
        'Authorization': `Basic ${createBasicAuthHeader(clientId, clientSecret)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code
      })
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Erro ao obter tokens do Bling:', tokenData)
      return NextResponse.redirect(
        new URL('/integrations/bling?error=token_exchange_failed', request.url)
      )
    }

    console.log('Tokens obtidos com sucesso')

    // Save tokens to database
    console.log('Salvando tokens para empresa:', companyId)
    // In production, this would save to the database
    // For now, just log the success

    return NextResponse.redirect(
      new URL('/integrations/bling?success=true', request.url)
    )

  } catch (error) {
    console.error('Bling callback error:', error)
    return NextResponse.redirect(
      new URL('/integrations/bling?error=callback_failed', request.url)
    )
  }
}