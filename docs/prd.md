# PRD: ECOMMIND - Plataforma de Gestão Inteligente para E-commerce

## 1. Executive summary

### 1.1 Document information
- **PRD Title**: ECOMMIND - Plataforma de Gestão Inteligente para E-commerce
- **Version**: 1.0.0
- **Last Updated**: 14 de Janeiro de 2025
- **Author**: Product Management Team
- **Status**: Draft

### 1.2 Project overview
O ECOMMIND é uma plataforma completa de gestão, análise e automação para operações de e-commerce multicanal que transforma o WhatsApp no centro de comando do negócio, unindo BI em tempo real, gestão de equipe e alertas inteligentes numa experiência conversacional.

### 1.3 Business justification
Empreendedores de e-commerce multicanal enfrentam fragmentação de dados em dezenas de sistemas, resultando em decisões baseadas em "achismo" e perda de oportunidades de lucro. O ECOMMIND resolve este problema centralizando todos os dados operacionais e financeiros numa única plataforma com interface conversacional via WhatsApp.

### 1.4 Success definition
Aumentar a margem líquida dos clientes em 15-30% nos primeiros 6 meses, reduzir rupturas de estoque em 90%, economizar 20+ horas semanais em relatórios manuais e proporcionar visibilidade completa de fluxo de caixa projetado para 90 dias.

## 2. Market & user research

### 2.1 Problem statement
Empreendedores de e-commerce multicanal com faturamento entre R$ 100k-5M mensais não conseguem ter visão unificada e em tempo real de vendas, margens, estoque e fluxo de caixa across todos os canais. Isso resulta em decisões tardias, rupturas de estoque, margens corroídas e perda de oportunidades de crescimento.

### 2.2 Market analysis
- **Market size**: E-commerce brasileiro movimentou R$ 185 bilhões em 2024, com 41% das vendas em marketplaces
- **Competitive landscape**: Ferramentas fragmentadas (Bling, Google Analytics, Trello, WhatsApp Business) sem integração
- **Market opportunity**: Crescimento de 12% ao ano no e-commerce, com demanda crescente por gestão unificada multicanal

### 2.3 User research insights
- **Primary research**: 87% dos gestores passam 60% do tempo "apagando incêndios" ao invés de planejando
- **Secondary research**: 73% não sabem a margem real por produto, 68% descobrem rupturas tarde demais
- **Key findings**: WhatsApp é a ferramenta mais usada para comunicação empresarial (94% dos gestores)

## 3. Strategic alignment

### 3.1 Business goals
- Capturar 5% do mercado de gestão de e-commerce em 24 meses
- Atingir R$ 10M ARR até final de 2026
- Reduzir churn para menos de 5% ao mês
- Estabelecer ECOMMIND como líder em gestão conversacional de e-commerce

### 3.2 User goals
- Ter controle total e visibilidade em tempo real de toda operação
- Aumentar margem líquida em pelo menos 15%
- Reduzir tempo gasto com relatórios manuais em 80%
- Eliminar rupturas de estoque dos produtos top 20
- Integrar gestão financeira com operacional

### 3.3 Non-goals
- Não será um ERP completo para grandes empresas
- Não substituirá sistemas de pagamento ou logística
- Não oferecerá criação de lojas virtuais
- Não será uma ferramenta de marketing digital

### 3.4 Assumptions & dependencies
- **Assumptions**: Usuários têm WhatsApp Business, usam Bling como ERP, vendem em múltiplos canais
- **Dependencies**: APIs dos marketplaces (ML, Shopee, Amazon), integração Bling, infraestrutura WhatsApp Business

## 4. User analysis

### 4.1 Target personas

**Primary Persona - Gestor de E-commerce Multicanal**:
- **Demographics**: 28-45 anos, ensino superior, 3-8 anos experiência e-commerce
- **Motivations**: Crescer o negócio de forma sustentável e profissional
- **Pain points**: Falta de visão unificada, decisões baseadas em achismo, rupturas frequentes
- **Goals**: Controle total da operação, aumento de margem, profissionalização
- **Behaviors**: Usa WhatsApp intensivamente, consulta dados múltiplas vezes ao dia

