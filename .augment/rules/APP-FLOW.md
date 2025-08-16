---
description: "ECOMMIND application flows and user journey patterns"
globs: ["**/*"]
alwaysApply: true
type: "always_apply"
---

# ECOMMIND App Flows - Version: 1.0.0

## Purpose & Scope

This document defines the core application flows for ECOMMIND, focusing on the conversational interface via WhatsApp and web dashboard interactions. These flows ensure consistent user experience across all touchpoints.

## Core User Flows

### 1. Initial Onboarding Flow

**Objective**: Connect user's Bling account and configure basic settings

**Steps**:
1. **Account Creation**
   - User signs up via web interface
   - Email verification and password setup
   - Company information collection

2. **Bling Integration**
   - User provides Bling API credentials
   - System validates connection
   - Initial data sync (products, orders, customers)
   - Progress indicator shows sync status

3. **WhatsApp Setup**
   - User connects WhatsApp Business number
   - System sends verification message
   - User confirms WhatsApp integration

4. **Basic Configuration**
   - Set business hours for alerts
   - Configure top 20 products for monitoring
   - Define alert preferences (frequency, types)

5. **Welcome Tour**
   - Interactive tutorial of main features
   - Sample queries demonstration
   - First alert configuration

**Success Criteria**: User receives first automated insight via WhatsApp within 24 hours

### 2. Daily Morning Consultation Flow

**Objective**: Provide comprehensive business overview to start the day

**Trigger**: User sends "Bom dia", "Como estão as vendas?" or similar greeting

**WhatsApp Flow**:
1. **Greeting Response**
   ```
   Bom dia! 🌅 Aqui está seu resumo de hoje:

   📊 VENDAS ONTEM:
   • Total: R$ 12.450 (↑15% vs dia anterior)
   • ML: R$ 7.200 | Shopee: R$ 3.100 | Site: R$ 2.150

   ⚠️ ALERTAS CRÍTICOS:
   • Produto X com estoque para 3 dias
   • Margem do Produto Y abaixo da meta (12%)

   ✅ TAREFAS PENDENTES: 3

   💰 FLUXO DE CAIXA:
   • Hoje: +R$ 8.500
   • Próximos 7 dias: +R$ 45.200

   O que você gostaria de analisar primeiro?
   ```

2. **Follow-up Options**
   - Detailed channel analysis
   - Alert investigation
   - Task management
   - Financial projections

**Web Dashboard Alternative**:
- Automatic redirect to morning dashboard
- Same information in visual format
- Quick action buttons for common tasks

### 3. Alert Management Flow

**Objective**: Handle critical business situations proactively

**Trigger**: Automated system detection or manual alert creation

**Alert Types & Flows**:

**A. Stock Rupture Alert**
```
🚨 ALERTA DE ESTOQUE

Produto: Smartphone XYZ
Estoque atual: 5 unidades
Cobertura: 3 dias (baseado em vendas dos últimos 7 dias)
Canal crítico: Mercado Livre (70% das vendas)

AÇÕES SUGERIDAS:
1️⃣ Criar tarefa de reposição
2️⃣ Pausar anúncios temporariamente
3️⃣ Ver histórico de fornecedores
4️⃣ Analisar produtos similares

Responda com o número da ação ou "ignorar"
```

**B. Low Margin Alert**
```
📉 MARGEM BAIXA DETECTADA

Produto: Fone Bluetooth ABC
Venda: R$ 89,90 no ML
Margem atual: 8% (Meta: 25%)
Motivo: Frete alto (R$ 15) + Taxa ML (R$ 12)

SUGESTÕES:
1️⃣ Ajustar preço para R$ 109,90
2️⃣ Negociar frete com transportadora
3️⃣ Criar promoção frete grátis
4️⃣ Analisar concorrência

Qual ação você prefere?
```

**Follow-up Actions**:
- Task creation with automatic assignment
- Price adjustment suggestions
- Supplier contact information
- Historical data analysis

### 4. Conversational Query Flow

**Objective**: Provide instant access to business data through natural language

**Common Query Patterns**:

