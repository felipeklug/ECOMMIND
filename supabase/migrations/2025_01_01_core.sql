-- =====================================================
-- ECOMMIND - Core Database Schema
-- Multi-tenant with RLS, ETL, AI Missions & BI Views
-- =====================================================

-- 1) Utilitários e Extensões
create extension if not exists "uuid-ossp";
create extension if not exists "pg_stat_statements";

-- Função para timestamp UTC consistente
create or replace function utc_now() 
returns timestamptz 
language sql stable 
as $$ select now() at time zone 'utc' $$;

-- =====================================================
-- 2) Tabelas Core (assumindo que companies e profiles existem)
-- =====================================================

-- Verificar se tabelas core existem, senão criar
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default utc_now(),
  updated_at timestamptz not null default utc_now()
);

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  email text unique not null,
  name text,
  role text default 'user',
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default utc_now(),
  updated_at timestamptz not null default utc_now()
);

-- =====================================================
-- 3) ETL - Controle de Execução e Checkpoints
-- =====================================================

create table if not exists etl_runs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  source text not null, -- ex: 'bling.products', 'bling.orders', 'meli.orders'
  started_at timestamptz not null default utc_now(),
  finished_at timestamptz,
  ok boolean,
  rows int default 0,
  pages int default 0,
  error text,
  metadata jsonb default '{}'::jsonb
);

create table if not exists etl_checkpoints (
  company_id uuid not null references companies(id) on delete cascade,
  source text not null, -- ex: 'bling.products', 'meli.orders'
  last_run_at timestamptz not null default (utc_now() - interval '1 day'),
  last_sync_key text, -- último ID/timestamp sincronizado
  metadata jsonb default '{}'::jsonb,
  primary key (company_id, source)
);

-- =====================================================
-- 4) Catálogo de Produtos e Custos (Normalizado)
-- =====================================================

create table if not exists products (
  company_id uuid not null references companies(id) on delete cascade,
  sku text not null,
  title text,
  description text,
  product_type text,
  brand text,
  category text,
  weight_kg numeric(8,3),
  dimensions jsonb, -- {length, width, height}
  attributes jsonb default '{}'::jsonb,
  active boolean default true,
  created_dt date not null default current_date,
  updated_at timestamptz not null default utc_now(),
  primary key (company_id, sku)
);

create table if not exists costs (
  company_id uuid not null references companies(id) on delete cascade,
  sku text not null,
  cmv numeric(14,2) not null,
  valid_from date not null,
  valid_to date,
  source text default 'manual', -- 'bling'|'tiny'|'manual'|'import'
  notes text,
  created_at timestamptz not null default utc_now(),
  primary key (company_id, sku, valid_from),
  foreign key (company_id, sku) references products(company_id, sku) on delete cascade
);

-- =====================================================
-- 5) Pedidos e Itens
-- =====================================================

create table if not exists orders (
  company_id uuid not null references companies(id) on delete cascade,
  order_id text not null,
  channel text not null, -- 'meli'|'shopee'|'amazon'|'site'|'erp'|'whatsapp'
  order_dt timestamptz not null,
  buyer_id text,
  buyer_name text,
  buyer_email text,
  status text not null, -- 'pending'|'confirmed'|'shipped'|'delivered'|'cancelled'
  payment_method text,
  shipping_method text,
  total_amount numeric(14,2),
  shipping_cost numeric(14,2) default 0,
  discount numeric(14,2) default 0,
  external_id text, -- ID no marketplace
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default utc_now(),
  updated_at timestamptz not null default utc_now(),
  primary key (company_id, order_id)
);

create table if not exists order_items (
  company_id uuid not null references companies(id) on delete cascade,
  order_id text not null,
  item_seq int not null,
  sku text not null,
  product_title text,
  qty numeric(12,2) not null,
  unit_price numeric(14,2) not null,
  fees_total numeric(14,2) default 0, -- taxas do marketplace
  shipping_cost numeric(14,2) default 0,
  discount numeric(14,2) default 0,
  ad_cost numeric(14,2) default 0, -- custo de anúncios atribuído
  external_item_id text,
  metadata jsonb default '{}'::jsonb,
  primary key (company_id, order_id, item_seq),
  foreign key (company_id, order_id) references orders(company_id, order_id) on delete cascade,
  foreign key (company_id, sku) references products(company_id, sku) on delete restrict
);

