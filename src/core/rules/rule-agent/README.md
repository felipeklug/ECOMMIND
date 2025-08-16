# 🛡️ ECOMMIND Rule Agent - Governança de Prompts

Sistema completo de governança automática que garante que tudo que a IA gerar (código/telas/rotas) passe por 3 checagens automáticas seguindo os prompts fundamentais do ECOMMIND.

## 🎯 **OBJETIVO**

Garantir que **100% do código gerado** atenda aos padrões de qualidade enterprise:
1. **UX/UI + Branding Premium** (Prompt 1) - Nível Uber/Nubank/Netflix
2. **Arquitetura & Segurança** (Prompt 2) - Next.js App Router + TypeScript strict
3. **Integração & Workflows** (Prompt 3) - Event Bus + Missões IA

## 🚀 **USO RÁPIDO**

### **Em cada PR - Última etapa:**
```typescript
import { runRuleAgent, createFileInfo, createRouteInfo } from '@/core/rules/rule-agent';

await runRuleAgent({
  module: 'chat-360|market|planning|reports',
  files: [
    createFileInfo({
      path: 'src/features/chat/components/ChatInterface.tsx',
      type: 'component',
      content: '...' // código gerado
    })
  ],
  routes: [
    createRouteInfo({
      path: '/api/chat/messages',
      method: 'POST',
      type: 'api',
      auth: true,
      rls: true,
      validation: true
    })
  ],
  features: ['UX premium','RLS','SWR','Events','Missions','IA'],
  brandTokens: '/styles/tokens.css',
});
```

### **Resultado:**
- **🟢 PASS**: Tudo conforme, pode prosseguir
- **🟡 WARNING**: Avisos, revisar recomendações
- **🔴 FAIL**: Erros críticos, deve corrigir antes de continuar

## 🔍 **AS 3 CHECAGENS**

### **1. 🎨 BRANDING CHECK (Prompt 1)**
**Valida UX/UI + Branding Premium:**
- ✅ Tokens CSS vars (--primary, --background, etc.)
- ✅ Tipografia Inter obrigatória
- ✅ Tema Light default/Dark opt-in
- ✅ Shadcn/ui components usage
- ✅ Framer Motion para animações
- ✅ Acessibilidade AA (ARIA, keyboard nav)
- ✅ Grid 12 col, rounded-2xl, sombras suaves
- ✅ Estados loading/empty/error
- ✅ Consistência Sidebar/Header

### **2. 🏗️ ARCHITECTURE CHECK (Prompt 2)**
**Valida Estrutura & Segurança:**
- ✅ Next.js App Router (proíbe Pages Router)
- ✅ TypeScript strict (proíbe 'any')
- ✅ Estrutura de pastas padrão
- ✅ RLS (Row Level Security) em APIs
- ✅ Validação Zod obrigatória
- ✅ Rate limiting preparado
- ✅ Logs seguros sem PII
- ✅ Server Components por padrão
- ✅ Imports absolutos (@/)

### **3. 🔗 INTEGRATION CHECK (Prompt 3)**
**Valida Integração & Workflows:**
- ✅ Event Bus integration
- ✅ Missões IA integration
- ✅ API consistency patterns
- ✅ UI Kit reusability
- ✅ Workflow patterns (SWR, states)
- ✅ Module communication
- ✅ Data flow patterns

## 📊 **SISTEMA DE SCORING**

### **Pesos das Checagens:**
- **Branding**: 40% (UX é prioridade)
- **Architecture**: 40% (Segurança é crítica)
- **Integration**: 20% (Workflows são importantes)

### **Critérios de Gate:**
- **Score ≥ 90**: 🟢 PASS (Excelente)
- **Score 80-89**: 🟡 WARNING (Bom, mas pode melhorar)
- **Score < 80**: 🔴 FAIL (Deve corrigir)
- **Qualquer ERROR**: 🔴 FAIL (Bloqueante)

## 🛠️ **CONFIGURAÇÕES**

### **Presets Disponíveis:**
```typescript
import { applyPresetConfig } from '@/core/rules/rule-agent';

// Produção (rigoroso)
applyPresetConfig('strict');

// Desenvolvimento (relaxado)
applyPresetConfig('development');

// CI/CD (balanceado)
applyPresetConfig('ci');
```

### **Configuração Custom:**
```typescript
import { RuleAgent } from '@/core/rules/rule-agent';

const agent = RuleAgent.getInstance();
agent.updateConfig({
  gating: {
    enabled: true,
    failOnError: true,
    failOnWarningCount: 5
  },
  checks: {
    branding: { enabled: true, severity: 'error' },
    architecture: { enabled: true, severity: 'error' },
    integration: { enabled: true, severity: 'warning' }
  }
});
```

## 📁 **FIXTURES (Padrões)**

