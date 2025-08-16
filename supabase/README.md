# 🗄️ ECOMMIND Database Schema

Base de dados completa para o sistema ECOMMIND com suporte multi-tenant, ETL, Missões IA e Views BI.

## 📋 **Estrutura**

```
supabase/
├── migrations/
│   └── 2025_01_01_core.sql     # Schema principal
├── seed/
│   └── seed_events.sql         # Dados de exemplo
├── tests/
│   └── test_views_and_rls.sql  # Testes de validação
├── config.toml                 # Configuração Supabase
└── README.md                   # Este arquivo
```

## 🚀 **Aplicação das Migrations**

### **1. Via Supabase CLI (Local)**
```bash
# Inicializar projeto Supabase
supabase init

# Aplicar migrations
supabase db reset

# Ou aplicar migration específica
supabase db push
```

### **2. Via Dashboard Supabase (Produção)**
1. Acesse: `https://supabase.com/dashboard`
2. Vá em: **SQL Editor**
3. Cole o conteúdo de: `migrations/2025_01_01_core.sql`
4. Execute a migration

### **3. Aplicar Dados de Exemplo**
```bash
# Via CLI
supabase db seed

# Ou via Dashboard
# Cole o conteúdo de: seed/seed_events.sql
```

## 🏗️ **Arquitetura**

### **Tabelas Core**
- `companies` - Empresas/tenants
- `profiles` - Usuários por empresa

### **ETL & Controle**
- `etl_runs` - Log de execuções ETL
- `etl_checkpoints` - Controle incremental

### **Catálogo & Vendas**
- `products` - Catálogo normalizado
- `costs` - Histórico de custos (CMV)
- `orders` - Pedidos multi-canal
- `order_items` - Itens com detalhamento

### **Planejamento**
- `targets` - Metas por período/canal/SKU
- `budgets` - Orçamentos por categoria

### **Missões IA**
- `insights` - Insights gerados por IA
- `missions` - Tarefas derivadas
- `mission_comments` - Acompanhamento

## 📊 **Views BI**

### **dim_costs_current**
Custos atuais válidos por SKU
```sql
select * from dim_costs_current 
where company_id = 'your-company-id';
```

### **v_item_profit**
Análise detalhada de lucratividade
```sql
select sku, margem_pct, lucro_liquido 
from v_item_profit 
where company_id = 'your-company-id'
order by margem_pct desc;
```

### **v_target_progress**
Progresso vs metas estabelecidas
```sql
select channel, sku, pct_revenue, pct_units
from v_target_progress 
where company_id = 'your-company-id'
and period = date_trunc('month', current_date)::date;
```

### **v_sales_dashboard**
Dashboard de vendas por canal
```sql
select channel, sales_date, revenue_total, orders_count
from v_sales_dashboard 
where company_id = 'your-company-id'
and sales_date >= current_date - interval '7 days';
```

### **v_top_products_margin**
Ranking por margem de lucro
```sql
select sku, avg_margin_pct, total_profit
from v_top_products_margin 
where company_id = 'your-company-id'
limit 10;
```

## 🔒 **Row Level Security (RLS)**

### **Configuração**
- ✅ RLS habilitado em todas as tabelas multi-tenant
- ✅ Políticas baseadas em `company_id`
- ✅ Isolamento completo entre empresas

### **Função de Autenticação**
```sql
-- Obtém company_id do usuário autenticado
select auth.get_user_company_id();
```

### **Políticas Aplicadas**
- **SELECT**: Usuários só veem dados da sua empresa
- **INSERT**: Só podem inserir dados na sua empresa
- **UPDATE/DELETE**: Só podem modificar dados da sua empresa

## 🔧 **Funções Utilitárias**

### **calculate_product_margin**
Calcula margem de um produto
```sql
select calculate_product_margin(
  'company-id'::uuid,
  'SKU-001',
  100.00  -- preço de venda
);
```

### **cleanup_expired_insights**
Remove insights expirados
```sql
select cleanup_expired_insights();
```

### **utc_now**
Timestamp UTC consistente
```sql
select utc_now();
```

## 📈 **Índices de Performance**

### **Principais Índices**
- `orders(company_id, order_dt desc)` - Consultas temporais
- `order_items(company_id, sku)` - Análise por produto
- `costs(company_id, sku, valid_from desc)` - Custos atuais
- `insights(company_id, created_at desc)` - Insights recentes

### **Verificação de Performance**
```sql
-- Verificar uso de índices
explain (analyze, buffers) 
select * from orders 
where company_id = 'your-id' 
and order_dt >= current_date - interval '30 days';
```

## 🧪 **Testes**

### **Executar Testes**
```bash
# Via CLI
psql -f tests/test_views_and_rls.sql

# Ou via Dashboard
# Cole e execute: tests/test_views_and_rls.sql
```

### **Validações Incluídas**
- ✅ Views retornam dados
- ✅ Cálculos de margem corretos
- ✅ Progresso vs metas
- ✅ Consistência de dados
- ✅ Performance de índices

## 🔄 **ETL Integration**

### **Checkpoints**
```sql
-- Verificar último sync
select source, last_run_at 
from etl_checkpoints 
where company_id = 'your-id';

-- Atualizar checkpoint
update etl_checkpoints 
set last_run_at = utc_now() 
where company_id = 'your-id' and source = 'bling.orders';
```

### **Log de Execuções**
```sql
-- Registrar execução ETL
insert into etl_runs (company_id, source, ok, rows, error)
values ('your-id', 'bling.products', true, 150, null);
```

## 📝 **Exemplos de Uso**

### **Dashboard Principal**
```sql
-- Resumo do mês atual
select 
  sum(receita_bruta) as revenue,
  sum(lucro_liquido) as profit,
  avg(margem_pct) as avg_margin
from v_item_profit 
where company_id = 'your-id'
and date_trunc('month', order_dt) = date_trunc('month', current_date);
```

### **Alertas de Margem Baixa**
```sql
-- Produtos com margem < 20%
select sku, product_title, avg(margem_pct) as margin
from v_item_profit 
where company_id = 'your-id'
and order_dt >= current_date - interval '30 days'
group by sku, product_title
having avg(margem_pct) < 20
order by margin;
```

### **Análise de Canais**
```sql
-- Performance por canal (último mês)
select 
  channel,
  count(distinct order_id) as orders,
  sum(receita_bruta) as revenue,
  avg(margem_pct) as avg_margin
from v_item_profit 
where company_id = 'your-id'
and order_dt >= date_trunc('month', current_date)
group by channel
order by revenue desc;
```

## 🚨 **Troubleshooting**

### **Problemas Comuns**

**1. RLS bloqueando queries**
```sql
-- Verificar se usuário tem company_id
select auth.get_user_company_id();

-- Desabilitar RLS temporariamente (só para debug)
set row_security = off;
```

**2. Views sem dados**
```sql
-- Verificar se há dados base
select count(*) from orders where company_id = 'your-id';
select count(*) from products where company_id = 'your-id';
```

**3. Performance lenta**
```sql
-- Verificar estatísticas das tabelas
analyze orders;
analyze order_items;
analyze products;
```

## 📞 **Suporte**

Para dúvidas sobre o schema:
1. Verifique os comentários nas tabelas
2. Execute os testes de validação
3. Consulte os exemplos de uso
4. Verifique logs de erro no Supabase

---

**✅ Schema pronto para produção com RLS, índices otimizados e views BI completas!**
