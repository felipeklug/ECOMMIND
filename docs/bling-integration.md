# Integração Bling ERP - ECOMMIND

## 🎯 Overview

A integração com o Bling ERP é **crítica** para o Phase 1 do ECOMMIND. Ela permite sincronizar automaticamente produtos, pedidos, estoque e dados financeiros do ERP para nossa plataforma, eliminando trabalho manual e garantindo dados sempre atualizados.

## 📋 Status da Implementação

### ✅ Implementado
- **Cliente Bling API** - Comunicação completa com API v3 do Bling
- **Sistema OAuth 2.0** - Autenticação segura com Bling
- **Sincronização de Dados** - Produtos, pedidos, estoque
- **Interface de Configuração** - Página para gerenciar integração
- **APIs REST** - Endpoints para auth, sync e status
- **Schema do Banco** - Campos para armazenar dados Bling

### 🔄 Em Desenvolvimento
- **Sincronização Automática** - Agendamento de sync periódica
- **Webhooks Bling** - Receber notificações em tempo real
- **Mapeamento de Canais** - Associar canais Bling com nossos canais

## 🚀 Como Configurar

### 1. Configurar Credenciais Bling

1. Acesse o [Bling Developer](https://developer.bling.com.br)
2. Crie uma aplicação OAuth
3. Configure as variáveis de ambiente:

```bash
# .env.local
BLING_CLIENT_ID=your_bling_client_id
BLING_CLIENT_SECRET=your_bling_client_secret
BLING_API_URL=https://api.bling.com.br/v3
```

### 2. Configurar Redirect URI

No painel do Bling Developer, configure:
```
Redirect URI: http://localhost:3000/api/integrations/bling/callback
```

### 3. Conectar Conta

1. Acesse `/dashboard/configuracoes/bling`
2. Clique em "Conectar com Bling"
3. Autorize a aplicação no Bling
4. Execute a primeira sincronização

## 📚 Documentação da API

### Autenticação
- `GET /api/integrations/bling/auth` - Obter URL de autorização
- `POST /api/integrations/bling/auth` - Desconectar Bling
- `GET /api/integrations/bling/callback` - Callback OAuth

### Sincronização
- `GET /api/integrations/bling/sync` - Status da sincronização
- `POST /api/integrations/bling/sync` - Executar sincronização

## 🔧 Como Usar

### Cliente Bling API

```typescript
import { createBlingClient } from '@/lib/integrations/bling/client'

const blingClient = createBlingClient()

// Autenticar
await blingClient.authenticate(authCode)

// Buscar produtos
const products = await blingClient.getProducts({
  limite: 100,
  pagina: 1
})

// Buscar pedidos
const orders = await blingClient.getOrders({
  dataInicial: '2024-01-01',
  dataFinal: '2024-01-31'
})
```

### Serviço de Sincronização

```typescript
import { BlingSync } from '@/lib/integrations/bling/sync'

const blingSync = new BlingSync(blingClient)

// Sincronizar produtos
const result = await blingSync.syncProducts(companyId, {
  fullSync: true,
  limit: 1000
})

// Sincronizar pedidos
const result = await blingSync.syncOrders(companyId, {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
})
```

### Interface de Configuração

Acesse `/dashboard/configuracoes/bling` para:
- Conectar/desconectar conta Bling
- Ver status da sincronização
- Executar sincronização manual
- Monitorar dados importados

## 📊 Dados Sincronizados

### Produtos
- **Campos Bling**: id, nome, codigo, preco, precoCusto, categoria, marca
- **Mapeamento**: Produtos são criados/atualizados na tabela `products`
- **Identificação**: Campo `bling_id` para rastreamento
- **Dados Completos**: JSON completo armazenado em `bling_data`

### Pedidos
- **Campos Bling**: id, numero, data, totalVenda, situacao, contato
- **Mapeamento**: Pedidos são criados/atualizados na tabela `orders`
- **Itens**: Criados na tabela `order_items` com referência ao produto
- **Status**: Mapeamento automático de status Bling para nossos status

### Estoque
- **Campos Bling**: saldoFisicoTotal, saldoVirtual, custoMedio
- **Mapeamento**: Atualizado na tabela `product_channels`
- **Tempo Real**: Sincronização frequente para dados atualizados

## 🔐 Segurança

### Tokens OAuth
- **Armazenamento**: Tokens criptografados no banco de dados
- **Renovação**: Refresh automático antes da expiração
- **Escopo**: Apenas permissões necessárias (read/write)

### Dados Sensíveis
- **Criptografia**: Dados financeiros criptografados
- **Isolamento**: Dados isolados por empresa (RLS)
- **Auditoria**: Logs de todas as operações

## 📈 Monitoramento

### Métricas de Sync
- **Produtos**: Criados, atualizados, erros
- **Pedidos**: Importados por período
- **Performance**: Tempo de sincronização
- **Erros**: Log detalhado de falhas

### Alertas
- **Falha de Sync**: Notificação quando sync falha
- **Token Expirado**: Alerta para renovar autorização
- **Dados Inconsistentes**: Verificação de integridade

## 🚨 Troubleshooting

### Erro de Autenticação
```
Error: Not authenticated
```
**Solução**: Reconectar conta Bling na página de configurações.

### Erro de Token Expirado
```
Error: Token refresh failed
```
**Solução**: Desconectar e reconectar conta Bling.

### Erro de Sincronização
```
Error: Sync failed
```
**Soluções**:
1. Verificar conexão com internet
2. Verificar se conta Bling está ativa
3. Verificar limites de API do Bling
4. Tentar sincronização incremental

### Produtos Não Sincronizados
**Possíveis Causas**:
- Produtos inativos no Bling
- SKU duplicado
- Dados obrigatórios faltando

**Solução**: Verificar logs de erro na sincronização.

## 🔄 Próximos Passos

### Phase 2 - Automação
1. **Sync Automática** - Agendamento de sincronização
2. **Webhooks** - Receber notificações em tempo real
3. **Mapeamento Avançado** - Configurar campos customizados

### Phase 3 - Inteligência
1. **Análise de Margem** - Cálculos automáticos com dados Bling
2. **Previsão de Estoque** - Algoritmos baseados em histórico
3. **Alertas Inteligentes** - Notificações baseadas em padrões

## 📞 Suporte

### Recursos Úteis
- [Documentação Bling API](https://developer.bling.com.br/docs)
- [Bling Developer Portal](https://developer.bling.com.br)
- Página de configuração: `/dashboard/configuracoes/bling`
- Página de testes: `/api-test`

### Logs e Debug
- Verificar console do navegador para erros
- Logs de sincronização na resposta da API
- Status detalhado na página de configurações

### Contato Bling
- Suporte técnico: suporte@bling.com.br
- Documentação: developer.bling.com.br
- Status da API: status.bling.com.br
