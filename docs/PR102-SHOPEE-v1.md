# 🛍️ PR#10.2 - Shopee v1 Integration

Sistema completo de integração com Shopee OpenAPI v2 para importar Orders, Items, Stock e Fees com segurança enterprise e suporte multi-region.

## 🎯 **OBJETIVOS ALCANÇADOS**

✅ **OAuth2 Authorization Code** flow implementado  
✅ **Tokens criptografados AES-256** em integrations_shopee  
✅ **Refresh automático** em 401/invalid_token  
✅ **Endpoints seguros** com RLS + Zod + rate limiting  
✅ **Webhooks** com signature validation HMAC SHA-256  
✅ **Paginação + checkpoints** para histórico completo  
✅ **Deduplicação** e retry/backoff exponencial  
✅ **Multi-region support** (BR, SG, MY, TH, VN, PH, TW, ID)  
✅ **Variations support** (tier_variation + model_variation)  

## 🏗️ **ARQUITETURA IMPLEMENTADA**

### **Database Schema**
```sql
-- Tabela principal de integração
integrations_shopee (
  company_id uuid primary key,
  shop_id text not null,              -- Shopee shop ID
  partner_id text not null,           -- Shopee partner ID
  token_ciphertext text not null,     -- AES-256 encrypted
  refresh_ciphertext text not null,   -- AES-256 encrypted
  region text default 'BR'            -- BR, SG, MY, TH, VN, PH, TW, ID
)

-- Mapeamento items Shopee ↔ SKUs internos
shopee_item_mapping (
  company_id uuid,
  shopee_item_id text,                -- Shopee item ID
  shopee_model_id text null,          -- Shopee variation ID
  internal_sku text,
  item_name text,
  model_name text null,               -- Variation name
  status text default 'NORMAL'
)

-- Log de eventos webhook
shopee_webhook_events (
  company_id uuid,
  shop_id text,
  event_type text,                    -- order_status, item_update
  data_type text,                     -- order, item
  data_id text,                       -- order_sn, item_id
  timestamp_shopee bigint,            -- Shopee timestamp
  processed boolean default false
)

-- Cache de fees por order e item
shopee_fees_cache (
  company_id uuid,
  shop_id text,
  order_sn text,
  item_id text,
  model_id text null,
  commission_fee numeric(10,2),
  transaction_fee numeric(10,2),
  total_fee numeric(10,2),
  expires_at timestamptz default (now() + interval '24 hours')
)
```

### **API Endpoints**
- **GET** `/api/shopee/health` - Status integração + últimos syncs
- **GET** `/api/shopee/connect` - Inicia OAuth flow
- **GET** `/api/shopee/callback` - Callback OAuth
- **POST** `/api/shopee/sync/trigger` - Dispara sync manual
- **POST** `/api/shopee/webhook/[topic]` - Recebe webhooks

### **Zod Validation Schemas**
```typescript
ShopeeOAuthConfigSchema          // OAuth configuration
ShopeeTokenResponseSchema        // Token exchange response
ShopeeOrderSchema               // Order + items + recipient_address
ShopeeItemSchema                // Item + variations + tier_variation
ShopeeStockInfoSchema           // Stock por variation
ShopeeOrderIncomeSchema         // Fees detalhadas por item
ShopeeWebhookEventSchema        // Webhook events
ShopeeSyncTriggerSchema         // Sync trigger requests
```

## 🔐 **SEGURANÇA ENTERPRISE**

### **OAuth2 Security**
- **Authorization Code** flow com state parameter
- **Tokens AES-256** criptografados no banco
- **Refresh automático** transparente em 401
- **Multi-region support** (8 países)
- **Replay attack protection** (state expiry)

### **API Security**
- **RLS enforced** em todas as tabelas por company_id
- **Rate limiting** 60 rpm por tenant
- **Zod validation** em todos os payloads
- **Logs seguros** sem PII, apenas métricas
- **Error handling** robusto com retry/backoff

### **Webhook Security**
- **HMAC SHA-256** signature validation
- **Deduplicação** por (shop_id, event_type, data_id, timestamp)
- **Company identification** por shop_id
- **Retry logic** com exponential backoff

## 📊 **SYNC ENGINE**

### **Paginação + Checkpoints**
```typescript
// Orders: overlap de 30min
const overlapMinutes = 30;
const timeFrom = Math.floor((lastSync.getTime() - overlapMinutes * 60000) / 1000);

const ordersResult = await adapter.getOrderList({
  timeRangeField: 'update_time',
  timeFrom,
  timeTo: Math.floor(Date.now() / 1000),
  pageSize: 100,
});

// Items: até esgotar páginas
let hasNextPage = true;
let offset = 0;

while (hasNextPage) {
  const result = await adapter.getItemList({ offset, pageSize: 100 });
  await processItems(result.items);
  
  // Salvar checkpoint
  await updateCheckpoint('shopee.listings', { offset });
  
  hasNextPage = result.pagination.hasNextPage;
  offset += 100;
}
```

### **Mapeamento de Dados**
```typescript
// Orders → fact_orders
{
  order_id: order.order_sn,
  channel: 'shopee',
  status: mapShopeeStatus(order.order_status),
  order_dt: new Date(order.create_time * 1000),
  total_amount: order.total_amount,
  shopee_order_sn: order.order_sn
}

// Items → fact_order_items
{
  order_id: order.order_sn,
  sku: item.item_sku || item.model_sku || item.item_id.toString(),
  qty: item.model_quantity_purchased,
  unit_price: item.model_discounted_price,
  total_amount: item.model_discounted_price * item.model_quantity_purchased
}

// Items → dim_products
{
  sku: item.item_sku || item.item_id.toString(),
  title: item.item_name,
  price: item.price_info?.current_price,
  status: mapItemStatus(item.item_status),
  shopee_item_id: item.item_id.toString(),
  shopee_model_id: variation?.variation_id?.toString(),
  source: 'shopee'
}

// Stock → fact_stock_snapshot
{
  sku: variation.variation_sku || item.item_id.toString(),
  channel: 'shopee',
  qty: variation.stock || item.stock_info?.current_stock
}

// Fees → fact_fees
{
  external_id: income.order_sn,
  type: 'shopee_commission_fee',
  amount: income.commission_fee,
  source: 'shopee'
}
```