**Secondary Personas**:
- **Analista de E-commerce**: Responsável por relatórios e análises
- **Coordenador de Estoque**: Gerencia reposição e rupturas
- **Assistente Financeiro**: Controla fluxo de caixa e recebíveis

### 4.2 User journey mapping
- **Current state**: Consulta múltiplas ferramentas, cria relatórios manuais, descobre problemas tarde
- **Future state**: Recebe alertas automáticos no WhatsApp, consulta dados conversacionalmente, age proativamente
- **Key touchpoints**: Login matinal, consultas durante o dia, alertas críticos, planejamento semanal
- **Pain points**: Perda de tempo, informações desatualizadas, falta de contexto para ação

### 4.3 Access & permissions
- **Owner/Admin**: Acesso total a todos os módulos e configurações
- **Manager**: Acesso a BI, alertas e gestão de tarefas (sem configurações financeiras)
- **Analyst**: Acesso apenas a relatórios e consultas via WhatsApp
- **Guest users**: Não aplicável - sistema B2B com autenticação obrigatória

## 5. Functional requirements

### 5.1 Core features (Must Have)

**BI Analítico e Operacional** (Priority: Critical)
- Cálculo automático de margem líquida por pedido/SKU considerando CMV, taxas, frete e descontos
- Metas por canal e SKU com acompanhamento de % atingido e projeções
- Monitoramento de estoque com previsão de cobertura (7/14/30/90 dias)
- Análise de cobertura de catálogo cruzando publicação, vendas e estoque

**Alertas Automáticos via WhatsApp** (Priority: Critical)
- Regras configuráveis para venda abaixo do preço mínimo, margem baixa, ruptura iminente
- Envio contextualizado com ação sugerida
- Criação de tarefas diretamente do alerta

**Interface Conversacional WhatsApp** (Priority: Critical)
- Consultas em linguagem natural sobre vendas, estoque, fluxo de caixa
- Criação e acompanhamento de tarefas por comando
- Integração bidirecional com todos os módulos

### 5.2 Enhanced features (Should Have)

**Gestão de Tarefas Integrada** (Priority: High)
- Kanban interno (To Do, Doing, Done) vinculado a SKUs e canais
- Calendário comercial pré-carregado com eventos do varejo
- Integração entre calendário, tarefas e insights do BI

**Módulo Financeiro Avançado** (Priority: High)
- Fluxo de caixa projetado cruzando entradas por canal e saídas por fornecedor
- Alertas de saldo negativo e contas críticas
- Integração completa com contas a pagar/receber do Bling

### 5.3 Future considerations (Could Have)

**Extensão Chrome** (Priority: Medium)
- Cálculo de margem e ROI nas páginas dos marketplaces
- Simulação de preços e comparação com concorrentes
- Integração para salvar dados direto no ECOMMIND

**IA Preditiva** (Priority: Low)
- Previsão de demanda baseada em histórico e sazonalidade
- Sugestões automáticas de preços para maximizar margem
- Detecção de anomalias em padrões de venda

### 5.4 Cross-cutting requirements
- **Accessibility**: Interface web WCAG 2.1 AA, WhatsApp naturalmente acessível
- **Internationalization**: Português brasileiro inicialmente, expansão futura para espanhol
- **SEO**: Landing pages otimizadas para "gestão e-commerce", "BI e-commerce"
- **Analytics**: Tracking completo de uso, engajamento WhatsApp, conversão de alertas em ações

## 6. User experience design

### 6.1 Design principles
- **Conversational First**: WhatsApp como interface principal, web como suporte
- **Actionable Intelligence**: Cada insight deve gerar ação clara e imediata
- **Zero Learning Curve**: Usar padrões familiares do WhatsApp e interfaces web simples
- **Mobile-First**: Otimizado para uso em smartphones durante o dia

### 6.2 Key user flows

