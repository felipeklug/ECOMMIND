# ECOMMIND Backend Setup Guide

## 🎯 Overview

Este guia explica como configurar e usar o backend do ECOMMIND, incluindo APIs REST, banco de dados e integrações.

## 📋 Status Atual

### ✅ Implementado (Phase 1 - Foundation)
- **APIs REST básicas** - CRUD completo para todas entidades
- **Autenticação Supabase** - Sistema de auth seguro
- **Schema do banco** - Estrutura completa no Supabase
- **Client API** - Cliente HTTP centralizado
- **Hooks React** - Integração com SWR para cache
- **Página de testes** - `/api-test` para validar endpoints

### 🔄 Em Desenvolvimento
- **Integração Bling ERP** - Sincronização de dados reais
- **Sistema de alertas** - Engine de notificações
- **WhatsApp Business API** - Interface conversacional

### 📅 Próximas Fases
- **Cálculos de margem** - Lógica de negócio avançada
- **Previsão de estoque** - Algoritmos preditivos
- **Relatórios avançados** - Analytics em tempo real

## 🚀 Setup Rápido

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Execute o SQL do arquivo `supabase-setup.sql` no SQL Editor
3. Configure as variáveis de ambiente:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Testar APIs

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse a página de testes:
```
http://localhost:3000/api-test
```

3. Teste os endpoints na aba "Data Hooks" e "Mutations"

## 📚 Documentação das APIs

### Autenticação
- `GET /api/auth` - Obter usuário atual
- `POST /api/auth` - Logout

### Empresas
- `GET /api/companies` - Obter empresa do usuário
- `POST /api/companies` - Criar nova empresa
- `PUT /api/companies` - Atualizar empresa

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar pedido

### Canais
- `GET /api/channels` - Listar canais
- `POST /api/channels` - Criar canal
- `PUT /api/channels` - Atualizar canal

### Analytics
- `GET /api/analytics/sales` - Métricas de vendas
- `GET /api/analytics/products` - Análise de produtos

### Alertas
- `GET /api/alerts` - Listar alertas
- `POST /api/alerts` - Criar alerta
- `PUT /api/alerts` - Atualizar alerta

### Tarefas
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `PUT /api/tasks` - Atualizar tarefa

## 🔧 Como Usar

### Client API

```typescript
import { apiClient } from '@/lib/api/client'

// Buscar produtos
const response = await apiClient.getProducts()
if (response.error) {
  console.error('Erro:', response.error)
} else {
  console.log('Produtos:', response.data)
}

// Criar produto
const newProduct = await apiClient.createProduct({
  name: 'Produto Teste',
  sku: 'TEST-001',
  cost_price: 50.00
})
```

### Hooks React

```typescript
import { useProducts, useCreateProduct } from '@/hooks/useApi'

function ProductsPage() {
  const { data: products, error, isLoading } = useProducts()
  const createProduct = useCreateProduct()

  const handleCreate = async () => {
    try {
      await createProduct({
        name: 'Novo Produto',
        sku: 'NEW-001'
      })
      // Produto criado com sucesso
    } catch (error) {
      console.error('Erro ao criar produto:', error)
    }
  }

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error.message}</div>

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

## 🗄️ Schema do Banco

### Tabelas Principais

- **companies** - Dados das empresas
- **profiles** - Perfis de usuários (extends auth.users)
- **products** - Catálogo de produtos
- **channels** - Canais de venda
- **product_channels** - Produtos por canal (preço, estoque)
- **orders** - Pedidos
- **order_items** - Itens dos pedidos
- **alerts** - Sistema de alertas
- **tasks** - Gestão de tarefas

### Relacionamentos

```
companies (1) -> (N) profiles
companies (1) -> (N) products
companies (1) -> (N) channels
companies (1) -> (N) orders
companies (1) -> (N) alerts
companies (1) -> (N) tasks

products (1) -> (N) product_channels
channels (1) -> (N) product_channels
orders (1) -> (N) order_items
```

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Autenticação JWT** via Supabase
- **Isolamento por empresa** - usuários só acessam dados da própria empresa
- **Validação de entrada** em todas as APIs
- **Tratamento de erros** padronizado

## 📊 Monitoramento

### Logs
- Todos os erros são logados no console
- Estrutura padronizada de logs para debugging

### Performance
- Cache via SWR nos hooks React
- Paginação em endpoints que retornam listas
- Índices otimizados no banco de dados

## 🚨 Troubleshooting

### Erro de Autenticação
```
Error: Not authenticated
```
**Solução:** Verificar se o usuário está logado e se o token JWT é válido.

### Erro de Empresa
```
Error: Company not found
```
**Solução:** Usuário precisa estar associado a uma empresa. Criar empresa primeiro.

### Erro de Permissão
```
Error: Access denied
```
**Solução:** Verificar RLS policies no Supabase e permissões do usuário.

## 🔄 Próximos Passos

1. **Integração Bling** - Conectar com ERP para dados reais
2. **Sistema de Alertas** - Engine de notificações automáticas
3. **WhatsApp API** - Interface conversacional
4. **Cálculos Avançados** - Margem, estoque, previsões
5. **Relatórios** - Dashboards com dados reais

## 📞 Suporte

Para dúvidas sobre o backend:
1. Consulte a página `/api-test` para validar endpoints
2. Verifique os logs no console do navegador
3. Confirme configuração do Supabase
4. Teste conexão com banco de dados
