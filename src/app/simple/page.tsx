export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🚀 ECOMMIND - Teste Simples
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">
              ✅ Sistema Funcionando
            </h2>
            <ul className="space-y-2">
              <li>• Next.js: OK</li>
              <li>• React: OK</li>
              <li>• Tailwind: OK</li>
              <li>• Roteamento: OK</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">
              🔗 Links de Teste
            </h2>
            <div className="space-y-3">
              <a 
                href="/test" 
                className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-center transition-colors"
              >
                Página de Teste Básica
              </a>
              
              <a 
                href="/onboarding" 
                className="block bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-center transition-colors"
              >
                Onboarding
              </a>
              
              <a 
                href="/dashboard/configuracoes/bling" 
                className="block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-center transition-colors"
              >
                Configuração Bling
              </a>
              
              <a 
                href="/api-test" 
                className="block bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-center transition-colors"
              >
                Teste de APIs
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-red-400">
            🚨 Diagnóstico de Problemas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Se a página principal não funciona:</h3>
              <ul className="text-sm space-y-1">
                <li>• Verifique console do navegador (F12)</li>
                <li>• Procure erros JavaScript</li>
                <li>• Verifique se Tailwind está carregando</li>
                <li>• Teste com esta página simples</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comandos úteis:</h3>
              <ul className="text-sm space-y-1">
                <li>• <code>npm run build</code> - Testar build</li>
                <li>• <code>npm run lint</code> - Verificar erros</li>
                <li>• <code>npm run type-check</code> - TypeScript</li>
                <li>• Ctrl+Shift+R - Hard refresh</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Se você está vendo esta página, o Next.js está funcionando corretamente!
          </p>
        </div>
      </div>
    </div>
  )
}