**Consulta Matinal via WhatsApp**:
- **Entry points**: Mensagem "Bom dia" ou "Como estão as vendas hoje?"
- **Happy path**: Recebe resumo de vendas, alertas críticos, tarefas pendentes
- **Alternative paths**: Consulta específica por canal, produto ou período
- **Error handling**: Mensagem clara se dados não disponíveis, sugestão de ação

**Gestão de Alertas Críticos**:
- **Entry points**: Alerta automático enviado pelo sistema
- **Happy path**: Recebe contexto, analisa situação, cria tarefa ou toma ação
- **Alternative paths**: Solicita mais detalhes, agenda para depois, delega para equipe
- **Error handling**: Opção de desativar alerta específico, ajustar sensibilidade

**Planejamento Semanal**:
- **Entry points**: Acesso ao dashboard web ou comando WhatsApp
- **Happy path**: Analisa performance, define metas, cria tarefas estratégicas
- **Alternative paths**: Foco em canal específico, análise de produto, revisão financeira
- **Error handling**: Dados incompletos mostram o que está disponível

### 6.3 Responsive design requirements
- **Mobile-first**: Interface web otimizada para tablets e smartphones
- **Tablet considerations**: Dashboards adaptados para visualização em reuniões
- **Desktop enhancements**: Múltiplas telas, análises detalhadas, configurações avançadas

### 6.4 Interface requirements
- **Navigation**: Menu lateral colapsável, breadcrumbs, busca global
- **Information architecture**: Módulos separados (BI, Tarefas, Financeiro, Configurações)
- **Visual design**: Clean, cores do WhatsApp (verde), gráficos claros e objetivos
- **Accessibility**: Alto contraste, navegação por teclado, textos alternativos

## 7. Technical specifications

### 7.1 System architecture
- **Frontend requirements**: Next.js 15 com App Router, TypeScript, Tailwind CSS, Shadcn UI
- **Backend requirements**: Node.js, API REST, WebSockets para real-time, Queue system
- **Third-party integrations**: WhatsApp Business API, Bling API, Marketplace APIs (ML, Shopee, Amazon)

### 7.2 Data requirements
- **Data models**: Users, Companies, Products, Orders, Channels, Tasks, Alerts, Financial Records
- **Data sources**: Bling ERP, Marketplace APIs, WhatsApp Business, manual inputs
- **Data storage**: PostgreSQL principal, Redis para cache, S3 para arquivos
- **Data privacy**: LGPD compliance, criptografia de dados sensíveis, logs de auditoria

### 7.3 Performance requirements
- **Speed**: Consultas WhatsApp < 3s, dashboards web < 2s, alertas em tempo real
- **Scalability**: Suporte a 10.000+ usuários simultâneos, 1M+ pedidos/mês por cliente
- **Availability**: 99.9% uptime, backup automático, disaster recovery
- **Browser support**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+

### 7.4 Security & compliance
- **Authentication**: OAuth 2.0, MFA obrigatório para admins, sessões seguras
- **Authorization**: RBAC (Role-Based Access Control), permissões granulares
- **Data protection**: Criptografia AES-256, HTTPS obrigatório, tokenização de dados sensíveis
- **Compliance**: LGPD, SOC 2 Type II, ISO 27001 (roadmap)

## 8. Success metrics & analytics

### 8.1 Key performance indicators (KPIs)
- **Business metrics**: ARR growth 20% MoM, churn < 5%, NPS > 50, CAC payback < 6 meses
- **User metrics**: DAU/MAU > 60%, alertas atendidos > 80%, consultas WhatsApp > 10/dia
- **Technical metrics**: Uptime > 99.9%, response time < 2s, error rate < 0.1%

### 8.2 Success criteria
- **Launch criteria**: 100 beta users, 95% feature completeness, < 5 critical bugs
- **Success thresholds**: 15% aumento margem líquida, 90% redução rupturas, 20h economia semanal
- **Stretch goals**: 30% aumento margem, 95% redução rupturas, 30h economia semanal

### 8.3 Measurement plan
- **Analytics implementation**: Mixpanel para eventos, Google Analytics para web, custom tracking WhatsApp
- **A/B testing**: Diferentes formatos de alerta, frequência de notificações, layouts dashboard
- **User feedback**: NPS trimestral, entrevistas mensais, feedback in-app

