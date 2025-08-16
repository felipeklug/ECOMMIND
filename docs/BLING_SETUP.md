# Configuração da Integração Bling

## 📋 Pré-requisitos

1. Conta no Bling ERP
2. Acesso ao painel de desenvolvedor: `developer.bling.com.br`
3. Credenciais já configuradas no projeto

## 🔧 Configuração no Painel do Bling

### 1. Acesse o Painel de Desenvolvedor
- Vá para: `https://developer.bling.com.br`
- Faça login com sua conta do Bling

### 2. Crie/Edite seu Aplicativo
- Clique em "Meus Aplicativos" ou "Criar Aplicativo"
- Preencha as informações básicas:
  - **Nome**: ECOMMIND
  - **Descrição**: Sistema de gestão inteligente para e-commerce
  - **Homepage**: `http://localhost:3002` (desenvolvimento)

### 3. Configure o Link de Redirecionamento
**MUITO IMPORTANTE**: O link deve ser exatamente:

**Desenvolvimento**:
```
http://localhost:3002/api/integrations/bling/callback
```

**Produção** (quando for fazer deploy):
```
https://seudominio.com/api/integrations/bling/callback
```

### 4. Selecione os Escopos Necessários
Marque os seguintes escopos conforme suas necessidades:

- ✅ **Produtos** - Para sincronizar catálogo
- ✅ **Pedidos** - Para importar vendas
- ✅ **Estoque** - Para controle de inventário
- ✅ **Contatos** - Para dados de clientes
- ✅ **Categorias** - Para organização de produtos
- ✅ **Situações** - Para status de pedidos

### 5. Salve as Configurações
- Clique em "Salvar"
- Anote o `Client ID` e `Client Secret` (já configurados no projeto)

## 🚀 Configurar Credenciais

Configure suas credenciais no arquivo `.env.local`:

```env
BLING_CLIENT_ID=seu_client_id_aqui
BLING_CLIENT_SECRET=seu_client_secret_aqui
```

**⚠️ NUNCA COMMITE CREDENCIAIS REAIS NO GIT!**

## 🧪 Testando a Integração

### 1. Inicie o Servidor
```bash
npm run dev
```

### 2. Acesse a Página de Integração
```
http://localhost:3002/integrations/bling
```

### 3. Clique em "Conectar Bling Agora"
- Você será redirecionado para o Bling
- Faça login se necessário
- Clique em "Autorizar" para permitir o acesso
- Será redirecionado de volta para o ECOMMIND

### 4. Verificar Sucesso
- Após autorizar, você deve ver a mensagem de sucesso
- O botão deve mudar para "Bling Conectado"

## 🔍 Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se o "Link de redirecionamento" no Bling está exatamente igual ao configurado
- Certifique-se de que não há espaços ou caracteres extras

### Erro: "invalid_client"
- Verifique se o `Client ID` está correto
- Certifique-se de que o aplicativo está ativo no Bling

### Erro: "access_denied"
- O usuário cancelou a autorização
- Tente novamente o processo

### Erro: "invalid_scope"
- Verifique se os escopos estão configurados no aplicativo do Bling
- Certifique-se de que pelo menos um escopo está selecionado

## 📊 Próximos Passos

Após a integração bem-sucedida:

1. **Sincronização Inicial**: Os dados do Bling serão importados
2. **Configuração de Alertas**: Defina alertas para estoque baixo, etc.
3. **Dashboard**: Visualize os dados integrados no dashboard
4. **WhatsApp**: Configure a integração com WhatsApp Business

## 🔒 Segurança

- As credenciais são armazenadas de forma segura
- O acesso é somente leitura (não modificamos dados no Bling)
- Tokens são renovados automaticamente
- Conexão criptografada (HTTPS em produção)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do servidor
2. Confirme as configurações no painel do Bling
3. Entre em contato com o suporte técnico
