-- =====================================================
-- Reports & Analytics Migration - PR#7
-- Materialized views para relatórios executivos
-- =====================================================

-- Extensões necessárias
create extension if not exists "pg_cron";

-- =====================================================
-- MATERIALIZED VIEWS PARA RELATÓRIOS
-- =====================================================

-- 1. Chat SLA por agente (diário)
create materialized view if not exists rpt_chat_sla_by_agent as
select 
  c.company_id,
  date_trunc('day', ct.created_at) as day,
  ct.assigned_to as agent_id,
  u.name as agent_name,
  count(*) as total_threads,
  count(*) filter (where ct.first_response_at is not null) as responded_threads,
  avg(extract(epoch from (ct.first_response_at - ct.created_at))/60) filter (where ct.first_response_at is not null) as avg_first_response_minutes,
  count(*) filter (where ct.status = 'resolved') as resolved_threads,
  avg(extract(epoch from (ct.resolved_at - ct.created_at))/60) filter (where ct.resolved_at is not null) as avg_resolution_minutes,
  count(*) filter (where ct.status in ('open', 'pending')) as backlog_threads,
  avg(ct.satisfaction_score) filter (where ct.satisfaction_score is not null) as avg_satisfaction
from companies c
left join chat_threads ct on ct.company_id = c.id
left join profiles u on u.id = ct.assigned_to
where ct.created_at >= current_date - interval '90 days'
group by c.company_id, date_trunc('day', ct.created_at), ct.assigned_to, u.name;

-- Índices para performance
create unique index if not exists idx_rpt_chat_sla_unique on rpt_chat_sla_by_agent(company_id, day, agent_id);
create index if not exists idx_rpt_chat_sla_company_day on rpt_chat_sla_by_agent(company_id, day);

-- 2. Vendas por canal (diário)
create materialized view if not exists rpt_sales_by_channel as
select 
  o.company_id,
  date_trunc('day', o.order_dt) as day,
  o.channel,
  count(distinct o.order_id) as total_orders,
  sum(oi.qty * oi.unit_price - oi.discount) as gross_revenue,
  sum(oi.fees_total + oi.shipping_cost) as total_fees,
  sum(oi.qty * oi.unit_price - oi.discount - oi.fees_total - oi.shipping_cost) as net_revenue,
  avg(oi.qty * oi.unit_price - oi.discount) as avg_ticket,
  sum(oi.qty * coalesce(dc.cmv, 0)) as total_cogs,
  sum(oi.qty * oi.unit_price - oi.discount - oi.fees_total - oi.shipping_cost - oi.qty * coalesce(dc.cmv, 0)) as gross_profit,
  case 
    when sum(oi.qty * oi.unit_price - oi.discount) > 0 
    then (sum(oi.qty * oi.unit_price - oi.discount - oi.fees_total - oi.shipping_cost - oi.qty * coalesce(dc.cmv, 0)) / sum(oi.qty * oi.unit_price - oi.discount)) * 100
    else 0 
  end as margin_percent
from fact_orders o
join fact_order_items oi on oi.order_id = o.order_id
left join dim_costs dc on dc.sku = oi.sku and dc.company_id = o.company_id 
  and o.order_dt between dc.valid_from and coalesce(dc.valid_to, '2099-12-31')
where o.order_dt >= current_date - interval '90 days'
  and o.status not in ('cancelled', 'refunded')
group by o.company_id, date_trunc('day', o.order_dt), o.channel;

-- Índices para performance
create unique index if not exists idx_rpt_sales_unique on rpt_sales_by_channel(company_id, day, channel);
create index if not exists idx_rpt_sales_company_day on rpt_sales_by_channel(company_id, day);

-- 3. Cashflow financeiro (diário)
create materialized view if not exists rpt_finance_cashflow as
select 
  company_id,
  due_dt as day,
  'receivable' as flow_type,
  sum(amount) filter (where status = 'open') as planned_amount,
  sum(amount) filter (where status = 'paid') as realized_amount,
  count(*) filter (where status = 'open') as open_count,
  count(*) filter (where status = 'paid') as paid_count,
  count(*) filter (where status = 'overdue') as overdue_count
from fact_finance_ar
where due_dt >= current_date - interval '30 days'
  and due_dt <= current_date + interval '90 days'
group by company_id, due_dt

union all

select 
  company_id,
  due_dt as day,
  'payable' as flow_type,
  sum(amount) filter (where status = 'open') as planned_amount,
  sum(amount) filter (where status = 'paid') as realized_amount,
  count(*) filter (where status = 'open') as open_count,
  count(*) filter (where status = 'paid') as paid_count,
  count(*) filter (where status = 'overdue') as overdue_count
from fact_finance_ap
where due_dt >= current_date - interval '30 days'
  and due_dt <= current_date + interval '90 days'
group by company_id, due_dt;

-- Índices para performance
create index if not exists idx_rpt_cashflow_company_day on rpt_finance_cashflow(company_id, day);
create index if not exists idx_rpt_cashflow_type on rpt_finance_cashflow(company_id, flow_type, day);

