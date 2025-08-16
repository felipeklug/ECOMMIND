# 🔒 ECOMMIND - Política de Segurança

## ⚠️ ALERTA IMPORTANTE

**NUNCA COMMITE CREDENCIAIS REAIS NO REPOSITÓRIO!**

Este projeto contém integrações com APIs sensíveis. Siga rigorosamente as práticas de segurança.

## 🛡️ Configuração Segura

### 1. Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Configure suas credenciais reais
# NUNCA commite o .env.local
```

### 2. Credenciais Protegidas

- ✅ `.env.local` está no `.gitignore`
- ✅ Validação de credenciais placeholder
- ✅ Logs de erro sem exposição de dados
- ✅ Criptografia de dados sensíveis

### 3. APIs Integradas

- **Bling ERP**: OAuth2 com Client ID/Secret
- **WhatsApp Business**: Access Token
- **Supabase**: URL e Anon Key
- **Marketplaces**: Credenciais específicas

## 🚨 Incidentes de Segurança

Se você encontrar vulnerabilidades:

1. **NÃO** abra issues públicas
2. Entre em contato: security@ecommind.com
3. Aguarde resposta antes de divulgar

## 📋 Checklist de Segurança

### Desenvolvimento:
- [ ] `.env.local` configurado
- [ ] Credenciais não commitadas
- [ ] HTTPS em produção
- [ ] Validação de entrada
- [ ] Rate limiting implementado

### Deploy:
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/TLS ativo
- [ ] Logs de segurança ativos
- [ ] Backup de dados
- [ ] Monitoramento de acesso

## 🔐 Boas Práticas

1. **Rotação de Credenciais**: Mude periodicamente
2. **Princípio do Menor Privilégio**: Acesso mínimo necessário
3. **Auditoria**: Monitore acessos e mudanças
4. **Backup Seguro**: Dados criptografados
5. **Atualizações**: Mantenha dependências atualizadas

## 📞 Contato

- **Email**: security@ecommind.com
- **Emergência**: +55 11 9999-9999

---

**Lembre-se**: A segurança é responsabilidade de todos!
