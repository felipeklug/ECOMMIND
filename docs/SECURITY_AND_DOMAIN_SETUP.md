# 🔒 Segurança e Configuração de Domínio

## ⚠️ ALERTA DE SEGURANÇA

**NUNCA EXPONHA CREDENCIAIS NO CÓDIGO!** As credenciais do Bling foram removidas do código por segurança.

## 🌐 Configuração de Domínio (.com.br)

### Por que precisa de um domínio?

O Bling exige URLs HTTPS válidas para integração em produção. Localhost só funciona para desenvolvimento.

### Opções de Domínio

#### 1. **Registro de Domínio .com.br**
- **Registro.br**: Site oficial para domínios .com.br
- **Custo**: ~R$ 40/ano
- **Processo**: 
  - Escolha o domínio (ex: `ecommind.com.br`)
  - Registre através de um provedor autorizado
  - Configure DNS

#### 2. **Alternativas Temporárias**
- **Vercel**: `seuapp.vercel.app` (gratuito)
- **Netlify**: `seuapp.netlify.app` (gratuito)
- **Heroku**: `seuapp.herokuapp.com` (gratuito)

## 🚀 Deploy e Configuração

### 1. **Deploy na Vercel (Recomendado)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar domínio customizado (opcional)
vercel domains add ecommind.com.br
```

### 2. **Configurar Variáveis de Ambiente na Vercel**

No painel da Vercel:
1. Vá em "Settings" > "Environment Variables"
2. Adicione cada variável do `.env.example`
3. **NUNCA** use as credenciais reais em repositórios públicos

### 3. **URLs para Configurar no Bling**

**Desenvolvimento**:
```
http://localhost:3002/api/integrations/bling/callback
```

**Produção (Vercel)**:
```
https://seuapp.vercel.app/api/integrations/bling/callback
```

**Produção (Domínio Próprio)**:
```
https://ecommind.com.br/api/integrations/bling/callback
```

## 🔐 Configuração Segura das Credenciais

### 1. **Arquivo .env.local (Local)**

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite com suas credenciais reais
nano .env.local
```

### 2. **Obter Credenciais do Bling**

1. Acesse: `https://developer.bling.com.br`
2. Crie/edite seu aplicativo
3. Configure:
   - **Nome**: ECOMMIND
   - **Link de redirecionamento**: Sua URL de produção
   - **Escopos**: Produtos, Pedidos, Estoque, etc.
4. Copie `Client ID` e `Client Secret`

### 3. **Configurar no Servidor de Produção**

**Vercel**:
```bash
vercel env add BLING_CLIENT_ID
vercel env add BLING_CLIENT_SECRET
```

**Outros provedores**: Use o painel de controle para adicionar variáveis de ambiente.

## 🛡️ Boas Práticas de Segurança

### ✅ **FAÇA**
- Use HTTPS em produção
- Mantenha credenciais em variáveis de ambiente
- Use chaves de criptografia fortes
- Monitore logs de acesso
- Implemente rate limiting
- Use autenticação de dois fatores

### ❌ **NÃO FAÇA**
- Commitar credenciais no Git
- Usar HTTP em produção
- Compartilhar credenciais por email/chat
- Usar senhas fracas
- Expor APIs sem autenticação

## 📋 Checklist de Deploy

### Antes do Deploy:
- [ ] Domínio registrado e configurado
- [ ] SSL/TLS configurado (HTTPS)
- [ ] Variáveis de ambiente configuradas
- [ ] Credenciais do Bling obtidas
- [ ] Banco de dados configurado

### Configurar no Bling:
- [ ] Aplicativo criado em developer.bling.com.br
- [ ] Link de redirecionamento atualizado para produção
- [ ] Escopos necessários selecionados
- [ ] Aplicativo ativado

### Após Deploy:
- [ ] Testar integração com Bling
- [ ] Verificar logs de erro
- [ ] Monitorar performance
- [ ] Configurar backups

## 🆘 Suporte e Troubleshooting

### Problemas Comuns:

**1. "redirect_uri_mismatch"**
- Verifique se a URL no Bling está exatamente igual à de produção
- Certifique-se de usar HTTPS

**2. "invalid_client"**
- Verifique se as credenciais estão corretas
- Confirme se o aplicativo está ativo no Bling

**3. "SSL required"**
- Use HTTPS em produção
- Configure certificado SSL

### Logs e Monitoramento:
- Use ferramentas como Sentry para monitorar erros
- Configure alertas para falhas de integração
- Monitore uso de API para evitar rate limits

## 📞 Próximos Passos

1. **Registre um domínio** ou use Vercel/Netlify
2. **Configure HTTPS**
3. **Obtenha credenciais do Bling**
4. **Configure variáveis de ambiente**
5. **Teste a integração**

**Lembre-se**: Segurança é fundamental! Nunca comprometa credenciais.
