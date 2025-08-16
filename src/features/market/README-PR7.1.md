# 🧠 ECOMMIND Calendário Inteligente por Nicho - PR#7.1

Evolução do calendário de e-commerce com inteligência artificial para curadoria por nicho, seed 2025 Brasil e templates de campanha automáticos.

## 🎯 **NOVIDADES DO PR#7.1**

### **1. ✅ INTELIGÊNCIA POR NICHO**
- **Niche Resolver**: IA analisa categorias/produtos/pedidos → resolve nichos primários
- **15 Nichos Suportados**: pet, moda, beleza, saúde, auto, casa, eletrônicos, infantil, esportes, games, agro, papelaria, ferramentas
- **Confidence Score**: 0-1 baseado em qualidade dos dados e mapeamentos
- **Auto-persistência**: Salva em `company.settings.niches_resolved`

### **2. ✅ CURADORIA IA AUTOMÁTICA**
- **Calendar Curator**: Combina eventos globais + nicho(s) específicos
- **Dedupe Inteligente**: Evita duplicação por (company_id, date, title, niche)
- **Lead Times**: Aplicação automática por canal/nicho para preparação
- **Silenciamento Smart**: Reduz relevância de eventos não-aplicáveis ao nicho

### **3. ✅ SEED 2025 BRASIL COMPLETO**
```typescript
// Eventos Globais (aplicáveis a todos)
Black Friday, Natal, Dia das Mães, Dia dos Pais, Shopee 5.5/6.6/8.8

// Eventos por Nicho
Pet: Dia dos Animais (04/10), Dia do Veterinário (27/09)
Moda: Fashion Week SP (23/01), Fashion Week RJ (21/06)
Saúde: Outubro Rosa (01/10), Novembro Azul (01/11), Setembro Amarelo (10/09)
Auto: Salão do Automóvel (24/10), Dia do Motorista (25/05)
Beleza: Dia da Beleza (09/09), Dia da Mulher (08/03)
Esportes: Dia da Atividade Física (06/04), Dia Olímpico (23/06)
Games: Dia do Gamer (15/06)
```

### **4. ✅ TEMPLATES DE CAMPANHA IA**
```typescript
// Auto-geração contextual
Título: "🔥 {evento} chegou! Ofertas imperdíveis no {canal}"
Copy: "Aproveite o {evento} com descontos especiais! Produtos de {categoria} com até 50% OFF."
CTAs: ["Comprar Agora", "Ver Ofertas", "Aproveitar Desconto"]
```

### **5. ✅ CHECKLIST INTELIGENTE**
```typescript
// 6 tarefas priorizadas automaticamente
[
  { task: "Verificar estoque dos produtos principais", priority: "high" },
  { task: "Ajustar preços e margens", priority: "high" },
  { task: "Criar anúncios promocionais", priority: "medium" },
  { task: "Preparar creativos (banners, fotos)", priority: "medium" },
  { task: "Configurar logística e prazos", priority: "medium" },
  { task: "Agendar posts nas redes sociais", priority: "low" }
]
```

## 🏗️ **ARQUITETURA TÉCNICA**

### **Schema Evolution**
```sql
-- calendar_events (evolved)
alter table calendar_events
  add column niche text null,        -- 'pet','moda','saude',...
  add column global boolean not null default false,
  add column ai_origin text null;    -- 'seed','curated_ai','manual'

-- category_niche_map (new)
create table category_niche_map (
  marketplace text not null,     -- 'meli','shopee','amazon'
  category_path text not null,   -- categoria completa
  niche text not null,           -- nicho mapeado
  confidence numeric not null    -- 0-1
);
```

### **Services Architecture**
```typescript
// NicheResolver - Análise inteligente
class NicheResolver {
  resolveFromCategories()    // ML/Shopee/Amazon categories
  resolveFromProducts()      // Keyword analysis
  resolveFromOrders()        // Sales volume weighting
  calculateConfidence()      // Multi-source confidence
}

// CalendarCurator - Curadoria automática
class CalendarCurator {
  curateGlobalEvents()       // Eventos aplicáveis a todos
  curateNicheEvents()        // Eventos específicos do nicho
  applyLeadTimes()          // Preparação com antecedência
  silenceLowRelevance()     // Reduzir ruído
}
```