-- =====================================================
-- 6) Planejamento - Metas e Orçamentos
-- =====================================================

create table if not exists targets (
  company_id uuid not null references companies(id) on delete cascade,
  period date not null, -- usar sempre o 1º dia do mês
  channel text not null,
  sku text not null,
  target_units numeric(14,2),
  target_revenue numeric(14,2),
  target_margin_pct numeric(5,2), -- margem alvo em %
  notes text,
  created_at timestamptz not null default utc_now(),
  updated_at timestamptz not null default utc_now(),
  primary key (company_id, period, channel, sku),
  foreign key (company_id, sku) references products(company_id, sku) on delete cascade
);

create table if not exists budgets (
  company_id uuid not null references companies(id) on delete cascade,
  year int not null,
  month int not null,
  category text not null, -- 'ads'|'shipping'|'fees'|'inventory'|'operations'
  subcategory text,
  amount numeric(14,2) not null,
  spent numeric(14,2) default 0,
  notes text,
  created_at timestamptz not null default utc_now(),
  updated_at timestamptz not null default utc_now(),
  primary key (company_id, year, month, category, subcategory)
);

-- =====================================================
-- 7) Missões IA - Insights e Tarefas
-- =====================================================

create table if not exists insights (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  agent text not null, -- 'bi'|'planning'|'ads'|'ops'|'market'|'chat'
  module text not null, -- 'bi'|'planning'|'ads'|'ops'|'market'|'chat'
  type text not null, -- 'low_margin'|'rupture'|'gap_portfolio'|'trend_up'|'trend_down'
  title text not null,
  summary text,
  evidence jsonb default '{}'::jsonb, -- dados que suportam o insight
  scope jsonb default '{}'::jsonb, -- SKUs, canais, períodos afetados
  confidence numeric(4,2) check (confidence >= 0 and confidence <= 1), -- 0.0 a 1.0
  impact text, -- 'revenue'|'margin'|'stock'|'service'|'efficiency'
  impact_estimate jsonb default '{}'::jsonb, -- estimativa de impacto financeiro
  priority text default 'medium', -- 'low'|'medium'|'high'|'critical'
  status text default 'active', -- 'active'|'dismissed'|'resolved'
  dedupe_key text, -- para evitar insights duplicados
  expires_at timestamptz, -- insights podem ter validade
  created_at timestamptz not null default utc_now(),
  updated_at timestamptz not null default utc_now()
);

create table if not exists missions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  origin_insight_id uuid references insights(id) on delete set null,
  module text not null, -- 'bi'|'planning'|'ads'|'ops'|'market'|'chat'
  title text not null,
  description text,
  status text not null default 'backlog', -- 'backlog'|'planned'|'in_progress'|'done'|'dismissed'
  priority text default 'P2', -- 'P0'|'P1'|'P2'|'P3'
  assignee_id uuid references profiles(id) on delete set null,
  due_date date,
  estimated_hours numeric(6,2),
  actual_hours numeric(6,2),
  payload jsonb default '{}'::jsonb, -- dados específicos da missão
  tags text[], -- tags para categorização
  created_at timestamptz not null default utc_now(),
  updated_at timestamptz not null default utc_now(),
  completed_at timestamptz
);

create table if not exists mission_comments (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid not null references missions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  type text default 'comment', -- 'comment'|'status_change'|'assignment'
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default utc_now()
);

-- =====================================================
-- 8) Views BI - Business Intelligence
-- =====================================================

-- View: Custos atuais por SKU (última versão válida)
create or replace view dim_costs_current as
select company_id, sku, cmv, valid_from, source, notes
from (
  select c.*,
         row_number() over (
           partition by company_id, sku
           order by valid_from desc
         ) as rn
  from costs c
  where (valid_to is null or valid_to >= current_date)
) x
where rn = 1;