## 9. Risk assessment & mitigation

### 9.1 Technical risks
- **WhatsApp API limitations**: Impacto Alto, Probabilidade Média
  - Mitigation: Desenvolver fallbacks via SMS/email, diversificar canais de comunicação
- **Marketplace API instability**: Impacto Médio, Probabilidade Alta
  - Mitigation: Cache inteligente, retry logic, múltiplas fontes de dados
- **Scalability bottlenecks**: Impacto Alto, Probabilidade Baixa
  - Mitigation: Arquitetura microserviços, load testing, auto-scaling

### 9.2 Business risks
- **Competitor with similar solution**: Impacto Alto, Probabilidade Média
  - Mitigation: Foco em diferenciação (WhatsApp), velocidade de desenvolvimento, parcerias
- **Market adoption slower than expected**: Impacto Alto, Probabilidade Baixa
  - Mitigation: Programa de early adopters, pricing flexível, marketing educativo
- **Regulatory changes (LGPD)**: Impacto Médio, Probabilidade Baixa
  - Mitigation: Compliance by design, consultoria jurídica, privacy by default

### 9.3 User experience risks
- **WhatsApp fatigue**: Impacto Médio, Probabilidade Média
  - Mitigation: Controles granulares de notificação, IA para relevância, múltiplos canais
- **Learning curve too steep**: Impacto Alto, Probabilidade Baixa
  - Mitigation: Onboarding guiado, documentação clara, suporte proativo

### 9.4 Contingency planning
- **Rollback plan**: Blue-green deployment, feature flags, database rollback procedures
- **Alternative approaches**: Interface web standalone, integração Telegram, API pública
- **Crisis communication**: Status page, comunicação proativa, SLA transparente

## 10. Implementation roadmap

### 10.1 Project timeline
- **Total duration**: 18 meses para versão completa
- **Key milestones**: MVP (6 meses), Beta (9 meses), GA (12 meses), Scale (18 meses)
- **Critical path**: Integração Bling → WhatsApp API → BI Core → Alertas → Gestão Tarefas

### 10.2 Development phases

**Phase 1: Foundation** (6 meses)
- Integração Bling para extração de dados básicos
- Interface web com dashboards essenciais de vendas e margem
- Autenticação e gestão de usuários
- **Key deliverables**: MVP funcional, 50 beta users, métricas básicas
- **Success criteria**: Dados sincronizados, dashboards responsivos, login seguro

**Phase 2: Intelligence** (3 meses)
- WhatsApp Business API integration
- Sistema de alertas configuráveis
- Consultas conversacionais básicas
- **Key deliverables**: Alertas funcionais, 200 beta users, feedback positivo
- **Success criteria**: Alertas em tempo real, 80% taxa de resposta WhatsApp

**Phase 3: Automation** (3 meses)
- Gestão de tarefas integrada com BI
- Previsão de estoque e sugestões de reposição
- Módulo financeiro com fluxo de caixa projetado
- **Key deliverables**: Plataforma completa, 500 usuários pagos, ROI comprovado
- **Success criteria**: Tarefas automatizadas, previsões precisas, satisfação > 4.5/5

**Phase 4: Scale** (6 meses)
- Extensão Chrome para marketplaces
- IA preditiva e otimização automática
- Integrações adicionais (Shopify, WooCommerce)
- **Key deliverables**: 2000+ usuários, expansão mercado, parcerias
- **Success criteria**: Crescimento 20% MoM, churn < 5%, NPS > 50

### 10.3 Resource requirements
- **Team composition**: 2 Frontend, 2 Backend, 1 DevOps, 1 Product, 1 Designer, 1 QA
- **Skill requirements**: Next.js, Node.js, PostgreSQL, WhatsApp API, AWS/GCP
- **External dependencies**: WhatsApp Business Partner, consultoria LGPD, infraestrutura cloud

