# 🚀 Guia de Deploy na Vercel - ECOMMIND

## 📋 **Passo a Passo Completo**

### **Passo 1: Acesse a Vercel**
1. Vá para: `https://vercel.com`
2. Clique em "Sign Up" ou "Login"
3. **Conecte com GitHub** (recomendado)

### **Passo 2: Importe o Projeto**
1. No dashboard da Vercel, clique em **"New Project"**
2. Selecione **"Import Git Repository"**
3. Encontre o repositório **"ECOMMIND"**
4. Clique em **"Import"**

### **Passo 3: Configurar o Deploy**
1. **Framework Preset**: Next.js (detectado automaticamente)
2. **Root Directory**: `.` (raiz do projeto)
3. **Build Command**: `npm run build` (padrão)
4. **Output Directory**: `.next` (padrão)
5. **Install Command**: `npm install` (padrão)

### **Passo 4: Configurar Variáveis de Ambiente**
**MUITO IMPORTANTE**: Configure estas variáveis antes do deploy:

#### **Variáveis Obrigatórias**:

```env
# Supabase (suas credenciais reais)
NEXT_PUBLIC_SUPABASE_URL=https://elpffiuadqkkkpiabmpm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Bling (suas credenciais reais)
BLING_CLIENT_ID=a0fe56889eb99f8c58b81125f22c11dd35a876ab
BLING_CLIENT_SECRET=5af665b3de36c706074f90091c2800c18a67bdaaaec2f8b3791554baaa05

# NextAuth (gere uma chave segura)
NEXTAUTH_SECRET=sua_chave_secreta_aqui_32_caracteres_minimo

# Encryption (gere uma chave de 32 caracteres)
ENCRYPTION_KEY=sua_chave_de_criptografia_32_chars

# URLs (será preenchido automaticamente)
NEXTAUTH_URL=https://seuapp.vercel.app
```

#### **Como Adicionar na Vercel**:
1. Na tela de configuração do projeto, vá em **"Environment Variables"**
2. Adicione cada variável:
   - **Name**: Nome da variável (ex: `BLING_CLIENT_ID`)
   - **Value**: Valor da variável
   - **Environment**: Selecione "Production", "Preview" e "Development"
3. Clique em **"Add"** para cada variável

### **Passo 5: Deploy**
1. Após configurar as variáveis, clique em **"Deploy"**
2. Aguarde o build (pode levar 2-5 minutos)
3. ✅ **Deploy concluído!**

### **Passo 6: Obter a URL**
Após o deploy, você receberá uma URL como:
```
https://ecommind-xyz123.vercel.app
```

### **Passo 7: Configurar no Bling**
1. Acesse: `https://developer.bling.com.br`
2. Edite seu aplicativo
3. **Link de redirecionamento**: 
   ```
   https://sua-url-vercel.vercel.app/api/integrations/bling/callback
   ```
4. Salve as configurações

### **Passo 8: Testar a Integração**
1. Acesse: `https://sua-url-vercel.vercel.app/integrations/bling`
2. Clique em **"Conectar Bling Agora"**
3. Deve redirecionar para o Bling
4. Autorize a integração
5. ✅ **Sucesso!**

## 🔧 **Comandos Úteis**

### **Deploy via CLI (Opcional)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar domínio customizado
vercel domains add ecommind.com.br
```

### **Configurar Variáveis via CLI**
```bash
vercel env add BLING_CLIENT_ID
vercel env add BLING_CLIENT_SECRET
vercel env add NEXTAUTH_SECRET
```

## 🌐 **Domínio Customizado (Opcional)**

### **Opção 1: Subdomínio Vercel**
- Gratuito
- URL: `ecommind.vercel.app`
- Configure em: Project Settings > Domains

### **Opção 2: Domínio Próprio**
1. **Registre**: `ecommind.com.br`
2. **Configure DNS**: Aponte para Vercel
3. **Adicione na Vercel**: Project Settings > Domains
4. **Atualize no Bling**: Nova URL de callback

## 🔍 **Troubleshooting**

### **Build Failed**
- Verifique se todas as dependências estão no `package.json`
- Confirme se não há erros de TypeScript
- Veja os logs de build na Vercel

### **Environment Variables**
- Certifique-se de que todas as variáveis estão configuradas
- Verifique se não há espaços extras nos valores
- Redeploy após adicionar variáveis

### **Bling Integration**
- Confirme se a URL de callback está correta no Bling
- Verifique se as credenciais estão corretas
- Teste em modo de desenvolvimento primeiro

## 📊 **Monitoramento**

### **Logs da Vercel**
- Acesse: Project > Functions
- Veja logs em tempo real
- Monitore erros de API

### **Analytics**
- Ative Vercel Analytics
- Monitore performance
- Acompanhe uso de recursos

## 🔒 **Segurança em Produção**

### **Checklist**:
- [ ] HTTPS ativo (automático na Vercel)
- [ ] Variáveis de ambiente configuradas
- [ ] Credenciais não expostas no código
- [ ] Rate limiting implementado
- [ ] Logs de segurança ativos

## 📞 **Suporte**

### **Problemas com Deploy**:
- Documentação Vercel: `https://vercel.com/docs`
- Suporte Vercel: `https://vercel.com/support`

### **Problemas com Bling**:
- Documentação: `https://developer.bling.com.br`
- Suporte: Através do painel do Bling

---

**🎉 Parabéns! Seu ECOMMIND está no ar!**