**Sales Queries**:
- "Vendas de hoje" → Today's sales summary
- "Como foi o ML ontem?" → Mercado Livre performance
- "Top 5 produtos da semana" → Best-selling products
- "Margem do produto X" → Specific product profitability

**Stock Queries**:
- "Estoque baixo" → Products with low inventory
- "Quando repor produto Y?" → Restock recommendations
- "Produtos parados" → Slow-moving inventory
- "Cobertura de estoque" → Days of inventory coverage

**Financial Queries**:
- "Saldo hoje" → Current cash position
- "Recebíveis próximos 7 dias" → Upcoming receivables
- "Contas a pagar esta semana" → Upcoming payments
- "Fluxo de caixa mês" → Monthly cash flow projection

**Response Pattern**:
1. **Immediate Acknowledgment**: "Consultando vendas de hoje..."
2. **Data Presentation**: Formatted response with key metrics
3. **Context Addition**: Comparisons, trends, insights
4. **Action Suggestions**: Related actions user might want to take
5. **Follow-up Options**: "Quer ver mais detalhes?" or related queries

### 5. Task Management Flow

**Objective**: Convert insights into actionable tasks with team coordination

**Task Creation Methods**:

**A. From Alert**:
```
User: "1" (responding to stock alert)
System: "✅ Tarefa criada: 'Repor estoque Smartphone XYZ'
📋 Detalhes:
• Responsável: João (Compras)
• Prazo: 2 dias
• Fornecedor sugerido: TechDistrib
• Quantidade: 50 unidades

Tarefa enviada para João. Quer acompanhar o progresso?"
```

**B. Manual Creation**:
```
User: "Criar tarefa revisar fotos produto ABC"
System: "📝 Criando tarefa...

Título: Revisar fotos produto ABC
Responsável: Quem deve fazer isso?
1️⃣ Maria (Marketing)
2️⃣ Pedro (Produtos)
3️⃣ Eu mesmo
4️⃣ Outro"
```

**Task Tracking**:
- Automatic status updates via WhatsApp
- Progress notifications to task creator
- Deadline reminders
- Completion confirmations

### 6. Weekly Planning Flow

**Objective**: Strategic planning based on data insights and upcoming events

**Trigger**: Weekly planning session or "planejamento semanal" command

**Flow Steps**:
1. **Performance Review**
   - Previous week metrics vs. goals
   - Channel performance analysis
   - Product performance ranking
   - Financial summary

2. **Upcoming Events**
   - Commercial calendar events (Black Friday, etc.)
   - Supplier delivery schedules
   - Marketing campaign dates
   - Cash flow critical dates

3. **Goal Setting**
   - Weekly sales targets by channel
   - Inventory management priorities
   - Team task assignments
   - Budget allocations

4. **Action Planning**
   - Automatic task creation for key activities
   - Alert rule adjustments
   - Inventory reorder scheduling
   - Marketing campaign preparation

**Output**: Comprehensive weekly plan with automated task assignments and monitoring setup

## Implementation Guidelines

### WhatsApp Message Formatting
- Use emojis for visual hierarchy and engagement
- Keep messages under 4096 characters (WhatsApp limit)
- Use numbered options for user choices
- Include clear call-to-action buttons
- Provide context for all data points

### Response Time Standards
- Acknowledgment: < 2 seconds
- Simple queries: < 5 seconds
- Complex analysis: < 15 seconds
- Alert delivery: < 30 seconds from trigger

### Error Handling
- Clear error messages in Portuguese
- Suggest alternative actions when data unavailable
- Provide fallback options (web dashboard link)
- Log all errors for system improvement

### Personalization
- Learn user preferences over time
- Adapt message frequency to user behavior
- Customize alert sensitivity per user
- Remember common query patterns

## Success Metrics

### Flow Completion Rates
- Onboarding completion: >85%
- Alert response rate: >80%
- Query satisfaction: >90%
- Task completion: >75%

### Engagement Metrics
- Daily active conversations: >60%
- Average queries per day: >10
- Response time satisfaction: >95%
- Feature adoption rate: >70%

### Business Impact
- Time saved per user: >20 hours/week
- Decision speed improvement: >50%
- Problem detection speed: >80% faster
- Overall satisfaction: NPS >50