### 10.4 Testing strategy
- **Unit testing**: 90% coverage, TDD para lógica crítica, automated testing pipeline
- **Integration testing**: APIs externas, fluxos end-to-end, performance testing
- **User acceptance testing**: Beta users, cenários reais, feedback contínuo
- **Performance testing**: Load testing 10x capacity, stress testing, monitoring

## 11. Launch & post-launch

### 11.1 Launch strategy
- **Rollout plan**: Soft launch com 100 beta users → Public beta 500 users → GA 2000+ users
- **User communication**: Email marketing, webinars, content marketing, parcerias
- **Training needs**: Onboarding interativo, documentação, vídeos tutoriais, suporte chat

### 11.2 Monitoring & support
- **Performance monitoring**: APM tools, real-time dashboards, alertas automáticos
- **User feedback collection**: In-app feedback, NPS surveys, user interviews
- **Support documentation**: Knowledge base, FAQs, troubleshooting guides

### 11.3 Iteration planning
- **Feedback analysis**: Weekly review, priorização baseada em impacto/esforço
- **Improvement priorities**: Performance, novos alertas, integrações adicionais
- **Next version planning**: Roadmap trimestral, feedback stakeholders, market research

## 12. User stories & acceptance criteria

### 12.1. Configuração inicial da conta

- **ID**: US-001
- **Epic**: Onboarding
- **Persona**: Gestor de E-commerce
- **Priority**: High
- **Story**: Como gestor de e-commerce, quero conectar minha conta Bling ao ECOMMIND para centralizar todos os dados da minha operação.
- **Business value**: Permite sincronização automática de dados, eliminando trabalho manual
- **Acceptance criteria**:
  - Dado que tenho uma conta Bling ativa, quando insiro minhas credenciais, então o sistema conecta e importa dados básicos
  - Dado que a conexão foi estabelecida, quando acesso o dashboard, então vejo vendas dos últimos 30 dias
  - Dado que há erro na conexão, quando tento conectar, então recebo mensagem clara sobre o problema
- **Definition of done**:
  - Integração Bling funcional e testada
  - Dashboard mostra dados reais do usuário
  - Tratamento de erros implementado
  - Documentação de setup criada
- **Dependencies**: API Bling configurada, sistema de autenticação
- **Test scenarios**: Conexão bem-sucedida, credenciais inválidas, API Bling indisponível

### 12.2. Consulta de vendas via WhatsApp

- **ID**: US-002
- **Epic**: Interface Conversacional
- **Persona**: Gestor de E-commerce
- **Priority**: High
- **Story**: Como gestor de e-commerce, quero consultar minhas vendas do dia via WhatsApp para ter informações rápidas sem abrir o computador.
- **Business value**: Acesso instantâneo a dados críticos, aumenta frequência de monitoramento
- **Acceptance criteria**:
  - Dado que envio "vendas hoje" no WhatsApp, quando o sistema processa, então recebo resumo das vendas do dia
  - Dado que pergunto sobre canal específico, quando especifico "vendas ML hoje", então recebo dados apenas do Mercado Livre
  - Dado que não há vendas no período, quando consulto, então recebo mensagem informativa
- **Definition of done**:
  - WhatsApp Business API integrado
  - Processamento de linguagem natural básico
  - Respostas formatadas e claras
  - Logs de interação para análise
- **Dependencies**: WhatsApp Business API, dados de vendas sincronizados
- **Test scenarios**: Consulta simples, consulta por canal, período sem vendas, comando inválido

### 12.3. Alerta de ruptura de estoque

- **ID**: US-003
- **Epic**: Alertas Automáticos
- **Persona**: Gestor de E-commerce
- **Priority**: Critical
- **Story**: Como gestor de e-commerce, quero receber alerta no WhatsApp quando um produto do meu top 20 estiver próximo da ruptura para evitar perda de vendas.
- **Business value**: Prevenção de rupturas, manutenção de vendas, gestão proativa
- **Acceptance criteria**:
  - Dado que um produto top 20 tem estoque para menos de 7 dias, quando o sistema detecta, então envio alerta no WhatsApp
  - Dado que recebo o alerta, quando respondo "criar tarefa", então uma tarefa de reposição é criada
  - Dado que o estoque é reposto, quando atualizo no Bling, então o alerta é automaticamente resolvido