-- View: Análise de lucratividade por item
create or replace view v_item_profit as
select
  i.company_id,
  i.order_id,
  i.item_seq,
  i.sku,
  i.product_title,
  o.channel,
  o.order_dt,
  i.qty,
  i.unit_price,
  -- Receitas
  (i.unit_price * i.qty) as receita_bruta,

  -- Custos
  coalesce(i.fees_total, 0) as fees_marketplace,
  coalesce(i.shipping_cost, 0) as custo_frete,
  coalesce(i.discount, 0) as desconto,
  coalesce(i.ad_cost, 0) as custo_ads,
  (coalesce(d.cmv, 0) * i.qty) as cmv_total,

  -- Custos totais
  (coalesce(i.fees_total, 0) + coalesce(i.shipping_cost, 0) +
   coalesce(i.discount, 0) + coalesce(i.ad_cost, 0)) as custos_canal,

  -- Lucro líquido
  (i.unit_price * i.qty) -
  (coalesce(i.fees_total, 0) + coalesce(i.shipping_cost, 0) +
   coalesce(i.discount, 0) + coalesce(i.ad_cost, 0)) -
  (coalesce(d.cmv, 0) * i.qty) as lucro_liquido,

  -- Margem percentual
  case
    when (i.unit_price * i.qty) > 0 then
      ((i.unit_price * i.qty) -
       (coalesce(i.fees_total, 0) + coalesce(i.shipping_cost, 0) +
        coalesce(i.discount, 0) + coalesce(i.ad_cost, 0)) -
       (coalesce(d.cmv, 0) * i.qty)) / (i.unit_price * i.qty) * 100
    else 0
  end as margem_pct

from order_items i
join orders o on o.company_id = i.company_id and o.order_id = i.order_id
left join dim_costs_current d on d.company_id = i.company_id and d.sku = i.sku;

-- View: Progresso vs Metas
create or replace view v_target_progress as
with sales_summary as (
  select
    company_id,
    date_trunc('month', o.order_dt)::date as period,
    o.channel,
    i.sku,
    sum(i.qty) as units_real,
    sum(i.qty * i.unit_price) as revenue_real,
    sum(case when p.lucro_liquido > 0 then p.lucro_liquido else 0 end) as profit_real
  from order_items i
  join orders o on o.company_id = i.company_id and o.order_id = i.order_id
  left join v_item_profit p on p.company_id = i.company_id
    and p.order_id = i.order_id and p.item_seq = i.item_seq
  where o.status not in ('cancelled')
  group by 1, 2, 3, 4
)
select
  t.company_id,
  t.period,
  t.channel,
  t.sku,
  t.target_units,
  t.target_revenue,
  t.target_margin_pct,
  coalesce(s.units_real, 0) as units_real,
  coalesce(s.revenue_real, 0) as revenue_real,
  coalesce(s.profit_real, 0) as profit_real,

  -- Percentuais de atingimento
  case
    when t.target_units > 0 then coalesce(s.units_real, 0) / t.target_units * 100
    else null
  end as pct_units,

  case
    when t.target_revenue > 0 then coalesce(s.revenue_real, 0) / t.target_revenue * 100
    else null
  end as pct_revenue,

  -- Margem real vs target
  case
    when coalesce(s.revenue_real, 0) > 0 then
      coalesce(s.profit_real, 0) / coalesce(s.revenue_real, 0) * 100
    else 0
  end as margin_real_pct,

  t.notes,
  t.created_at,
  t.updated_at

from targets t
left join sales_summary s on s.company_id = t.company_id
  and s.period = t.period
  and s.channel = t.channel
  and s.sku = t.sku;

-- View: Dashboard de vendas por canal
create or replace view v_sales_dashboard as
select
  company_id,
  channel,
  date_trunc('day', order_dt)::date as sales_date,
  count(distinct order_id) as orders_count,
  sum(total_amount) as revenue_total,
  avg(total_amount) as ticket_medio,
  sum(shipping_cost) as shipping_total,
  sum(discount) as discount_total
from orders
where status not in ('cancelled')
group by company_id, channel, date_trunc('day', order_dt)::date;

-- View: Top produtos por margem
create or replace view v_top_products_margin as
select
  company_id,
  sku,
  max(product_title) as product_title,
  sum(qty) as total_qty,
  sum(receita_bruta) as total_revenue,
  sum(lucro_liquido) as total_profit,
  avg(margem_pct) as avg_margin_pct,
  count(distinct order_id) as orders_count