-- 4. Risco de estoque (diário)
create materialized view if not exists rpt_ops_stock_risk as
select 
  fss.company_id,
  current_date as day,
  fss.sku,
  dp.title as product_title,
  fss.channel,
  fss.qty as current_stock,
  coalesce(sales_7d.avg_daily_sales, 0) as avg_daily_sales_7d,
  coalesce(sales_30d.avg_daily_sales, 0) as avg_daily_sales_30d,
  case 
    when coalesce(sales_7d.avg_daily_sales, 0) > 0 
    then fss.qty / sales_7d.avg_daily_sales
    else 999 
  end as coverage_days_7d,
  case 
    when coalesce(sales_30d.avg_daily_sales, 0) > 0 
    then fss.qty / sales_30d.avg_daily_sales
    else 999 
  end as coverage_days_30d,
  case 
    when fss.qty <= 0 then 'rupture'
    when coalesce(sales_7d.avg_daily_sales, 0) > 0 and fss.qty / sales_7d.avg_daily_sales <= 3 then 'critical'
    when coalesce(sales_7d.avg_daily_sales, 0) > 0 and fss.qty / sales_7d.avg_daily_sales <= 7 then 'warning'
    else 'ok'
  end as risk_level,
  greatest(0, ceil(coalesce(sales_7d.avg_daily_sales, 0) * 14) - fss.qty) as suggested_reorder_qty
from (
  select distinct on (company_id, sku, channel) 
    company_id, sku, channel, qty, snapshot_dt
  from fact_stock_snapshot
  order by company_id, sku, channel, snapshot_dt desc
) fss
left join dim_products dp on dp.sku = fss.sku and dp.company_id = fss.company_id
left join (
  select 
    oi.company_id,
    oi.sku,
    sum(oi.qty) / 7.0 as avg_daily_sales
  from fact_order_items oi
  join fact_orders o on o.order_id = oi.order_id
  where o.order_dt >= current_date - interval '7 days'
    and o.status not in ('cancelled', 'refunded')
  group by oi.company_id, oi.sku
) sales_7d on sales_7d.company_id = fss.company_id and sales_7d.sku = fss.sku
left join (
  select 
    oi.company_id,
    oi.sku,
    sum(oi.qty) / 30.0 as avg_daily_sales
  from fact_order_items oi
  join fact_orders o on o.order_id = oi.order_id
  where o.order_dt >= current_date - interval '30 days'
    and o.status not in ('cancelled', 'refunded')
  group by oi.company_id, oi.sku
) sales_30d on sales_30d.company_id = fss.company_id and sales_30d.sku = fss.sku;

-- Índices para performance
create index if not exists idx_rpt_stock_risk_company on rpt_ops_stock_risk(company_id);
create index if not exists idx_rpt_stock_risk_level on rpt_ops_stock_risk(company_id, risk_level);

-- 5. Produtividade de missões (diário)
create materialized view if not exists rpt_missions_productivity as
select 
  m.company_id,
  date_trunc('day', m.created_at) as day,
  m.assignee_id,
  u.name as assignee_name,
  m.module,
  m.priority,
  count(*) as total_missions,
  count(*) filter (where m.status = 'done') as completed_missions,
  count(*) filter (where m.status = 'todo') as pending_missions,
  count(*) filter (where m.status = 'doing') as in_progress_missions,
  avg(extract(epoch from (m.updated_at - m.created_at))/3600) filter (where m.status = 'done') as avg_completion_hours,
  count(*) filter (where m.due_at < current_timestamp and m.status != 'done') as overdue_missions,
  avg(m.priority::int) as avg_priority_score
from missions m
left join profiles u on u.id = m.assignee_id
where m.created_at >= current_date - interval '90 days'
group by m.company_id, date_trunc('day', m.created_at), m.assignee_id, u.name, m.module, m.priority;

-- Índices para performance
create index if not exists idx_rpt_missions_company_day on rpt_missions_productivity(company_id, day);
create index if not exists idx_rpt_missions_assignee on rpt_missions_productivity(company_id, assignee_id, day);

-- =====================================================
-- REFRESH AUTOMÁTICO DAS MATERIALIZED VIEWS
-- =====================================================

-- Função para refresh das views
create or replace function refresh_report_views()
returns void
language plpgsql
as $$
begin
  refresh materialized view concurrently rpt_chat_sla_by_agent;
  refresh materialized view concurrently rpt_sales_by_channel;
  refresh materialized view concurrently rpt_finance_cashflow;
  refresh materialized view concurrently rpt_ops_stock_risk;
  refresh materialized view concurrently rpt_missions_productivity;
end;
$$;

-- Agendar refresh a cada 15 minutos
select cron.schedule('refresh-reports', '*/15 * * * *', 'select refresh_report_views();');

-- =====================================================
-- RLS PARA RELATÓRIOS
-- =====================================================

-- RLS para todas as views materializadas
alter table rpt_chat_sla_by_agent enable row level security;
alter table rpt_sales_by_channel enable row level security;
alter table rpt_finance_cashflow enable row level security;
alter table rpt_ops_stock_risk enable row level security;
alter table rpt_missions_productivity enable row level security;

-- Políticas de acesso
create policy "rpt_chat_sla_select" on rpt_chat_sla_by_agent 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "rpt_sales_select" on rpt_sales_by_channel 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "rpt_cashflow_select" on rpt_finance_cashflow 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "rpt_stock_risk_select" on rpt_ops_stock_risk 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "rpt_missions_select" on rpt_missions_productivity 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

comment on materialized view rpt_chat_sla_by_agent is 'Relatório de SLA do chat por agente (diário)';
comment on materialized view rpt_sales_by_channel is 'Relatório de vendas por canal (diário)';
comment on materialized view rpt_finance_cashflow is 'Relatório de fluxo de caixa (diário)';
comment on materialized view rpt_ops_stock_risk is 'Relatório de risco de estoque (diário)';
comment on materialized view rpt_missions_productivity is 'Relatório de produtividade de missões (diário)';

-- Refresh inicial
select refresh_report_views();
