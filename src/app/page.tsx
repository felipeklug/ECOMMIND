'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona automaticamente para login
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">ECOMMIND</h1>
        <p className="text-gray-600">🚀 PREVIEW BRANCH - Redirecionando...</p>
        <p className="text-sm text-blue-600 mt-2">Esta é uma branch de preview para testes!</p>
      </div>
    </div>
  )
}