### **Brand Tokens** (`brand-tokens.json`)
```json
{
  "colors": {
    "primary": "oklch(0.21 0.006 285.885)",
    "background": "oklch(1 0 0)",
    "foreground": "oklch(0.141 0.005 285.823)"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif"
  },
  "borderRadius": {
    "2xl": "1rem"
  }
}
```

### **UI Kit** (`ui-kit.json`)
```json
{
  "baseComponents": [
    {
      "name": "Button",
      "path": "@/components/ui/button",
      "required": true,
      "variants": ["default", "destructive", "outline"]
    }
  ]
}
```

### **Directory Structure** (`allowed-dirs.json`)
```json
{
  "directories": [
    {
      "path": "src/app",
      "purpose": "Next.js App Router",
      "required": true,
      "rules": ["Must use App Router pattern"]
    }
  ]
}
```

### **Event Bus Contract** (`event-bus-contract.json`)
```json
{
  "events": [
    {
      "name": "chat.thread.created",
      "payload": {
        "threadId": "string",
        "companyId": "string"
      }
    }
  ]
}
```

## 📈 **REPORTERS**

### **Console Reporter**
```bash
🛡️  ECOMMIND RULE AGENT REPORT
================================================================================
📦 Module: chat-360
📊 Overall Score: 92/100
🚦 Gate Status: 🟢 PASS

📋 SUMMARY
----------------------------------------
Total Issues: 3
🔴 Errors: 0
🟡 Warnings: 2
🔵 Info: 1

🔍 CHECK RESULTS
----------------------------------------
✅ Branding & UX Premium
   Score: 95/100
   Issues: 1

✅ Architecture & Security
   Score: 90/100
   Issues: 1

✅ Integration & Workflows
   Score: 88/100
   Issues: 1

💡 RECOMMENDATIONS
----------------------------------------
1. Use Shadcn/ui components from the design system
2. Add Framer Motion for premium animations
3. Integrate with event bus for module communication
```

### **UI Notice Reporter**
Exibe banner premium na UI com:
- Status visual (🟢🟡🔴)
- Score por checagem
- Issues agrupados por severidade
- Recomendações acionáveis
- Auto-dismiss para warnings

## 🔧 **EXEMPLOS AVANÇADOS**

### **Análise de Componente:**
```typescript
const result = await runRuleAgent({
  module: 'market',
  files: [
    createFileInfo({
      path: 'src/features/market/components/calendar-view.tsx',
      type: 'component',
      content: `
        import { motion } from 'framer-motion';
        import { Card } from '@/components/ui/card';
        
        export function CalendarView() {
          return (
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-2xl">Premium Calendar</Card>
            </motion.div>
          );
        }
      `
    })
  ],
  features: ['Framer Motion', 'Responsive Grid', 'Shadcn UI']
});
```

### **Análise de API:**
```typescript
const result = await runRuleAgent({
  module: 'chat',
  files: [
    createFileInfo({
      path: 'src/app/api/chat/messages/route.ts',
      type: 'api',
      content: `
        import { z } from 'zod';
        import { validateApiAccess } from '@/app/api/_helpers/auth';
        
        const MessageSchema = z.object({
          content: z.string().min(1)
        });
        
        export async function POST(request: NextRequest) {
          const { context, error } = await validateApiAccess();
          if (error) return error;
          
          const body = MessageSchema.parse(await request.json());
          // RLS query with company_id filter
        }
      `
    })
  ],
  routes: [
    createRouteInfo({
      path: '/api/chat/messages',
      method: 'POST',
      type: 'api',
      auth: true,
      rls: true,
      validation: true
    })
  ]
});
```

## 🚀 **INTEGRAÇÃO CI/CD**

### **GitHub Actions:**
```yaml
- name: Rule Agent Check
  run: |
    npm run rule-agent:check
    if [ $? -ne 0 ]; then
      echo "❌ Rule Agent failed - blocking deployment"
      exit 1
    fi
```

### **Pre-commit Hook:**
```bash
#!/bin/sh
npm run rule-agent:check
if [ $? -ne 0 ]; then
  echo "🚨 Fix Rule Agent issues before committing"
  exit 1
fi
```

## 🎯 **BENEFÍCIOS**

### **Para Desenvolvedores:**
- ✅ Feedback imediato sobre qualidade
- ✅ Recomendações acionáveis
- ✅ Padrões consistentes automatizados
- ✅ Redução de code review time

### **Para o Projeto:**
- ✅ Qualidade enterprise garantida
- ✅ Consistência visual e técnica
- ✅ Segurança enforced automaticamente
- ✅ Integração entre módulos validada

### **Para CI/CD:**
- ✅ Gate automático para deploy
- ✅ Métricas de qualidade trackáveis
- ✅ Bloqueio de código não-conforme
- ✅ Reports estruturados para análise

---

**🛡️ Rule Agent: Garantindo qualidade enterprise em cada linha de código!** 🚀
