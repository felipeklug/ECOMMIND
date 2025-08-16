-- =====================================================
-- Market Intelligence Migration
-- Calendário de e-commerce e datasets de mercado
-- =====================================================

-- Calendário de e-commerce
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  date date not null,
  title text not null,
  channel text null,         -- meli|shopee|amazon|site|null (global)
  category text null,        -- categoria de foco (opcional)
  importance text not null default 'medium', -- low|medium|high
  source text not null default 'seed',       -- seed|manual|upload
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  created_by uuid null references profiles(id)
);

-- RLS para calendar_events
alter table calendar_events enable row level security;

create policy "calendar_events_select" on calendar_events 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "calendar_events_insert" on calendar_events 
  for insert with check((auth.jwt()->>'company_id')::uuid = company_id);

create policy "calendar_events_update" on calendar_events 
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "calendar_events_delete" on calendar_events 
  for delete using ((auth.jwt()->>'company_id')::uuid = company_id);

-- Índices para calendar_events
create index if not exists idx_calendar_company_date on calendar_events(company_id, date);
create index if not exists idx_calendar_company_channel on calendar_events(company_id, channel);
create index if not exists idx_calendar_importance on calendar_events(importance);

-- Datasets de mercado (upload normalizado)
create table if not exists market_datasets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  period_start date not null,
  period_end date not null,
  scope text not null, -- 'niche'|'category'
  source text not null, -- 'seed'|'upload'
  meta jsonb not null default '{}', -- ex.: { "file":"name.csv" }
  created_at timestamptz not null default now(),
  created_by uuid null references profiles(id)
);

-- RLS para market_datasets
alter table market_datasets enable row level security;

create policy "market_datasets_select" on market_datasets 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "market_datasets_insert" on market_datasets 
  for insert with check((auth.jwt()->>'company_id')::uuid = company_id);

-- Índices para market_datasets
create index if not exists idx_market_datasets_company on market_datasets(company_id);
create index if not exists idx_market_datasets_period on market_datasets(company_id, period_start, period_end);

-- Itens normalizados do dataset (uma linha por SKU/listing/keyword)
create table if not exists market_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  dataset_id uuid not null references market_datasets(id) on delete cascade,
  channel text not null,         -- meli|shopee|amazon|site|unknown
  category text not null,        -- ex.: Moda > Camisetas
  identifier text not null,      -- sku/listingId/keyword
  record_type text not null,     -- 'listing'|'keyword'|'category'
  title text null,
  price numeric null,
  price_median numeric null,
  demand_index numeric null,     -- 0..100
  growth_rate numeric null,      -- % período
  sellers_top int null,
  units_sold_est numeric null,
  revenue_est numeric null,
  attributes jsonb not null default '{}', -- ex.: variações presentes
  created_at timestamptz not null default now()
);

-- RLS para market_records
alter table market_records enable row level security;

create policy "market_records_select" on market_records 
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "market_records_insert" on market_records 
  for insert with check((auth.jwt()->>'company_id')::uuid = company_id);

-- Índices para market_records
create index if not exists idx_mr_company_dataset on market_records(company_id, dataset_id);
create index if not exists idx_mr_company_cat on market_records(company_id, category);
create index if not exists idx_mr_company_identifier on market_records(company_id, identifier);
create index if not exists idx_mr_channel_type on market_records(channel, record_type);
create index if not exists idx_mr_demand_growth on market_records(demand_index, growth_rate);

-- Comentários para documentação
comment on table calendar_events is 'Eventos do calendário de e-commerce (sazonais, datas especiais)';
comment on table market_datasets is 'Datasets de mercado importados (CSV/JSON)';
comment on table market_records is 'Registros normalizados dos datasets (listings, keywords, categorias)';

comment on column calendar_events.channel is 'Canal específico ou null para global';
comment on column calendar_events.importance is 'Importância: low, medium, high';
comment on column calendar_events.source is 'Origem: seed, manual, upload';

comment on column market_records.record_type is 'Tipo: listing, keyword, category';
comment on column market_records.demand_index is 'Índice de demanda 0-100';
comment on column market_records.growth_rate is 'Taxa de crescimento do período';
comment on column market_records.attributes is 'Atributos extras (variações, etc.)';

-- Seed inicial de eventos do calendário brasileiro
insert into calendar_events (company_id, date, title, channel, category, importance, source, metadata)
select 
  c.id as company_id,
  date,
  title,
  channel,
  category,
  importance,
  'seed' as source,
  metadata
from companies c
cross join (
  values
    ('2025-01-01', 'Ano Novo', null, 'Todos', 'medium', '{"description": "Início do ano, promoções de renovação"}'),
    ('2025-02-14', 'Dia dos Namorados', null, 'Presentes', 'high', '{"description": "Data romântica, presentes e experiências"}'),
    ('2025-03-08', 'Dia da Mulher', null, 'Moda', 'high', '{"description": "Celebração feminina, moda e beleza"}'),
    ('2025-04-21', 'Tiradentes', null, 'Todos', 'low', '{"description": "Feriado nacional"}'),
    ('2025-05-01', 'Dia do Trabalhador', null, 'Todos', 'low', '{"description": "Feriado nacional"}'),
    ('2025-05-05', 'Shopee 5.5', 'shopee', 'Todos', 'high', '{"description": "Mega campanha Shopee"}'),
    ('2025-05-11', 'Dia das Mães', null, 'Presentes', 'high', '{"description": "Maior data comercial do ano"}'),
    ('2025-06-06', 'Shopee 6.6', 'shopee', 'Todos', 'high', '{"description": "Mega campanha Shopee"}'),
    ('2025-06-12', 'Dia dos Namorados', null, 'Presentes', 'medium', '{"description": "Segunda data romântica"}'),
    ('2025-08-08', 'Shopee 8.8', 'shopee', 'Todos', 'high', '{"description": "Mega campanha Shopee"}'),
    ('2025-08-11', 'Dia dos Pais', null, 'Presentes', 'high', '{"description": "Celebração paterna"}'),
    ('2025-09-07', 'Independência', null, 'Todos', 'low', '{"description": "Feriado nacional"}'),
    ('2025-10-12', 'Dia das Crianças', null, 'Brinquedos', 'high', '{"description": "Dia das crianças, brinquedos e jogos"}'),
    ('2025-10-15', 'Dia do Professor', null, 'Livros', 'medium', '{"description": "Homenagem aos educadores"}'),
    ('2025-11-02', 'Finados', null, 'Todos', 'low', '{"description": "Feriado nacional"}'),
    ('2025-11-15', 'Proclamação da República', null, 'Todos', 'low', '{"description": "Feriado nacional"}'),
    ('2025-11-29', 'Black Friday', null, 'Todos', 'high', '{"description": "Maior evento de descontos do ano"}'),
    ('2025-12-08', 'Imaculada Conceição', null, 'Todos', 'low', '{"description": "Feriado religioso"}'),
    ('2025-12-25', 'Natal', null, 'Presentes', 'high', '{"description": "Celebração natalina, presentes e decoração"}'),
    ('2025-12-31', 'Réveillon', null, 'Festa', 'medium', '{"description": "Virada do ano, festas e comemorações"}')
) as events(date, title, channel, category, importance, metadata)
where not exists (
  select 1 from calendar_events ce 
  where ce.company_id = c.id 
  and ce.date = events.date::date 
  and ce.title = events.title
);