- **Definition of done**:
  - Sistema de alertas configurável
  - Integração WhatsApp para envio
  - Criação de tarefas via comando
  - Resolução automática de alertas
- **Dependencies**: Dados de estoque atualizados, sistema de tarefas, WhatsApp API
- **Test scenarios**: Ruptura detectada, criação de tarefa, resolução automática, múltiplos alertas

### 12.4. Dashboard de margem por produto

- **ID**: US-004
- **Epic**: BI Analítico
- **Persona**: Gestor de E-commerce
- **Priority**: High
- **Story**: Como gestor de e-commerce, quero visualizar a margem líquida real de cada produto considerando todos os custos para identificar quais são mais lucrativos.
- **Business value**: Otimização de mix de produtos, decisões baseadas em lucratividade real
- **Acceptance criteria**:
  - Dado que acesso o dashboard de produtos, quando visualizo a lista, então vejo margem líquida calculada com CMV, taxas e frete
  - Dado que clico em um produto, quando abro detalhes, então vejo breakdown completo dos custos
  - Dado que filtro por canal, quando seleciono Mercado Livre, então vejo margens específicas deste canal
- **Definition of done**:
  - Cálculo preciso de margem implementado
  - Interface responsiva e intuitiva
  - Filtros funcionais por canal/período
  - Exportação de dados disponível
- **Dependencies**: Dados de custos configurados, integração canais de venda
- **Test scenarios**: Visualização geral, detalhes por produto, filtros por canal, exportação

### 12.5. Gestão de tarefas integrada

- **ID**: US-005
- **Epic**: Gestão de Tarefas
- **Persona**: Gestor de E-commerce
- **Priority**: Medium
- **Story**: Como gestor de e-commerce, quero criar e acompanhar tarefas vinculadas a produtos e insights para organizar minha equipe e garantir execução.
- **Business value**: Organização da equipe, execução de insights, accountability
- **Acceptance criteria**:
  - Dado que estou no dashboard, quando clico "criar tarefa", então posso vincular a SKU específico e definir responsável
  - Dado que uma tarefa é criada via WhatsApp, quando confirmo, então ela aparece no Kanban da equipe
  - Dado que uma tarefa é concluída, quando marco como done, então recebo confirmação no WhatsApp
- **Definition of done**:
  - Kanban funcional com drag-and-drop
  - Vinculação de tarefas a SKUs/canais
  - Notificações WhatsApp para updates
  - Histórico de tarefas por usuário
- **Dependencies**: Sistema de usuários, WhatsApp API, dados de produtos
- **Test scenarios**: Criação manual, criação via WhatsApp, conclusão, vinculação SKU

### 12.6. Fluxo de caixa projetado

- **ID**: US-006
- **Epic**: Módulo Financeiro
- **Persona**: Gestor de E-commerce
- **Priority**: High
- **Story**: Como gestor de e-commerce, quero visualizar meu fluxo de caixa projetado para os próximos 90 dias para planejar compras e investimentos.
- **Business value**: Planejamento financeiro, prevenção de problemas de caixa, decisões estratégicas
- **Acceptance criteria**:
  - Dado que acesso o módulo financeiro, quando visualizo projeção, então vejo entradas por canal e saídas por fornecedor
  - Dado que há previsão de saldo negativo, quando o sistema detecta, então recebo alerta no WhatsApp
  - Dado que consulto via WhatsApp, quando pergunto "saldo próximos 7 dias", então recebo projeção resumida
- **Definition of done**:
  - Cálculo preciso baseado em recebíveis e pagamentos
  - Visualização gráfica clara e intuitiva
  - Alertas automáticos para saldo negativo
  - Consultas via WhatsApp funcionais
- **Dependencies**: Integração Bling financeiro, dados de recebíveis atualizados
- **Test scenarios**: Projeção positiva, alerta saldo negativo, consulta WhatsApp, diferentes períodos