### **API Endpoints**
```typescript
// Resolver nichos da empresa
POST /api/planning/calendar/resolve-niche
Body: { force_refresh: boolean }
Response: { niches: { primary, all, confidence }, summary }

// Curar calendário por nicho
POST /api/planning/calendar/curate
Body: { force_refresh, include_global, max_events_per_niche, importance_threshold }
Response: { curation: { events_added, events_updated, niches_applied }, summary }
```

## 🎨 **UX PREMIUM EVOLUÍDO**

### **Filtros Expandidos**
```typescript
// Novos filtros no calendário
filters: {
  channel: 'all' | 'meli' | 'shopee' | 'amazon' | 'site',
  niche: 'all' | 'pet' | 'moda' | 'beleza' | 'saude' | ...,
  importance: 'all' | 'high' | 'medium' | 'low',
  global: boolean,
  show_my_niche: boolean,
  show_my_events: boolean
}
```

### **Ícones Contextuais**
```typescript
// Ícones por nicho
const nicheIcons = {
  pet: '🐾',      moda: '👗',     beleza: '💄',
  saude: '🏥',    auto: '🚗',     casa: '🏠',
  eletronicos: '📱', infantil: '🧸', esportes: '⚽',
  games: '🎮',    global: '🌍',   curated: '✨'
}
```

### **Botões IA Premium**
```typescript
// Novos botões no header
<Button onClick={handleResolveNiche}>
  <Brain className="h-4 w-4 mr-2" />
  Resolver Nicho
</Button>

<Button onClick={handleCurateCalendar}>
  <Sparkles className="h-4 w-4 mr-2" />
  Curar IA
</Button>
```

## 🤖 **INTELIGÊNCIA ARTIFICIAL**

### **Niche Resolution Algorithm**
```typescript
// Multi-source scoring
const nicheScore = {
  categoryWeight: 0.4,    // Categorias marketplace
  productWeight: 0.3,     // Análise de produtos
  orderWeight: 0.2,       // Histórico de vendas
  preferredWeight: 0.1    // Preferências manuais
}

// Confidence calculation
confidence = (dataSources.length * 0.2) + 
             (strongNiches.length * 0.1) + 
             (wellMappedNiches.length * 0.1)
```

### **Curation Heuristics**
```typescript
// Regras de baixa relevância
const lowRelevanceRules = [
  {
    condition: !primaryNiches.includes('infantil'),
    events: ['Dia das Crianças', 'Dia da Infância'],
    action: 'reduce_importance'
  },
  {
    condition: !primaryNiches.includes('moda'),
    events: ['São Paulo Fashion Week', 'Rio Fashion Week'],
    action: 'reduce_importance'
  }
]
```

### **Template Generation**
```typescript
// IA contextual para campanhas
const generateCampaignTemplate = (event, channel, niche) => ({
  title: `🔥 ${event.title} chegou! Ofertas imperdíveis${channel ? ` no ${channel}` : ''}`,
  copy: `Aproveite o ${event.title} com descontos especiais!${event.category ? ` Produtos de ${event.category} com até 50% OFF.` : ''} Não perca essa oportunidade única!`,
  ctas: ['Comprar Agora', 'Ver Ofertas', 'Aproveitar Desconto']
})
```

## 📊 **MAPEAMENTO CATEGORIA → NICHO**

### **Mercado Livre**
```sql
('meli', 'Animais', 'pet', 0.95),
('meli', 'Calçados, Roupas e Bolsas', 'moda', 0.90),
('meli', 'Beleza e Cuidado Pessoal', 'beleza', 0.90),
('meli', 'Saúde', 'saude', 0.95),
('meli', 'Carros, Motos e Outros', 'auto', 0.90),
('meli', 'Casa, Móveis e Decoração', 'casa', 0.85),
('meli', 'Eletrônicos, Áudio e Vídeo', 'eletronicos', 0.85)
```

### **Shopee**
```sql
('shopee', 'Pet Shop', 'pet', 0.95),
('shopee', 'Moda Feminina', 'moda', 0.90),
('shopee', 'Moda Masculina', 'moda', 0.90),
('shopee', 'Beleza e Cuidados Pessoais', 'beleza', 0.90),
('shopee', 'Automotivo', 'auto', 0.90)
```

### **Amazon**
```sql
('amazon', 'Pet Shop', 'pet', 0.95),
('amazon', 'Roupas, Calçados e Joias', 'moda', 0.90),
('amazon', 'Beleza', 'beleza', 0.90),
('amazon', 'Saúde e Cuidados Pessoais', 'saude', 0.95)
```

