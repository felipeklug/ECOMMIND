# 🔗 ECOMMIND ERP Adapters - Version: 1.0.0

Sistema de integração com ERPs brasileiros, começando com Bling v3 API.

## 📋 **Estrutura**

```
src/core/adapters/erp/
├── BlingAdapter.ts           # Adapter principal do Bling
├── types/
│   └── bling.ts             # Types e interfaces do Bling
└── README.md                # Esta documentação
```

## 🎯 **Bling Integration**

### **OAuth Flow Completo**

1. **Iniciar Conexão**: `POST /api/integrations/bling`
   - Gera URL de autorização com state CSRF
   - Abre popup para autorização no Bling

2. **Callback OAuth**: `GET /api/integrations/bling/callback`
   - Processa código de autorização
   - Troca por access_token e refresh_token
   - Criptografa tokens com AES-256-GCM
   - Salva em `companies.bling_tokens`

3. **Status**: `GET /api/integrations/bling`
   - Verifica se conectado e token válido
   - Retorna data de expiração e escopo

### **Tokens Criptografados**

```typescript
interface EncryptedTokenData {
  access_token: {
    cipher: string;
    iv: string;
    tag: string;
  };
  refresh_token: {
    cipher: string;
    iv: string;
    tag: string;
  };
  expires_at: string;
  scope: string;
  created_at: string;
  updated_at: string;
}
```

**Segurança:**
- Tokens nunca em claro no banco
- AES-256-GCM com ENCRYPTION_KEY
- Refresh automático quando próximo do vencimento
- Buffer de 5 minutos para renovação

### **ETL de Produtos**

**Endpoint**: `POST /api/etl/bling/products`

**Fluxo:**
1. Verifica último checkpoint em `etl_checkpoints`
2. Calcula `since` com overlap de 30 minutos
3. Pagina API do Bling até exaurir dados
4. Mapeia produtos para schema interno
5. UPSERT em batch na tabela `products`
6. Atualiza checkpoint e log de execução

**Mapeamento:**
```typescript
// Bling → ECOMMIND
codigo → sku
descricao → title
marca → brand
tipo → product_type
dataInclusao → created_dt
```

### **ETL de Pedidos**

**Endpoint**: `POST /api/etl/bling/orders`

**Fluxo:**
1. Mesmo processo de checkpoint e paginação
2. Mapeia pedidos para `orders` e itens para `order_items`
3. Detecta canal automaticamente (ML/Shopee/Amazon/Site)
4. UPSERT idempotente por `(company_id, order_id)`

**Mapeamento:**
```typescript
// Bling → ECOMMIND
numero → order_id
data → order_dt
situacao.nome → status
contato.nome → buyer_name
itens[].codigo → sku
itens[].quantidade → qty
itens[].valor → unit_price
```

## 🔧 **BlingAdapter**

### **Métodos Principais**

```typescript
class BlingAdapter {
  // OAuth
  getAuthUrl(state?: string): string
  exchangeCode(code: string): Promise<EncryptedTokenData>
  refreshToken(tokenData: EncryptedTokenData): Promise<EncryptedTokenData>
  
  // API Calls
  getProducts(token: string, since?: string, page?: number): Promise<Page<BlingProduct>>
  getOrders(token: string, since?: string, page?: number): Promise<Page<BlingOrder>>
  
  // Mapeamentos
  mapProduct(blingProduct: BlingProduct, companyId: string): MappedProduct
  mapOrder(blingOrder: BlingOrder, companyId: string): MappedOrder
  mapOrderItems(blingOrder: BlingOrder, companyId: string): MappedOrderItem[]
}
```

### **Rate Limiting & Retry**

```typescript
const retryConfig = {
  maxRetries: 5,
  baseDelay: 1000,      // 1 segundo
  maxDelay: 30000,      // 30 segundos
  backoffMultiplier: 2, // Exponencial
}
```

**Tratamento de 429:**
- Lê header `retry-after` se disponível
- Senão usa backoff exponencial
- Logs estruturados para monitoramento

## 📊 **ETL Service**

### **Checkpoints**

