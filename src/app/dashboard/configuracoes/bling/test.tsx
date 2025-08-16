'use client'

export default function BlingTestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Teste - Página Bling</h1>
      <p>Se você está vendo esta página, o roteamento está funcionando!</p>
      
      <div className="mt-6 p-4 bg-green-100 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800">✅ Sucesso!</h2>
        <p className="text-green-700">
          A página de configuração Bling está acessível.
        </p>
      </div>

      <div className="mt-4">
        <a 
          href="/dashboard/configuracoes" 
          className="text-blue-600 hover:underline"
        >
          ← Voltar para Configurações
        </a>
      </div>
    </div>
  )
}