from v_item_profit
group by company_id, sku
having sum(receita_bruta) > 0
order by avg_margin_pct desc;

-- =====================================================
-- 9) Índices para Performance
-- =====================================================

-- Índices para tabelas de alto volume
create index if not exists idx_orders_company_dt on orders(company_id, order_dt desc);
create index if not exists idx_orders_company_channel_dt on orders(company_id, channel, order_dt desc);
create index if not exists idx_orders_status on orders(company_id, status);

create index if not exists idx_order_items_company_sku on order_items(company_id, sku);
create index if not exists idx_order_items_company_order on order_items(company_id, order_id);

create index if not exists idx_products_company_sku on products(company_id, sku);
create index if not exists idx_products_company_active on products(company_id, active) where active = true;
create index if not exists idx_products_category on products(company_id, category);

create index if not exists idx_costs_company_sku_from on costs(company_id, sku, valid_from desc);
create index if not exists idx_costs_valid_range on costs(company_id, sku, valid_from, valid_to);

-- Índices para ETL
create index if not exists idx_etl_runs_company_source on etl_runs(company_id, source, started_at desc);
create index if not exists idx_etl_checkpoints_company_source on etl_checkpoints(company_id, source);

-- Índices para Missões IA
create index if not exists idx_insights_company_created on insights(company_id, created_at desc);
create index if not exists idx_insights_company_status on insights(company_id, status);
create index if not exists idx_insights_company_type on insights(company_id, type);
create index if not exists idx_insights_dedupe on insights(company_id, dedupe_key) where dedupe_key is not null;

create index if not exists idx_missions_company_status on missions(company_id, status);
create index if not exists idx_missions_company_assignee on missions(company_id, assignee_id) where assignee_id is not null;
create index if not exists idx_missions_company_due on missions(company_id, due_date) where due_date is not null;
create index if not exists idx_missions_priority on missions(company_id, priority);

-- Índices para Planejamento
create index if not exists idx_targets_company_period on targets(company_id, period desc);
create index if not exists idx_targets_company_channel on targets(company_id, channel, period desc);

create index if not exists idx_budgets_company_year_month on budgets(company_id, year desc, month desc);

-- Índices compostos para queries complexas
create index if not exists idx_orders_items_profit on order_items(company_id, sku, order_id);

-- =====================================================
-- 10) Row Level Security (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas multi-tenant
alter table companies enable row level security;
alter table profiles enable row level security;
alter table etl_runs enable row level security;
alter table etl_checkpoints enable row level security;
alter table products enable row level security;
alter table costs enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table targets enable row level security;
alter table budgets enable row level security;
alter table insights enable row level security;
alter table missions enable row level security;
alter table mission_comments enable row level security;

-- =====================================================
-- 11) Políticas RLS
-- =====================================================

-- Função para obter company_id do usuário autenticado
create or replace function auth.get_user_company_id()
returns uuid
language sql
security definer
as $$
  select company_id
  from profiles
  where id = auth.uid()
  limit 1;
$$;

-- Políticas para companies (usuários só veem sua própria empresa)
create policy "companies_select" on companies for select
  using (id = auth.get_user_company_id());

create policy "companies_update" on companies for update
  using (id = auth.get_user_company_id());

-- Políticas para profiles (usuários só veem perfis da sua empresa)
create policy "profiles_select" on profiles for select
  using (company_id = auth.get_user_company_id());

create policy "profiles_insert" on profiles for insert
  with check (company_id = auth.get_user_company_id());

create policy "profiles_update" on profiles for update
  using (company_id = auth.get_user_company_id());

