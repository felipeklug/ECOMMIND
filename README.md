# ECOMMIND - Gestão Inteligente para E-commerce

A única plataforma que transforma seu WhatsApp no centro de comando do seu e-commerce, unindo BI em tempo real, gestão de equipe e alertas inteligentes numa experiência conversacional.

## 🚀 Funcionalidades Principais

### 📊 BI Analítico e Operacional
- Cálculo automático de margem líquida por pedido/SKU
- Metas por canal e SKU com acompanhamento
- Monitoramento de estoque com previsão de cobertura
- Análise de cobertura de catálogo

### 📱 Alertas Automáticos via WhatsApp
- Regras configuráveis para situações críticas
- Envio contextualizado com ação sugerida
- Criação de tarefas diretamente do alerta

### 💬 Interface Conversacional WhatsApp
- Consultas em linguagem natural
- Criação e acompanhamento de tarefas por comando
- Integração bidirecional com todos os módulos

### 📋 Gestão de Tarefas Integrada
- Kanban interno vinculado a SKUs e canais
- Calendário comercial pré-carregado
- Integração entre calendário, tarefas e insights

### 💰 Módulo Financeiro Avançado
- Fluxo de caixa projetado
- Alertas de saldo negativo
- Integração completa com Bling financeiro

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict typing)
- **UI Library**: Shadcn UI components
- **Styling**: Tailwind CSS with ECOMMIND brand colors
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL (primary), Redis (cache/sessions)
- **Authentication**: NextAuth.js or Supabase Auth with RBAC
- **APIs**: REST with OpenAPI documentation
- **Queue System**: Bull/BullMQ for background jobs and alerts
- **Real-time**: WebSockets for live updates

### Integrações
- **WhatsApp Business API**: Core conversational interface
- **Bling ERP API**: Primary data source for e-commerce data
- **Marketplace APIs**: Mercado Livre, Shopee, Amazon

## 🏗️ Estrutura do Projeto

```
src/
├── app/                  # Next.js App Router
├── components/           # Shared UI components
│   ├── ui/               # Shadcn UI components
│   ├── shared/           # App-wide components
│   └── forms/            # Form components
├── features/             # Feature-specific modules
├── lib/                  # Utilities and helpers
├── integrations/         # External API integrations
└── types/                # TypeScript type definitions
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou pnpm

### Instalação
```bash
# Clone o repositório
git clone https://github.com/felipeklug/ECOMMIND.git

# Entre no diretório
cd ECOMMIND

# Instale as dependências
npm install

# Execute o projeto em desenvolvimento
npm run dev
```

### Scripts Disponíveis
- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Executa build de produção
- `npm run lint` - Executa linting
- `npm run type-check` - Verifica tipos TypeScript

## 📈 Métricas de Sucesso

### Para Clientes
- **Aumento de margem**: 15-30% nos primeiros 6 meses
- **Redução de rupturas**: 90% menos rupturas de estoque
- **Economia de tempo**: 20+ horas semanais em relatórios manuais
- **Visibilidade financeira**: Fluxo de caixa projetado para 90 dias

### Para o Negócio
- **Revenue Growth**: 20% MoM ARR growth
- **Market Share**: 5% of e-commerce management market in 24 meses
- **Customer Success**: 15-30% margin increase for clients in 6 meses
- **Retention**: <5% monthly churn rate

## 🎯 Roadmap

### Phase 1: Foundation (6 meses)
- Bling integration and basic dashboards
- User authentication and management
- Core BI functionality

### Phase 2: Intelligence (3 meses)
- WhatsApp Business API integration
- Automated alert system
- Basic conversational queries

### Phase 3: Automation (3 meses)
- Integrated task management
- Stock prediction and suggestions
- Advanced financial module

### Phase 4: Scale (6 meses)
- Chrome extension
- Predictive AI features
- Additional integrations

## 📄 Documentação

- [PRD Completo](docs/prd.md)
- [Fluxos da Aplicação](.augment/rules/APP-FLOW.md)
- [Briefing de Marketing](.augment/rules/briefing-marketing.mdc)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

ECOMMIND Team - [contato@ecommind.com.br](mailto:contato@ecommind.com.br)

Project Link: [https://github.com/felipeklug/ECOMMIND](https://github.com/felipeklug/ECOMMIND)
