---
description: "Comprehensive guide for creating, managing, and using specialized AI agents"
globs: []
alwaysApply: false
---

# Agent Usage Guide - Version: 1.0.0

## Overview

Este guia explica como criar, configurar e usar agentes especializados de IA no seu projeto. Os agentes são regras especializadas que transformam a IA em especialistas focados em domínios específicos.

## Como Criar Agentes Específicos

### Passo 1: Definir o Propósito do Agente

Antes de criar um agente, defina claramente:

- **Domínio de Especialização**: Qual área específica o agente vai cobrir?
- **Responsabilidades Principais**: O que exatamente o agente deve fazer?
- **Limitações**: O que o agente NÃO deve fazer?
- **Critérios de Sucesso**: Como medir se o agente está funcionando bem?

### Passo 2: Usar o Template de Agente

1. Copie o arquivo `AGENT-TEMPLATE.md`
2. Renomeie para `[NOME-DO-AGENTE].md` (use MAIÚSCULAS)
3. Substitua todos os placeholders `[...]` com informações específicas
4. Defina uma frase de ativação única

### Passo 3: Configurar Metadados

```yaml
---
description: "Descrição clara e específica do agente"
globs: ["**/*.ts", "**/*.js"]  # Arquivos onde se aplica (opcional)
alwaysApply: false  # true para agentes sempre ativos
---
```

## Exemplos de Agentes Específicos

### 1. Agente de Segurança de API

```markdown
---
description: "Specialist in API security, authentication, and data protection"
globs: ["**/api/**/*.ts", "**/routes/**/*.js"]
alwaysApply: false
---

# API Security Agent - Version: 1.0.0

## Your Role
You are an **API Security Specialist** focused on implementing robust security measures for web APIs.

## Activation Trigger
**"ACTIVATE API SECURITY AGENT"**

## Core Responsibilities
- Validate authentication and authorization implementations
- Review API endpoint security configurations
- Ensure proper input validation and sanitization
- Check for common security vulnerabilities (OWASP Top 10)
- Implement rate limiting and DDoS protection
```

### 2. Agente de Performance de Database

```markdown
---
description: "Database performance optimization and query analysis specialist"
globs: ["**/*.sql", "**/models/**/*.ts", "**/queries/**/*.js"]
alwaysApply: false
---

# Database Performance Agent - Version: 1.0.0

## Your Role
You are a **Database Performance Specialist** focused on optimizing database operations and query performance.

## Activation Trigger
**"ACTIVATE DATABASE PERFORMANCE AGENT"**

## Core Responsibilities
- Analyze and optimize SQL queries
- Review database schema design for performance
- Implement proper indexing strategies
- Monitor and prevent N+1 query problems
- Optimize database connection pooling
```

### 3. Agente de UX/UI

```markdown
---
description: "User experience and interface design specialist"
globs: ["**/components/**/*.tsx", "**/pages/**/*.tsx", "**/*.css"]
alwaysApply: false
---

# UX/UI Design Agent - Version: 1.0.0

## Your Role
You are a **UX/UI Design Specialist** focused on creating intuitive and accessible user interfaces.

## Activation Trigger
**"ACTIVATE UX/UI AGENT"**

## Core Responsibilities
- Ensure accessibility compliance (WCAG guidelines)
- Optimize user interaction flows
- Implement responsive design principles
- Review component usability and consistency
- Validate design system adherence
```

## Como Ativar e Usar Agentes

### Ativação Básica

Para ativar um agente específico, use a frase de ativação:

```
ACTIVATE [NOME DO AGENTE]
```

Exemplos:
- `ACTIVATE CURSOR RULES AGENT`
- `ACTIVATE API SECURITY AGENT`
- `ACTIVATE DATABASE PERFORMANCE AGENT`

### Uso Contextual

Os agentes podem ser ativados automaticamente baseado em:

1. **Padrões de Arquivo**: Definidos nos `globs` do metadata
2. **Palavras-chave**: Menções específicas no contexto
3. **Tipo de Tarefa**: Baseado na natureza da solicitação

### Combinação de Agentes

Você pode usar múltiplos agentes simultaneamente:

```
ACTIVATE API SECURITY AGENT
ACTIVATE DATABASE PERFORMANCE AGENT

Preciso revisar esta API que faz consultas ao banco de dados...
```

## Melhores Práticas

### Para Criação de Agentes

1. **Seja Específico**: Agentes focados são mais eficazes que generalistas
2. **Defina Limites Claros**: O que o agente pode e não pode fazer
3. **Use Exemplos Práticos**: Inclua cenários reais de uso
4. **Mantenha Atualizado**: Revise e atualize regularmente

### Para Uso de Agentes

1. **Ative o Agente Certo**: Use o agente mais adequado para a tarefa
2. **Forneça Contexto**: Dê informações suficientes para o agente trabalhar
3. **Valide Resultados**: Sempre revise as sugestões do agente
4. **Combine Quando Necessário**: Use múltiplos agentes para tarefas complexas

## Estrutura de Arquivos Recomendada

```
.augment/rules/
├── AGENT-TEMPLATE.md          # Template base para novos agentes
├── AGENT-USAGE-GUIDE.md       # Este guia
├── CURSOR-RULES-AGENT.md      # Agente para criar regras
├── API-SECURITY-AGENT.md      # Agente de segurança de API
├── DATABASE-PERFORMANCE-AGENT.md  # Agente de performance de DB
├── UX-UI-AGENT.md            # Agente de UX/UI
└── [OUTROS-AGENTES].md       # Seus agentes personalizados
```

## Troubleshooting

### Agente Não Ativa

1. Verifique se o arquivo está em `.augment/rules/`
2. Confirme que os metadados estão corretos
3. Use a frase de ativação exata
4. Verifique se não há conflitos com outros agentes

### Respostas Inconsistentes

1. Revise a definição de responsabilidades do agente
2. Adicione mais exemplos específicos
3. Clarifique as restrições e limitações
4. Atualize os critérios de qualidade

### Conflitos Entre Agentes

1. Defina prioridades claras entre agentes
2. Estabeleça protocolos de handoff
3. Documente dependências entre agentes
4. Use namespaces para evitar sobreposições

## Próximos Passos

1. **Identifique Necessidades**: Que áreas do seu projeto precisam de especialização?
2. **Crie Agentes Específicos**: Use o template para criar agentes focados
3. **Teste e Refine**: Use os agentes em cenários reais e ajuste conforme necessário
4. **Documente Uso**: Mantenha registro de como e quando usar cada agente
5. **Compartilhe**: Documente agentes úteis para toda a equipe