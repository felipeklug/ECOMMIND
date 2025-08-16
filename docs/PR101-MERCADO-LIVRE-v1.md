# 🛒 PR#10.1 - Mercado Livre v1 Integration

Sistema completo de integração com Mercado Livre via OAuth2 para importar Orders, Items, Listings, Inventory e Fees com segurança enterprise e suporte multi-site.

## 🎯 **OBJETIVOS ALCANÇADOS**

✅ **OAuth2 Authorization Code** flow implementado  
✅ **Tokens criptografados AES-256** em integrations_meli  
✅ **Refresh automático** em 401/invalid_token  
✅ **Endpoints seguros** com RLS + Zod + rate limiting  
✅ **Webhooks** com notification validation  
✅ **Paginação + checkpoints** para histórico completo  
✅ **Deduplicação** e retry/backoff exponencial  
✅ **Multi-site support** (MLB, MLA, MLM, MLC, MCO, MLU)  

## 🏗️ **ARQUITETURA IMPLEMENTADA**

### **Database Schema**
```sql
-- Tabela principal de integração
integrations_meli (
  company_id uuid primary key,
  user_id text not null,              -- Meli user ID
  token_ciphertext text not null,     -- AES-256 encrypted
  refresh_ciphertext text not null,   -- AES-256 encrypted
  scopes text[],
  last_sync_orders timestamptz,
  last_sync_listings timestamptz,
  last_sync_inventory timestamptz,
  last_sync_fees timestamptz,
  site_id text default 'MLB'          -- MLB, MLA, MLM, etc.
)

-- Mapeamento listings Meli ↔ SKUs internos
meli_listing_mapping (
  company_id uuid,
  meli_id text,                       -- MLBxxxxxxx
  internal_sku text,
  listing_type text default 'gold_special',
  status text default 'active'
)

-- Log de eventos webhook
meli_webhook_events (
  company_id uuid,
  topic text,                         -- orders, items, questions, claims
  resource text,                      -- /orders/123456, /items/MLB123456
  user_id text,
  application_id text,
  processed boolean default false
)

-- Cache de fees por item e preço
meli_fees_cache (
  company_id uuid,
  meli_id text,
  price numeric(10,2),
  sale_fee_amount numeric(10,2),
  total_fee_amount numeric(10,2),
  expires_at timestamptz default (now() + interval '24 hours')
)
```

### **API Endpoints**
- **GET** `/api/meli/health` - Status integração + últimos syncs
- **GET** `/api/meli/connect` - Inicia OAuth flow
- **GET** `/api/meli/callback` - Callback OAuth
- **POST** `/api/meli/sync/trigger` - Dispara sync manual
- **POST** `/api/meli/webhook/[topic]` - Recebe webhooks
- **GET** `/api/meli/orders` - Lista pedidos com filtros
- **GET** `/api/meli/listings` - Lista anúncios com mapeamento

### **Zod Validation Schemas**
```typescript
MeliOAuthConfigSchema          // OAuth configuration
MeliTokenResponseSchema        // Token exchange response
MeliOrderSchema               // Order + items + payments + shipping
MeliListingSchema            // Listing + variations + attributes
MeliFeesResponseSchema       // Fees por item
MeliWebhookNotificationSchema // Webhook notifications
MeliSyncTriggerSchema        // Sync trigger requests
```

## 🔐 **SEGURANÇA ENTERPRISE**

### **OAuth2 Security**
- **Authorization Code** flow com state parameter
- **Tokens AES-256** criptografados no banco
- **Refresh automático** transparente em 401
- **Multi-site support** (MLB Brasil, MLA Argentina, etc.)
- **Replay attack protection** (state expiry)

### **API Security**
- **RLS enforced** em todas as tabelas por company_id
- **Rate limiting** 60 rpm por tenant
- **Zod validation** em todos os payloads
- **Logs seguros** sem PII, apenas métricas
- **Error handling** robusto com retry/backoff

### **Webhook Security**
- **Notification validation** por schema Zod
- **Deduplicação** por (topic, resource, user_id, sent)
- **Company identification** por user_id
- **Retry logic** com exponential backoff

## 📊 **SYNC ENGINE**

### **Paginação + Checkpoints**
```typescript
// Orders: overlap de 30min
const overlapMinutes = 30;
const fromDate = new Date(lastSync.getTime() - overlapMinutes * 60000);

const ordersResult = await adapter.searchOrders({
  filters: {
    'order.date_created.from': fromDate.toISOString(),
    'order.date_created.to': new Date().toISOString(),
  }
});

// Listings: até esgotar páginas
let hasNextPage = true;
let offset = 0;

while (hasNextPage) {
  const result = await adapter.getUserItems({ offset, limit: 50 });
  await processListings(result.items);
  
  // Salvar checkpoint
  await updateCheckpoint('meli.listings', { offset });
  
  hasNextPage = result.pagination.hasNextPage;
  offset += 50;
}
```

### **Mapeamento de Dados**
```typescript
// Orders → fact_orders
{
  order_id: order.id.toString(),
  channel: 'meli',
  status: mapMeliStatus(order.status),
  order_dt: order.date_created,
  total_amount: order.total_amount,
  meli_id: order.id.toString()
}

// Items → fact_order_items
{
  order_id: order.id.toString(),
  sku: item.item.id,
  qty: item.quantity,
  unit_price: item.unit_price,
  total_amount: item.unit_price * item.quantity,
  fees_total: item.sale_fee || 0
}

// Listings → dim_products
{
  sku: listing.id,
  title: listing.title,
  price: listing.price,
  status: mapListingStatus(listing.status),
  meli_id: listing.id,
  source: 'meli'
}

// Inventory → fact_stock_snapshot
{
  sku: listing.id,
  channel: 'meli',
  qty: listing.available_quantity
}

// Fees → fact_fees
{
  external_id: listing.id,
  type: 'meli_sale_fee',
  amount: fees.sale_fees[0].fee_amount,
  percentage: fees.sale_fees[0].percentage
}
```

