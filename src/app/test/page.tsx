export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ TESTE FUNCIONANDO!</h1>
      <p>Se você está vendo esta página, o Next.js está funcionando.</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Informações do Sistema:</h2>
        <ul>
          <li>Next.js: Funcionando ✅</li>
          <li>React: Funcionando ✅</li>
          <li>Roteamento: Funcionando ✅</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Próximos Testes:</h3>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          ← Voltar para página principal
        </a>
      </div>
    </div>
  )
}
