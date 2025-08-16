---
description: "REGRA CRÍTICA: Proteção de arquivos já aprovados pelo usuário"
globs: ["**/*"]
alwaysApply: true
priority: 1000
---

# 🛡️ REGRA DE PROTEÇÃO DE ARQUIVOS APROVADOS

## ⚠️ REGRA CRÍTICA - PRIORIDADE MÁXIMA

**NUNCA ALTERE ARQUIVOS JÁ APROVADOS PELO USUÁRIO SEM AUTORIZAÇÃO EXPLÍCITA**

## 📋 ARQUIVOS PROTEGIDOS (NÃO ALTERAR):

### ✅ APROVADOS PELO USUÁRIO:
- `src/app/page.tsx` - Landing page APROVADA
- `src/app/login/page.tsx` - Página de login APROVADA  
- `src/app/register/page.tsx` - Página de registro APROVADA
- `src/components/ui/*` - Componentes Shadcn APROVADOS
- `src/app/layout.tsx` - Layout principal APROVADO

### 🚫 NUNCA ALTERE SEM PERMISSÃO:
- Páginas de autenticação (login, register)
- Landing page principal
- Componentes UI já funcionais
- Layouts aprovados
- Arquivos de configuração aprovados

## 🎯 ARQUIVOS PERMITIDOS PARA ALTERAÇÃO:

### ✅ PODE ALTERAR LIVREMENTE:
- `src/app/dashboard/**/*` - Dashboard e subpáginas
- Novos arquivos criados na sessão atual
- Arquivos explicitamente solicitados pelo usuário

## 📝 PROTOCOLO OBRIGATÓRIO:

### ANTES DE ALTERAR QUALQUER ARQUIVO:
1. **PERGUNTAR**: "Posso alterar o arquivo X?"
2. **CONFIRMAR**: Aguardar autorização explícita
3. **DOCUMENTAR**: Registrar aprovação do usuário
4. **EXECUTAR**: Só então fazer a alteração

### SE ALTERAR SEM PERMISSÃO:
1. **PARAR IMEDIATAMENTE**
2. **DESCULPAR-SE**
3. **REVERTER MUDANÇAS**
4. **PEDIR AUTORIZAÇÃO**

## 🚨 CONSEQUÊNCIAS DO NÃO CUMPRIMENTO:

- Perda de confiança do usuário
- Retrabalho desnecessário
- Frustração e perda de tempo
- Necessidade de reversão de código

## ✅ COMO IMPLEMENTAR:

### SEMPRE PERGUNTAR:
```
"Preciso alterar o arquivo [nome]. Posso prosseguir?"
"Vou modificar [lista de arquivos]. Está autorizado?"
"Para implementar [funcionalidade], preciso alterar [arquivos]. Pode?"
```

### NUNCA ASSUMIR:
- Que pode alterar qualquer arquivo
- Que melhorias são sempre bem-vindas
- Que o usuário quer mudanças globais

## 🎯 FOCO ATUAL:

**APENAS DASHBOARD É AUTORIZADO PARA ALTERAÇÕES**
- `src/app/dashboard/page.tsx` ✅
- `src/app/dashboard/**/*` ✅
- Novos componentes para dashboard ✅

**TODO O RESTO ESTÁ PROTEGIDO** 🛡️

---

**ESTA REGRA TEM PRIORIDADE MÁXIMA SOBRE TODAS AS OUTRAS**
