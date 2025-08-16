---
description: "ECOMMIND project context, goals, and technical specifications"
globs: ["**/*"]
alwaysApply: true
type: "always_apply"
---

# ECOMMIND Project Overview - Version: 1.0.0

## Project Identity

**Project Name**: ECOMMIND - Plataforma de Gestão Inteligente para E-commerce
**Mission**: Transformar o WhatsApp no centro de comando do e-commerce, unindo BI em tempo real, gestão de equipe e alertas inteligentes numa experiência conversacional.
**Vision**: Ser a plataforma líder em gestão conversacional de e-commerce no Brasil.

## Business Context

### Target Market
- **Primary Users**: Empreendedores e gestores de e-commerce multicanal
- **Company Size**: Faturamento entre R$ 100k e R$ 5M mensais
- **Channels**: 3+ canais (Mercado Livre, Shopee, Amazon, loja própria)
- **Team Size**: 5-20 pessoas por empresa

### Core Problem Solved
E-commerces multicanal enfrentam fragmentação de dados em dezenas de sistemas, resultando em decisões baseadas em "achismo" e perda de oportunidades de lucro. ECOMMIND centraliza todos os dados operacionais e financeiros numa única plataforma com interface conversacional via WhatsApp.

### Value Proposition
"A única plataforma que transforma seu WhatsApp no centro de comando do seu e-commerce, unindo BI em tempo real, gestão de equipe e alertas inteligentes numa experiência conversacional que você já usa todos os dias."

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict typing, no `any`)
- **UI Library**: Shadcn UI components
- **Styling**: Tailwind CSS with ECOMMIND brand colors
- **Icons**: Lucide React
- **State Management**: Server Components by default, Client Components when necessary

### Backend Stack
- **Runtime**: Node.js
- **Database**: PostgreSQL (primary), Redis (cache/sessions)
- **Authentication**: NextAuth.js or Supabase Auth with RBAC
- **APIs**: REST with OpenAPI documentation
- **Queue System**: Bull/BullMQ for background jobs and alerts
- **Real-time**: WebSockets for live updates

### Key Integrations
- **WhatsApp Business API**: Core conversational interface
- **Bling ERP API**: Primary data source for e-commerce data
- **Marketplace APIs**: Mercado Livre, Shopee, Amazon
- **Payment Gateways**: Integration for financial data

### Infrastructure
- **Hosting**: Cloud-based (AWS/GCP preferred)
- **Monitoring**: APM tools, real-time dashboards
- **Security**: HTTPS, encryption, LGPD compliance
- **Performance**: 99.9% uptime, <2s response times

## Core Features

### 1. BI Analítico e Operacional (Critical)
- Cálculo automático de margem líquida por pedido/SKU
- Metas por canal e SKU com acompanhamento
- Monitoramento de estoque com previsão de cobertura
- Análise de cobertura de catálogo

### 2. Alertas Automáticos via WhatsApp (Critical)
- Regras configuráveis para situações críticas
- Envio contextualizado com ação sugerida
- Criação de tarefas diretamente do alerta

### 3. Interface Conversacional WhatsApp (Critical)
- Consultas em linguagem natural
- Criação e acompanhamento de tarefas por comando
- Integração bidirecional com todos os módulos

### 4. Gestão de Tarefas Integrada (High)
- Kanban interno vinculado a SKUs e canais
- Calendário comercial pré-carregado
- Integração entre calendário, tarefas e insights

### 5. Módulo Financeiro Avançado (High)
- Fluxo de caixa projetado
- Alertas de saldo negativo
- Integração completa com Bling financeiro

## Success Metrics

### Business KPIs
- **Revenue Growth**: 20% MoM ARR growth
- **Market Share**: 5% of e-commerce management market in 24 months
- **Customer Success**: 15-30% margin increase for clients in 6 months
- **Retention**: <5% monthly churn rate

### User KPIs
- **Engagement**: DAU/MAU > 60%
- **Adoption**: >80% alert response rate
- **Efficiency**: 20+ hours saved weekly per user
- **Satisfaction**: NPS > 50

### Technical KPIs
- **Performance**: 99.9% uptime, <2s response time
- **Quality**: <0.1% error rate
- **Scalability**: Support 10,000+ concurrent users

## Development Phases

### Phase 1: Foundation (6 months)
- Bling integration and basic dashboards
- User authentication and management
- Core BI functionality

### Phase 2: Intelligence (3 months)
- WhatsApp Business API integration
- Automated alert system
- Basic conversational queries

### Phase 3: Automation (3 months)
- Integrated task management
- Stock prediction and suggestions
- Advanced financial module

### Phase 4: Scale (6 months)
- Chrome extension
- Predictive AI features
- Additional integrations

## Team Structure
- **Frontend Developers**: 2 (Next.js, TypeScript, Tailwind)
- **Backend Developers**: 2 (Node.js, PostgreSQL, APIs)
- **DevOps Engineer**: 1 (Cloud infrastructure, CI/CD)
- **Product Manager**: 1 (Requirements, roadmap)
- **UI/UX Designer**: 1 (Interface design, user experience)
- **QA Engineer**: 1 (Testing, quality assurance)

## Compliance & Security
- **Data Protection**: LGPD compliance, encryption at rest and transit
- **Authentication**: Multi-factor authentication for admins
- **Authorization**: Role-based access control (RBAC)
- **Monitoring**: Comprehensive logging and audit trails
- **Backup**: Automated backups with disaster recovery

## File Organization
```
src/
├── app/                  # Next.js App Router
├── components/           # Shared UI components
├── lib/                  # Utilities and helpers
├── integrations/         # External API integrations
├── features/            # Feature-specific modules
└── types/               # TypeScript type definitions
```