Tabela `etl_checkpoints`:
```sql
company_id | source          | last_run_at
uuid       | bling.products  | 2025-01-16T10:30:00Z
uuid       | bling.orders    | 2025-01-16T10:25:00Z
```

### **Logs de Execução**

Tabela `etl_runs`:
```sql
id | company_id | source | started_at | finished_at | ok | pages | rows | error
```

### **Overlap de 30 Minutos**

```typescript
// Evita perda de dados entre execuções
const since = lastCheckpoint 
  ? new Date(lastCheckpoint.getTime() - (30 * 60 * 1000))
  : undefined
```

## 🔒 **Segurança**

### **Autenticação**
- Todos os endpoints requerem autenticação
- RLS enforced por `company_id`
- Validação de sessão em cada request

### **Criptografia**
```typescript
// Encrypt
const encrypted = encryptToken(plainToken)
// { cipher: "...", iv: "...", tag: "..." }

// Decrypt
const plainToken = decryptToken(encrypted)
```

### **Logs Seguros**
- Sem PII ou dados sensíveis
- Correlation IDs para rastreamento
- Métricas de performance

## 🎨 **UX Premium**

### **Página de Configuração**

`/dashboard/configuracoes/bling`:
- Status de conexão em tempo real
- Botões de sincronização manual
- Feedback visual com toasts
- Loading states e tratamento de erros

### **Estados Visuais**
- ✅ Conectado: Badge verde + data de expiração
- ❌ Desconectado: Badge cinza + botão conectar
- 🔄 Sincronizando: Spinner + progresso
- ⚠️ Erro: Toast vermelho + detalhes

## 📈 **Observabilidade**

### **Métricas Coletadas**
- Duração de cada operação (ms)
- Páginas processadas por execução
- Linhas inseridas/atualizadas
- Taxa de erro por endpoint
- Tempo de resposta da API Bling

### **Logs Estruturados**
```json
{
  "level": "info",
  "message": "Bling products ETL completed",
  "companyId": "uuid",
  "pages": 5,
  "rows": 247,
  "duration": 12500,
  "timestamp": "2025-01-16T10:30:00Z"
}
```

## 🚀 **Próximos Passos**

### **TinyAdapter**
- Reutilizar mesma interface `ERPAdapter`
- Implementar OAuth flow específico do Tiny
- Mapeamentos similares com ajustes de schema

### **Melhorias**
1. **Webhooks**: Receber notificações em tempo real
2. **Delta Sync**: Sincronização apenas de alterações
3. **Batch Processing**: Jobs assíncronos para grandes volumes
4. **Monitoring**: Dashboard de saúde das integrações
5. **Alertas**: Notificações de falhas ou tokens expirados

### **Outros ERPs**
- Omie
- ContaAzul
- Sage
- SAP Business One

## 🔧 **Configuração**

### **Variáveis de Ambiente**
```bash
# Bling OAuth
BLING_CLIENT_ID=your_client_id
BLING_CLIENT_SECRET=your_client_secret
BLING_REDIRECT_URI=https://ecommind.com.br/api/integrations/bling/callback

# Criptografia
ENCRYPTION_KEY=your_32_char_encryption_key_here
```

### **Permissões Bling**
- `read`: Leitura de produtos e pedidos
- `write`: Futuras funcionalidades (opcional)

## ✅ **Critérios de Aceite**

### **OAuth**
- ✅ URL de autorização gerada corretamente
- ✅ Callback processa código e salva tokens
- ✅ Tokens criptografados no banco
- ✅ Refresh automático funciona

### **ETL**
- ✅ Produtos sincronizados sem duplicatas
- ✅ Pedidos e itens mapeados corretamente
- ✅ Checkpoints atualizados
- ✅ Overlap de 30 minutos aplicado

### **Segurança**
- ✅ Nenhum token em claro
- ✅ RLS funcionando
- ✅ Rate limiting tratado
- ✅ Logs sanitizados

### **UX**
- ✅ Interface funcional e responsiva
- ✅ Feedback visual adequado
- ✅ Tratamento de erros
- ✅ Loading states

---

**🎉 Integração Bling v1 completa e pronta para produção!**