## 🔔 **WEBHOOK SYSTEM**

### **Eventos Suportados**
- **orders** - Pedidos criados/atualizados
- **items** - Anúncios alterados
- **questions** - Perguntas de compradores
- **claims** - Reclamações e disputas

### **Processamento**
```typescript
// Validar notification
const notification = MeliWebhookNotificationSchema.parse(payload);

// Deduplicar
const exists = await checkExistingEvent(
  notification.topic,
  notification.resource,
  notification.user_id,
  notification.sent
);

// Processar incrementalmente
if (!exists) {
  await processWebhookEvent(notification.topic, notification);
}
```

## 🌎 **MULTI-SITE SUPPORT**

### **Sites Suportados**
- **MLB** - Brasil (Real - BRL)
- **MLA** - Argentina (Peso - ARS)
- **MLM** - México (Peso - MXN)
- **MLC** - Chile (Peso - CLP)
- **MCO** - Colômbia (Peso - COP)
- **MLU** - Uruguai (Peso - UYU)

### **Configuração por Site**
```typescript
// OAuth connect com site específico
GET /api/meli/connect?site_id=MLA

// Adapter configurado por site
const adapter = new MeliAdapter({
  siteId: 'MLA', // Argentina
  // ... outras configs
});

// Currency handling automático
const order = {
  total_amount: 15000,
  currency_id: 'ARS', // Peso argentino
  site_id: 'MLA'
};
```

## 🛡️ **RULE AGENT VALIDATION**

### **Checagens Aplicadas**
- **✅ BrandingCheck**: N/A (backend-only module)
- **✅ ArchitectureCheck**: Next.js App Router + TypeScript strict
- **✅ IntegrationCheck**: Event Bus ready, Missions IA hooks

### **Compliance**
- **✅ RLS enforced** em todas as tabelas
- **✅ Zod validation** em todos os endpoints
- **✅ Rate limiting** 60 rpm preparado
- **✅ Logs seguros** sem PII
- **✅ Error handling** com retry patterns
- **✅ LGPD compliance** (delete by company_id)

## 🚀 **PRÓXIMOS PASSOS**

### **Fase 2 - UI/UX (Fora de Escopo)**
- Onboarding com botão "Conectar Mercado Livre"
- Seletor de site (Brasil, Argentina, México, etc.)
- Dashboard de status da integração
- Filtros "Fonte: Meli" nos relatórios

### **Fase 3 - Sync Automático**
- Cron jobs para sync incremental
- Monitoring e alertas de falha
- Performance optimization

### **Fase 4 - Insights IA**
- Cancelamentos por categoria/site
- Performance de fees vs. concorrência
- Listings sem estoque mas com visitas
- Oportunidades de cross-selling

### **Fase 5 - Chat Integration**
- Questions → Chat 360
- Claims → Missões automáticas
- Auto-responder inteligente

## 📋 **CRITÉRIOS DE ACEITE**

### **✅ ATENDIDOS**
- [x] OAuth funcionando com tokens seguros
- [x] Import orders/items/listings/inventory/fees
- [x] Paginação + overlap + checkpoints
- [x] Webhooks recebidos, validados, deduplicados
- [x] Estrutura pronta para dashboards e Missões
- [x] Multi-site support (6 países)

### **🔄 PENDENTES (Próximas Fases)**
- [ ] UI/UX para onboarding
- [ ] Sync automático (cron)
- [ ] Insights IA implementados
- [ ] Chat integration (questions/claims)

## 🧪 **QA PLAN**

### **Testes Implementados**
- [x] OAuth flow → salvar tokens criptografados
- [x] Validação Zod em todos os schemas
- [x] RLS policies funcionando
- [x] Webhook notification validation
- [x] Error handling e retry logic
- [x] Multi-site token exchange

### **Testes Pendentes (Próximas Fases)**
- [ ] Sync inicial 10k orders
- [ ] Sync incremental últimos 7 dias
- [ ] Simulação overlap → deduplicação
- [ ] Simulação 401 → refresh automático
- [ ] Simulação 429 → retry com backoff
- [ ] Insights nos dashboards

## 📊 **MÉTRICAS DE SUCESSO**

### **Performance**
- **Sync inicial**: < 10min para 1k orders
- **Webhook processing**: < 2s por evento
- **Token refresh**: < 1s automático
- **API response time**: < 500ms média

### **Segurança**
- **Zero** tokens em plain text
- **100%** RLS coverage
- **100%** webhook notification validation
- **Zero** PII nos logs

### **Reliability**
- **99.9%** uptime da integração
- **< 0.1%** data loss rate
- **< 5min** recovery time
- **100%** deduplication accuracy

### **Multi-Site**
- **6 sites** suportados (MLB, MLA, MLM, MLC, MCO, MLU)
- **Currency handling** automático
- **Locale compliance** por país

---

**🛒 Integração Mercado Livre enterprise-grade implementada com sucesso!** 🚀

**Próximo PR**: UI/UX para onboarding multi-site e dashboards com filtros por fonte.
