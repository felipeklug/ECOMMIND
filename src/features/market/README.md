# 🧠 ECOMMIND Market Intelligence - Version: 1.0.0

Módulo de inteligência de mercado com calendário de e-commerce, engine de insights e análise de oportunidades.

## 📋 **Estrutura**

```
src/features/market/
├── components/
│   ├── calendar-content.tsx          # Interface principal do calendário
│   ├── calendar-view.tsx             # Grid mensal com eventos
│   ├── event-drawer.tsx              # Detalhes do evento + criar missão
│   ├── create-event-dialog.tsx       # Form para novos eventos
│   ├── upload-events-dialog.tsx      # Upload CSV/JSON eventos
│   ├── market-content.tsx            # Interface principal market
│   ├── calendar-skeleton.tsx         # Loading calendário
│   └── market-skeleton.tsx           # Loading market
├── hooks/
│   └── use-calendar-events.ts        # SWR hooks para eventos
└── README.md                         # Esta documentação

src/core/rules/
├── normalizers.ts                    # Normalização CSV/JSON
└── market-intel-engine.ts            # Engine de insights

src/app/api/
├── planning/calendar/
│   ├── list/route.ts                 # GET eventos com filtros
│   └── create/route.ts               # POST criar evento
└── market/
    ├── upload/route.ts               # POST upload dataset
    └── insights/route.ts             # POST gerar insights

public/templates/
├── calendar.csv                      # Template eventos
└── market-intel.csv                  # Template dados mercado

supabase/migrations/
└── 2025_01_12_market_intel.sql       # Schema completo
```

## 🎯 **Calendário de E-commerce**

### **Eventos Seed Brasileiros**
```sql
-- 20 eventos pré-cadastrados automaticamente
- Ano Novo, Dia dos Namorados, Dia da Mulher
- Shopee 5.5, 6.6, 8.8 (mega campanhas)
- Dia das Mães, Dia dos Pais, Dia das Crianças
- Black Friday, Natal, Réveillon
- Feriados nacionais (Tiradentes, Independência, etc.)
```

### **Interface Premium**
```typescript
// CalendarContent - Interface principal
- Navegação mensal (anterior/próximo)
- Filtros: canal, categoria, importância
- Stats cards: total, alta/média/baixa prioridade
- Grid calendário com eventos coloridos
- Ações: criar evento, importar CSV

// CalendarView - Grid mensal
- 7 dias da semana (Dom-Sáb)
- Eventos coloridos por importância
- Ícones por canal (🛒 ML, 🛍️ Shopee, 📦 Amazon)
- Hover effects e microinterações
- Indicador "hoje" destacado
```

### **Gestão de Eventos**
```typescript
// EventDrawer - Detalhes completos
- Data formatada em português
- Canal com badge colorido
- Categoria e importância
- Metadata e descrição
- Preview da missão a ser criada
- Ações: criar missão, editar, compartilhar

// CreateEventDialog - Form validado
- Data (input date com min hoje)
- Título obrigatório (max 200 chars)
- Canal opcional (global, meli, shopee, amazon, site)
- Categoria livre
- Importância (baixa/média/alta)
- Descrição opcional
```

### **Upload CSV/JSON**
```typescript
// UploadEventsDialog - Import massivo
- Suporte CSV e JSON (max 10MB)
- Template download automático
- Validação em tempo real
- Progress bar durante upload
- Relatório de erros detalhado
- Bulk insert otimizado
```

## 🧠 **Market Intelligence Engine**

### **Normalização de Dados**
```typescript
// CalendarNormalizer
- CSV/JSON → calendar_events
- Validação de datas, canais, importância
- Sanitização de strings (trim, max length)
- Tratamento de canais globais (all → null)

// MarketDatasetNormalizer  
- CSV/JSON → market_datasets + market_records
- Parsing de campos numéricos
- Validação de tipos (listing/keyword/category)
- Parsing de attributes JSON
- Tratamento de erros por linha
```

### **Engine de Insights (5 Tipos)**

#### **1. TrendOpportunity**
```typescript
// Condições
growth_rate >= 0.15 && demand_index >= 60

// Payload
{
  category: "Moda > Camisetas",
  identifier: "MLB123456", 
  growth_rate: 0.22,
  demand_index: 78,
  price_median: 119
}

// Prioridade: P0 (categoria foco) | P1 (outras)
// SLA: 2 dias (P0) | 5 dias (P1)
// Missão: "Investigar tendência: {identifier}"
```

#### **2. GapPortfolio**
```typescript
// Condições
demand_index >= 50 && !isInPortfolio(record)

// Payload
{
  category: "Eletrônicos > Fones",
  identifier: "fone bluetooth premium",
  demand_index: 85,
  sellers_top: 12
}

// Prioridade: P1 | SLA: 5 dias
// Missão: "Avaliar adição ao portfólio: {identifier}"
```

