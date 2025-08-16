import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/companies - Get user's company
export async function GET() {
  try {
    // For development: Return mock company or not found
    const mockCompany = {
      id: 'company_mock',
      name: 'Empresa Demo',
      cnpj: '12.345.678/0001-90',
      email: 'contato@empresademo.com',
      phone: '(11) 99999-9999',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Simulate company not found for onboarding flow
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  } catch (error) {
    console.error('Companies GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/companies - Create new user and company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company, user } = body

    // Validações
    if (!company?.name || !company?.email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      )
    }

    if (!user?.fullName || !user?.email || !user?.password) {
      return NextResponse.json(
        { error: 'User full name, email and password are required' },
        { status: 400 }
      )
    }

    if (user.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Para desenvolvimento: Mock completo da criação
    console.log('Creating user and company in development mode...')

    // Simular delay de criação
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock dos dados criados
    const mockUserId = `user_${Date.now()}`
    const mockCompanyId = `company_${Date.now()}`
    const mockSessionId = `session_${Date.now()}`

    const mockCompany = {
      id: mockCompanyId,
      name: company.name,
      cnpj: company.cnpj || null,
      email: company.email,
      phone: company.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const mockUser = {
      id: mockUserId,
      email: user.email,
      full_name: user.fullName,
      company_id: mockCompanyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const mockSession = {
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`,
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser
    }

    console.log('Mock user and company created successfully:', {
      user: mockUser,
      company: mockCompany
    })

    return NextResponse.json({
      success: true,
      company: mockCompany,
      user: mockUser,
      session: mockSession,
      message: 'Account created successfully! (Development Mode)'
    }, { status: 201 })

  } catch (error) {
    console.error('Companies POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/companies - Update company
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, cnpj, email, phone } = body

    // For development: Mock company update
    const mockCompany = {
      id: 'company_mock',
      name,
      cnpj,
      email,
      phone,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date().toISOString()
    }

    console.log('Mock company updated:', mockCompany)

    return NextResponse.json({ company: mockCompany })

  } catch (error) {
    console.error('Companies PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