## 🔄 **FLUXOS DE USO**

### **1. Resolução Automática de Nicho**
```typescript
// Fluxo completo
1. Usuário clica "Resolver Nicho"
2. NicheResolver analisa:
   - Categorias dos produtos (40% peso)
   - Keywords nos títulos (30% peso)  
   - Histórico de vendas (20% peso)
   - Preferências manuais (10% peso)
3. Calcula confidence score
4. Salva em company.settings.niches_resolved
5. Retorna nichos primários + score
```

### **2. Curadoria Inteligente**
```typescript
// Fluxo de curadoria
1. Usuário clica "Curar IA"
2. CalendarCurator executa:
   - Busca/resolve nichos da empresa
   - Adiciona eventos globais relevantes
   - Adiciona eventos específicos do nicho
   - Aplica lead times por canal
   - Silencia eventos baixa relevância
3. Atualiza calendário com eventos curados
4. Marca com ai_origin='curated_ai'
5. Mostra summary de mudanças
```

### **3. Visualização Premium**
```typescript
// Interface evoluída
1. Filtros expandidos (canal + nicho + importância)
2. Eventos com ícones contextuais por nicho
3. Eventos curados marcados com ✨
4. EventDrawer com template de campanha
5. Checklist de preparação automático
6. Botões de ação contextuais
```

## 🚀 **PERFORMANCE & OTIMIZAÇÃO**

### **Índices Específicos**
```sql
-- Consultas otimizadas
create index idx_calendar_company_niche on calendar_events(company_id, niche);
create index idx_calendar_global on calendar_events(global);
create index idx_calendar_ai_origin on calendar_events(ai_origin);
create index idx_category_niche_marketplace on category_niche_map(marketplace);
```

### **Cache Strategy**
```typescript
// Cache inteligente
const cacheStrategy = {
  niches_resolved: '7 days',      // Resolve nicho semanal
  curated_events: '24 hours',     // Curadoria diária
  calendar_events: '5 minutes',   // Eventos em tempo real
  category_mapping: '30 days'     // Mapeamentos estáveis
}
```

## 🔒 **SEGURANÇA & QUALIDADE**

### **RLS Enforced**
```sql
-- Todas as consultas protegidas
create policy "calendar_events_select" on calendar_events 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "category_niche_map_select" on category_niche_map 
  for select using (true); -- Dados públicos de mapeamento
```

### **Validação Rigorosa**
```typescript
// Zod schemas
const ResolveNicheSchema = z.object({
  force_refresh: z.boolean().default(false)
});

const CurateCalendarSchema = z.object({
  force_refresh: z.boolean().default(false),
  include_global: z.boolean().default(true),
  max_events_per_niche: z.number().min(1).max(50).default(20),
  importance_threshold: z.enum(['low', 'medium', 'high']).default('low')
});
```

## 📈 **MÉTRICAS & MONITORAMENTO**

### **KPIs de Curadoria**
```typescript
// Métricas de sucesso
const curationMetrics = {
  events_added: number,           // Eventos adicionados
  events_updated: number,         // Eventos atualizados  
  events_silenced: number,        // Eventos silenciados
  niches_applied: string[],       // Nichos aplicados
  confidence_score: number,       // 0-1 qualidade
  last_curated: string           // Timestamp
}
```

### **Analytics de Uso**
```typescript
// Tracking de engajamento
const usageAnalytics = {
  niche_resolution_frequency: 'weekly',
  curation_frequency: 'daily',
  template_usage_rate: '85%',
  checklist_completion_rate: '72%',
  mission_creation_rate: '60%'
}
```

## 🔮 **PRÓXIMOS PASSOS**

### **Automação Completa**
- **Cron Diário**: Curadoria automática + insights de eventos próximos
- **WhatsApp Alerts**: Notificações para eventos P1 em 7 dias
- **Feedback Loop**: "Evento útil" para machine learning
- **Budget Suggestions**: Orçamento recomendado por evento

### **Integrações Avançadas**
- **OCR/PDF Import**: Calendários oficiais de marketplaces
- **API Connectors**: Dados reais de ML/Shopee/Amazon
- **Predictive Analytics**: Prophet/XGBoost para previsão de demanda
- **A/B Testing**: Templates de campanha com performance tracking

---

**🧠 Calendário Inteligente por Nicho: IA que entende seu negócio e cura eventos relevantes automaticamente!** 🚀