#### **3. PriceGap**
```typescript
// Condições
|price_median - seller_price| / seller_price > 0.15

// Payload
{
  sku: "SKU123",
  current_price: 89.90,
  market_median: 109.90,
  gap_percent: 22.3
}

// Prioridade: P2 | SLA: 14 dias
// Missão: "Revisar preço: {sku}"
```

#### **4. VariationOpportunity**
```typescript
// Condições
marketVariations.length > 0 && missingVariations.length > 0

// Payload
{
  sku: "CAMISETA001",
  missing_variations: ["GG", "azul", "rosa"],
  market_variations: ["P", "M", "G", "GG", "preto", "branco", "azul", "rosa"]
}

// Prioridade: P2 | SLA: 14 dias
// Missão: "Criar variações: {sku}"
```

#### **5. BundleOpportunity**
```typescript
// Condições
(title.includes("kit|combo") || attributes.bundle) && revenue_est > 10000

// Payload
{
  identifier: "kit treino casa",
  revenue_est: 636800,
  units_sold_est: 3200,
  pattern: "kit"
}

// Prioridade: P2 | SLA: 14 dias  
// Missão: "Desenvolver kit: {identifier}"
```

### **Dedupe & SLA**
```typescript
// Dedupe Key Pattern
dedupe_key = `market:${type}:${identifier}:${period_start}-${period_end}`

// Exemplo
"market:trend_opportunity:MLB123456:2025-07-01-2025-07-31"

// Janela de dedupe: 60 dias
// SLA automático por prioridade:
P0: 2 dias (categoria foco)
P1: 5 dias (oportunidades importantes)  
P2: 14 dias (melhorias incrementais)
```

## 📊 **Schema do Banco**

### **calendar_events**
```sql
id uuid primary key
company_id uuid not null (RLS)
date date not null
title text not null
channel text null -- meli|shopee|amazon|site|null
category text null
importance text not null default 'medium' -- low|medium|high
source text not null default 'seed' -- seed|manual|upload
metadata jsonb not null default '{}'
created_at timestamptz not null default now()
created_by uuid null references profiles(id)

-- Índices
idx_calendar_company_date(company_id, date)
idx_calendar_company_channel(company_id, channel)
```

### **market_datasets**
```sql
id uuid primary key
company_id uuid not null (RLS)
period_start date not null
period_end date not null
scope text not null -- 'niche'|'category'
source text not null -- 'seed'|'upload'
meta jsonb not null default '{}'
created_at timestamptz not null default now()
created_by uuid null references profiles(id)

-- Índices
idx_market_datasets_company(company_id)
idx_market_datasets_period(company_id, period_start, period_end)
```

### **market_records**
```sql
id uuid primary key
company_id uuid not null (RLS)
dataset_id uuid not null references market_datasets(id) on delete cascade
channel text not null -- meli|shopee|amazon|site|unknown
category text not null
identifier text not null -- sku/listingId/keyword
record_type text not null -- 'listing'|'keyword'|'category'
title text null
price numeric null
price_median numeric null
demand_index numeric null -- 0..100
growth_rate numeric null -- % período
sellers_top int null
units_sold_est numeric null
revenue_est numeric null
attributes jsonb not null default '{}'

-- Índices
idx_mr_company_dataset(company_id, dataset_id)
idx_mr_company_cat(company_id, category)
idx_mr_company_identifier(company_id, identifier)
idx_mr_demand_growth(demand_index, growth_rate)
```

## 🔗 **API Endpoints**

### **Calendário**
```typescript
// Listar eventos
GET /api/planning/calendar/list
Query: from, to, channel, category, importance
Response: { events[], eventsByDate{}, total, filters }

// Criar evento
POST /api/planning/calendar/create
Body: { date, title, channel?, category?, importance?, metadata? }
Response: { success: true, event }

// Upload eventos (TODO)
POST /api/planning/calendar/upload
Body: { events[], file_name? }
Response: { success, summary, validation_errors[] }
```

### **Market Intelligence**
```typescript
// Upload dataset
POST /api/market/upload
Body: { period_start, period_end, scope, data[], file_name? }
Response: { success, dataset, summary, validation_errors[] }

// Gerar insights
POST /api/market/insights  
Body: { dataset_id, auto_create_missions? }
Response: { success, dataset, summary, insights[], duplicated[] }

// Listar insights (TODO)
GET /api/market/list
Query: period, type, category, channel, q, limit, cursor
Response: { insights[], total, cursor }

// Export (TODO)
GET /api/market/export
Query: dataset_id, format=csv|json
Response: CSV/JSON file
```

## 🎨 **Design System**

### **Cores por Importância**
```css
/* Alta Prioridade */
.high-priority {
  @apply bg-red-100 text-red-800 border-red-200 hover:bg-red-200;
}

/* Média Prioridade */  
.medium-priority {
  @apply bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200;
}

/* Baixa Prioridade */
.low-priority {
  @apply bg-green-100 text-green-800 border-green-200 hover:bg-green-200;
}
```