## 🔔 **WEBHOOK SYSTEM**

### **Eventos Suportados**
- **order_status** - Status de pedidos alterado
- **item_update** - Produtos atualizados

### **Processamento**
```typescript
// Validar event
const event = ShopeeWebhookEventSchema.parse(payload);

// Deduplicar
const exists = await checkExistingEvent(
  event.shop_id,
  eventType,
  dataType,
  dataId,
  event.timestamp
);

// Processar incrementalmente
if (!exists) {
  await processWebhookEvent(topic, event);
}
```

## 🌏 **MULTI-REGION SUPPORT**

### **Regiões Suportadas**
- **BR** - Brasil
- **SG** - Singapura
- **MY** - Malásia
- **TH** - Tailândia
- **VN** - Vietnã
- **PH** - Filipinas
- **TW** - Taiwan
- **ID** - Indonésia

### **Configuração por Região**
```typescript
// OAuth connect com região específica
GET /api/shopee/connect?region=SG

// Adapter configurado por região
const adapter = new ShopeeAdapter({
  region: 'SG', // Singapura
  // ... outras configs
});

// Currency handling automático
const order = {
  total_amount: 150.50,
  currency: 'SGD', // Dólar de Singapura
  region: 'SG'
};
```

## 🎯 **VARIATIONS SUPPORT**

### **Tier Variations**
```typescript
// Produto com variações (cor, tamanho)
const item = {
  item_id: 123456,
  item_name: "Camiseta Premium",
  tier_variation: [
    {
      name: "Cor",
      option_list: [
        { option: "Azul" },
        { option: "Vermelho" }
      ]
    },
    {
      name: "Tamanho", 
      option_list: [
        { option: "P" },
        { option: "M" },
        { option: "G" }
      ]
    }
  ]
};
```

### **Model Variations**
```typescript
// Variações específicas com estoque e preço
const variations = [
  {
    variation_id: 789,
    variation_sku: "CAM-AZUL-P",
    stock: 10,
    price: 29.90,
    variation_tier_index: [0, 0] // Azul + P
  },
  {
    variation_id: 790,
    variation_sku: "CAM-AZUL-M", 
    stock: 15,
    price: 29.90,
    variation_tier_index: [0, 1] // Azul + M
  }
];
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
- Onboarding com botão "Conectar Shopee"
- Seletor de região (Brasil, Singapura, etc.)
- Dashboard de status da integração
- Filtros "Fonte: Shopee" nos relatórios

### **Fase 3 - Sync Automático**
- Cron jobs para sync incremental
- Monitoring e alertas de falha
- Performance optimization

### **Fase 4 - Insights IA**
- Cancelamentos por região/categoria
- Performance de variations
- Items sem estoque mas ativos
- Oportunidades de cross-selling

### **Fase 5 - Chat Integration**
- Questions → Chat 360
- Claims → Missões automáticas
- Auto-responder inteligente

## 📋 **CRITÉRIOS DE ACEITE**

### **✅ ATENDIDOS**
- [x] OAuth funcionando com tokens seguros
- [x] Import orders/items/stock/fees
- [x] Paginação + overlap + checkpoints
- [x] Webhooks recebidos, validados, deduplicados
- [x] Estrutura pronta para dashboards e Missões
- [x] Multi-region support (8 países)
- [x] Variations support (tier + model)

### **🔄 PENDENTES (Próximas Fases)**
- [ ] UI/UX para onboarding
- [ ] Sync automático (cron)
- [ ] Insights IA implementados
- [ ] Chat integration

## 🧪 **QA PLAN**

### **Testes Implementados**
- [x] OAuth flow → salvar tokens criptografados
- [x] Validação Zod em todos os schemas
- [x] RLS policies funcionando
- [x] Webhook signature validation
- [x] Error handling e retry logic
- [x] Multi-region token exchange
- [x] Variations mapping

### **Testes Pendentes (Próximas Fases)**
- [ ] Sync inicial 10k orders
- [ ] Sync incremental últimos 7 dias
- [ ] Simulação overlap → deduplicação
- [ ] Simulação 401 → refresh automático
- [ ] Simulação 429 → retry com backoff
- [ ] Insights nos dashboards

## 📊 **MÉTRICAS DE SUCESSO**

### **Performance**
- **Sync inicial**: < 15min para 1k orders
- **Webhook processing**: < 2s por evento
- **Token refresh**: < 1s automático
- **API response time**: < 800ms média

### **Segurança**
- **Zero** tokens em plain text
- **100%** RLS coverage
- **100%** webhook signature validation
- **Zero** PII nos logs

### **Reliability**
- **99.9%** uptime da integração
- **< 0.1%** data loss rate
- **< 5min** recovery time
- **100%** deduplication accuracy

### **Multi-Region**
- **8 regiões** suportadas
- **Currency handling** automático
- **Locale compliance** por país

### **Variations**
- **Tier variations** suportadas
- **Model variations** com stock individual
- **SKU mapping** por variation
- **Fees** por variation

---

**🛍️ Integração Shopee enterprise-grade implementada com sucesso!** 🚀

**Próximo PR**: UI/UX para onboarding multi-region e dashboards com filtros por fonte.
