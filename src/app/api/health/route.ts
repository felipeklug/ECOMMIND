import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'OK',
      message: 'ECOMMIND API is working',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        server: 'OK',
        nextjs: 'OK',
        api: 'OK'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'API health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