-- Macro para criar políticas padrão por tenant
create or replace function create_tenant_policies(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('
    create policy "%s_tenant_select" on %s for select
      using (company_id = auth.get_user_company_id());

    create policy "%s_tenant_insert" on %s for insert
      with check (company_id = auth.get_user_company_id());

    create policy "%s_tenant_update" on %s for update
      using (company_id = auth.get_user_company_id());

    create policy "%s_tenant_delete" on %s for delete
      using (company_id = auth.get_user_company_id());
  ', table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name);
end;
$$;

-- Aplicar políticas para todas as tabelas multi-tenant
select create_tenant_policies('etl_runs');
select create_tenant_policies('etl_checkpoints');
select create_tenant_policies('products');
select create_tenant_policies('costs');
select create_tenant_policies('orders');
select create_tenant_policies('order_items');
select create_tenant_policies('targets');
select create_tenant_policies('budgets');
select create_tenant_policies('insights');
select create_tenant_policies('missions');

-- Política especial para mission_comments (baseada na mission)
create policy "mission_comments_select" on mission_comments for select
  using (exists (
    select 1 from missions m
    where m.id = mission_comments.mission_id
    and m.company_id = auth.get_user_company_id()
  ));

create policy "mission_comments_insert" on mission_comments for insert
  with check (exists (
    select 1 from missions m
    where m.id = mission_comments.mission_id
    and m.company_id = auth.get_user_company_id()
  ));

-- =====================================================
-- 12) Triggers para Updated_at
-- =====================================================

create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = utc_now();
  return new;
end;
$$;

-- Aplicar trigger em tabelas que têm updated_at
create trigger update_companies_updated_at before update on companies
  for each row execute function update_updated_at_column();

create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_products_updated_at before update on products
  for each row execute function update_updated_at_column();

create trigger update_targets_updated_at before update on targets
  for each row execute function update_updated_at_column();

create trigger update_budgets_updated_at before update on budgets
  for each row execute function update_updated_at_column();

create trigger update_insights_updated_at before update on insights
  for each row execute function update_updated_at_column();

create trigger update_missions_updated_at before update on missions
  for each row execute function update_updated_at_column();

create trigger update_orders_updated_at before update on orders
  for each row execute function update_updated_at_column();

-- =====================================================
-- 13) Funções Utilitárias
-- =====================================================

-- Função para limpar insights expirados
create or replace function cleanup_expired_insights()
returns int
language plpgsql
security definer
as $$
declare
  deleted_count int;
begin
  delete from insights
  where expires_at < utc_now()
  and status = 'active';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Função para calcular margem de um produto
create or replace function calculate_product_margin(
  p_company_id uuid,
  p_sku text,
  p_selling_price numeric
)
returns numeric
language plpgsql
stable
as $$
declare
  current_cmv numeric;
  margin_value numeric;
begin
  select cmv into current_cmv
  from dim_costs_current
  where company_id = p_company_id and sku = p_sku;

  if current_cmv is null then
    return null;
  end if;

  if p_selling_price <= 0 then
    return 0;
  end if;

  margin_value := (p_selling_price - current_cmv) / p_selling_price * 100;
  return round(margin_value, 2);
end;
$$;

-- =====================================================
-- 14) Comentários nas Tabelas
-- =====================================================

comment on table companies is 'Empresas/tenants do sistema';
comment on table profiles is 'Perfis de usuários vinculados às empresas';
comment on table etl_runs is 'Log de execuções de ETL por fonte de dados';
comment on table etl_checkpoints is 'Checkpoints para controle incremental de ETL';
comment on table products is 'Catálogo de produtos normalizado';
comment on table costs is 'Histórico de custos (CMV) por produto com versionamento';
comment on table orders is 'Pedidos de todos os canais de venda';
comment on table order_items is 'Itens dos pedidos com detalhamento de custos';
comment on table targets is 'Metas de vendas por período, canal e SKU';
comment on table budgets is 'Orçamentos por categoria e período';
comment on table insights is 'Insights gerados por IA para tomada de decisão';
comment on table missions is 'Tarefas/missões derivadas dos insights';
comment on table mission_comments is 'Comentários e atualizações das missões';

comment on view dim_costs_current is 'Custos atuais válidos por SKU';
comment on view v_item_profit is 'Análise de lucratividade detalhada por item vendido';
comment on view v_target_progress is 'Progresso de vendas vs metas estabelecidas';
comment on view v_sales_dashboard is 'Dashboard de vendas agregadas por canal e data';
comment on view v_top_products_margin is 'Ranking de produtos por margem de lucro';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
