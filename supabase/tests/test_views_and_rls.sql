-- =====================================================
-- ECOMMIND - Testes de Views e RLS
-- Validação das funcionalidades implementadas
-- =====================================================

-- Teste 1: Verificar se as views retornam dados
\echo '=== TESTE 1: Views BI ==='

-- Testar dim_costs_current
select 'dim_costs_current' as view_name, count(*) as records
from dim_costs_current;

-- Testar v_item_profit
select 'v_item_profit' as view_name, count(*) as records
from v_item_profit;

-- Testar v_target_progress
select 'v_target_progress' as view_name, count(*) as records
from v_target_progress;

-- Testar v_sales_dashboard
select 'v_sales_dashboard' as view_name, count(*) as records
from v_sales_dashboard;

-- Testar v_top_products_margin
select 'v_top_products_margin' as view_name, count(*) as records
from v_top_products_margin;

\echo '=== TESTE 2: Análise de Lucratividade ==='

-- Top 5 produtos por margem
select 
  sku,
  product_title,
  total_revenue,
  total_profit,
  avg_margin_pct
from v_top_products_margin
limit 5;

\echo '=== TESTE 3: Progresso vs Metas ==='

-- Progresso das metas do mês atual
select 
  channel,
  sku,
  target_units,
  units_real,
  pct_units,
  target_revenue,
  revenue_real,
  pct_revenue
from v_target_progress
where period = date_trunc('month', current_date)::date
order by pct_revenue desc;

\echo '=== TESTE 4: Dashboard de Vendas ==='

-- Vendas dos últimos 7 dias por canal
select 
  channel,
  sales_date,
  orders_count,
  revenue_total,
  ticket_medio
from v_sales_dashboard
where sales_date >= current_date - interval '7 days'
order by sales_date desc, channel;

\echo '=== TESTE 5: Análise Detalhada de Itens ==='

-- Análise de lucratividade por item (últimos 7 dias)
select 
  sku,
  product_title,
  channel,
  qty,
  receita_bruta,
  cmv_total,
  custos_canal,
  lucro_liquido,
  margem_pct
from v_item_profit
where order_dt >= current_date - interval '7 days'
order by margem_pct desc;

\echo '=== TESTE 6: Insights e Missões ==='

-- Insights ativos
select 
  agent,
  module,
  type,
  title,
  confidence,
  impact,
  priority,
  status
from insights
where status = 'active'
order by priority, confidence desc;

-- Missões por status
select 
  status,
  count(*) as count,
  string_agg(distinct priority, ', ') as priorities
from missions
group by status
order by status;

\echo '=== TESTE 7: ETL Status ==='

-- Status dos checkpoints
select 
  source,
  last_run_at,
  extract(epoch from (current_timestamp - last_run_at))/3600 as hours_since_last_run
from etl_checkpoints
order by last_run_at desc;

\echo '=== TESTE 8: Funções Utilitárias ==='

-- Testar função de cálculo de margem
select 
  sku,
  calculate_product_margin(
    '550e8400-e29b-41d4-a716-446655440000'::uuid, 
    sku, 
    100.00
  ) as margin_at_100
from products
limit 3;

\echo '=== TESTE 9: Performance dos Índices ==='

-- Verificar se os índices estão sendo usados
explain (analyze, buffers) 
select * from orders 
where company_id = '550e8400-e29b-41d4-a716-446655440000'
and order_dt >= current_date - interval '30 days'
order by order_dt desc;

explain (analyze, buffers)
select * from order_items 
where company_id = '550e8400-e29b-41d4-a716-446655440000'
and sku = 'SMARTPHONE-001';

\echo '=== TESTE 10: Validação de Dados ==='

-- Verificar consistência dos dados
select 
  'orders_without_items' as check_name,
  count(*) as count
from orders o
left join order_items oi on oi.company_id = o.company_id and oi.order_id = o.order_id
where oi.order_id is null;

select 
  'items_without_products' as check_name,
  count(*) as count
from order_items oi
left join products p on p.company_id = oi.company_id and p.sku = oi.sku
where p.sku is null;

select 
  'products_without_costs' as check_name,
  count(*) as count
from products p
left join dim_costs_current c on c.company_id = p.company_id and c.sku = p.sku
where c.sku is null;

\echo '=== TESTE 11: Agregações de Negócio ==='

-- Resumo financeiro do mês
with monthly_summary as (
  select 
    sum(receita_bruta) as total_revenue,
    sum(lucro_liquido) as total_profit,
    avg(margem_pct) as avg_margin,
    count(distinct order_id) as total_orders,
    count(*) as total_items
  from v_item_profit
  where date_trunc('month', order_dt) = date_trunc('month', current_date)
)
select 
  'monthly_summary' as metric,
  total_revenue,
  total_profit,
  round(avg_margin, 2) as avg_margin_pct,
  total_orders,
  total_items,
  round(total_revenue / total_orders, 2) as avg_order_value
from monthly_summary;

-- Performance por canal
select 
  channel,
  count(distinct order_id) as orders,
  sum(receita_bruta) as revenue,
  sum(lucro_liquido) as profit,
  round(avg(margem_pct), 2) as avg_margin_pct,
  round(sum(lucro_liquido) / sum(receita_bruta) * 100, 2) as profit_margin_pct
from v_item_profit
where date_trunc('month', order_dt) = date_trunc('month', current_date)
group by channel
order by profit desc;

\echo '=== TESTE CONCLUÍDO ==='
\echo 'Todos os testes executados. Verifique os resultados acima.'