### **Ícones por Canal**
```typescript
const channelIcons = {
  meli: '🛒',      // Mercado Livre
  shopee: '🛍️',   // Shopee  
  amazon: '📦',    // Amazon
  site: '🌐',      // Site Próprio
  global: '📅'     // Global/Todos
}
```

### **Microinterações**
```css
/* Hover em eventos do calendário */
.calendar-event {
  @apply transition-all duration-200 hover:shadow-md hover:scale-105;
}

/* Navegação de mês */
.month-nav {
  @apply transition-colors duration-200 hover:bg-muted;
}

/* Cards de stats */
.stats-card {
  @apply transition-shadow duration-200 hover:shadow-lg;
}
```

## 🔄 **Integração com Missões IA**

### **Auto-criação de Missões**
```typescript
// Trigger points
1. EventDrawer → "Criar Missão" (manual)
2. Market Insights → auto_create_missions=true (automático)

// Mission payload
{
  module: 'market' | 'planning',
  title: generateMissionTitle(insight),
  summary: generateMissionSummary(insight), 
  priority: insight.priority, // P0/P1/P2
  tags: generateMissionTags(insight),
  due_date: calculateDueDate(insight.sla_days),
  payload: {
    insight_id: savedInsight.id,
    insight_type: insight.type,
    scope: insight.scope,
    evidence: insight.evidence
  }
}

// Tags estruturadas
[
  'market:trend_opportunity',
  'channel:meli', 
  'category:moda_camisetas',
  'sku:CAMISETA001'
]
```

### **Dedupe de Missões**
```typescript
// Usa dedupe_key do insight
// Evita missões duplicadas para mesmo insight
// Janela de 60 dias para reprocessamento
```

## 📈 **Performance & Otimização**

### **SWR Cache Strategy**
```typescript
const cacheConfig = {
  // Eventos do calendário: 5 minutos
  calendar: { refreshInterval: 5 * 60 * 1000 },
  
  // Insights: 10 minutos  
  insights: { refreshInterval: 10 * 60 * 1000 },
  
  // Configuração global
  revalidateOnFocus: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000
}
```

### **Bulk Operations**
```typescript
// Upload de market_records em batches de 100
// Evita timeout em datasets grandes
// Progress tracking para UX

// Bulk insert otimizado
const batchSize = 100;
for (const batch of batches) {
  await supabase.from('market_records').insert(batch);
}
```

### **Índices Otimizados**
```sql
-- Consultas por empresa + data
idx_calendar_company_date(company_id, date)

-- Filtros de mercado
idx_mr_company_cat(company_id, category)
idx_mr_demand_growth(demand_index, growth_rate)

-- Lookup de insights
idx_mr_company_identifier(company_id, identifier)
```

## 🔒 **Segurança**

### **RLS Enforced**
```sql
-- Todas as tabelas protegidas por company_id
create policy "calendar_events_select" on calendar_events 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

-- Mesmo padrão para market_datasets e market_records
```

### **Upload Validation**
```typescript
// Tamanho máximo: 10MB
// Tipos aceitos: text/csv, application/json
// Sanitização: trim, max length, whitelist
// Rate limiting: 10 uploads/min por empresa
```

### **Logs Estruturados**
```typescript
// Sem PII nos logs
logSecure('info', 'Calendar events retrieved', {
  companyId,
  total: result.total,
  filters: { from, to, channel, category }
});

// Métricas de upload sem conteúdo
logSecure('info', 'Market dataset uploaded', {
  companyId,
  datasetId,
  summary: { total_rows, valid_rows, error_rows }
});
```

## 🚀 **Próximos Passos (Fase 2)**

### **Conectores Reais**
```typescript
// ExternalAdapter.contract.ts implementado
interface ExternalAdapter {
  fetchMarketData(params: FetchParams): Promise<MarketData[]>
  validateConnection(): Promise<boolean>
  getRateLimit(): RateLimitInfo
}

// Implementações
- MercadoLivreAdapter
- ShopeeAdapter  
- AmazonAdapter
```

### **Calculadora de Viabilidade**
```typescript
// Embedded no insight drawer
interface ViabilityCalculator {
  inputs: {
    tax_rate: number      // % imposto
    commission: number    // % comissão canal
    shipping: number      // custo frete
    target_margin: number // % margem desejada
  }
  outputs: {
    target_cogs: number      // CMV alvo
    recommended_price: number // preço recomendado
    projected_margin: number  // margem prevista
  }
}
```

### **Notificações WhatsApp**
```typescript
// Para insights P0/P1
// Integração com fluxo do PR#6
// Template: "🚨 Nova oportunidade detectada: {title}"
```

### **Modelos de Previsão**
```typescript
// Prophet para sazonalidade
// XGBoost para demanda por categoria
// Integração com dados históricos
```

---

**🧠 Market Intelligence completo e pronto para insights acionáveis!**
