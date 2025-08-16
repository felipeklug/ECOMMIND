import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/products - Get company products
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
    const search = searchParams.get('search')

    let query = supabase
      .from('products')
      .select(`
        *,
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
      .range(offset, offset + limit - 1)

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    const { data: products, error: productsError } = await query

    if (productsError) {
      console.error('Products fetch error:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 400 }
      )
    }

    return NextResponse.json({ products })

  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
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
      sku,
      description,
      cost_price,
      category,
      brand,
      weight,
      dimensions,
      is_active = true
    } = body

    if (!name || !sku) {
      return NextResponse.json(
        { error: 'Name and SKU are required' },
        { status: 400 }
      )
    }

    // Check if SKU already exists for this company
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('sku', sku)
      .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      )
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        company_id: profile.company_id,
        name,
        sku,
        description,
        cost_price,
        category,
        brand,
        weight,
        dimensions,
        is_active
      })
      .select()
      .single()

    if (productError) {
      console.error('Product creation error:', productError)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 400 }
      )
    }

    return NextResponse.json({ product }, { status: 201 })

  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
