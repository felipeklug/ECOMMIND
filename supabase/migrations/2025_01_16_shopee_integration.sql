-- =====================================================
-- Shopee Integration Migration - PR#10.2
-- OAuth2 integration for Orders, Items, Stock, Fees
-- =====================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- =====================================================
-- TABELA DE INTEGRAÇÃO SHOPEE
-- =====================================================

create table if not exists integrations_shopee (
  company_id uuid primary key references companies(id) on delete cascade,
  shop_id text not null, -- Shopee shop ID
  partner_id text not null, -- Shopee partner ID
  token_ciphertext text not null,
  refresh_ciphertext text not null,
  scopes text[] not null default '{}',
  last_sync_orders timestamptz null,
  last_sync_listings timestamptz null,
  last_sync_stock timestamptz null,
  last_sync_fees timestamptz null,
  webhook_secret text null,
  webhook_enabled boolean not null default false,
  sync_enabled boolean not null default true,
  error_count integer not null default 0,
  last_error text null,
  last_error_at timestamptz null,
  region text not null default 'BR', -- BR, SG, MY, TH, VN, PH, TW, ID
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para performance
create index if not exists idx_integrations_shopee_sync_enabled on integrations_shopee(sync_enabled) where sync_enabled = true;
create index if not exists idx_integrations_shopee_last_sync on integrations_shopee(last_sync_orders, last_sync_listings, last_sync_stock, last_sync_fees);
create index if not exists idx_integrations_shopee_shop_id on integrations_shopee(shop_id);
create index if not exists idx_integrations_shopee_partner_id on integrations_shopee(partner_id);

-- =====================================================
-- TABELA DE MAPEAMENTO SHOPEE
-- =====================================================

create table if not exists shopee_item_mapping (
  company_id uuid not null references companies(id) on delete cascade,
  shopee_item_id text not null, -- Shopee item ID
  shopee_model_id text null, -- Shopee variation ID
  internal_sku text not null,
  item_name text not null,
  model_name text null, -- Variation name
  status text not null default 'NORMAL', -- NORMAL, DELETED, BANNED
  sync_enabled boolean not null default true,
  last_synced_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, shopee_item_id, coalesce(shopee_model_id, ''))
);

-- Índices para mapeamento
create index if not exists idx_shopee_item_mapping_sku on shopee_item_mapping(company_id, internal_sku);
create index if not exists idx_shopee_item_mapping_sync on shopee_item_mapping(sync_enabled) where sync_enabled = true;
create index if not exists idx_shopee_item_mapping_status on shopee_item_mapping(status);

-- =====================================================
-- TABELA DE WEBHOOKS SHOPEE
-- =====================================================

create table if not exists shopee_webhook_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  shop_id text not null, -- Shopee shop ID
  event_type text not null, -- order_status, item_update
  data_type text not null, -- order, item
  data_id text not null, -- order_sn, item_id
  timestamp_shopee bigint not null, -- Shopee timestamp
  payload jsonb not null,
  signature text null,
  processed boolean not null default false,
  processed_at timestamptz null,
  error_message text null,
  retry_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Índices para webhooks
create index if not exists idx_shopee_webhook_events_company on shopee_webhook_events(company_id);
create index if not exists idx_shopee_webhook_events_processed on shopee_webhook_events(processed, created_at) where not processed;
create index if not exists idx_shopee_webhook_events_type on shopee_webhook_events(event_type, data_type);
create index if not exists idx_shopee_webhook_events_shop on shopee_webhook_events(shop_id);
create index if not exists idx_shopee_webhook_events_data on shopee_webhook_events(data_type, data_id);

-- =====================================================
-- TABELA DE FEES SHOPEE
-- =====================================================

create table if not exists shopee_fees_cache (
  company_id uuid not null references companies(id) on delete cascade,
  shop_id text not null,
  order_sn text not null,
  item_id text not null,
  model_id text null,
  commission_fee numeric(10,2) not null default 0,
  transaction_fee numeric(10,2) not null default 0,
  payment_fee numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  service_fee numeric(10,2) not null default 0,
  total_fee numeric(10,2) not null default 0,
  calculated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  primary key (company_id, order_sn, item_id, coalesce(model_id, ''))
);

-- Índices para fees cache
create index if not exists idx_shopee_fees_cache_expires on shopee_fees_cache(expires_at);
create index if not exists idx_shopee_fees_cache_order on shopee_fees_cache(order_sn);

-- =====================================================
-- ATUALIZAR TABELAS EXISTENTES PARA SHOPEE
-- =====================================================

-- Adicionar campos específicos do Shopee se não existirem
do $$
begin
  -- Verificar se coluna shopee_order_sn existe em fact_orders
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'fact_orders' and column_name = 'shopee_order_sn'
  ) then
    alter table fact_orders add column shopee_order_sn text null;
  end if;
  
  -- Verificar se coluna shopee_item_id existe em dim_products
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'dim_products' and column_name = 'shopee_item_id'
  ) then
    alter table dim_products add column shopee_item_id text null;
  end if;
  
  -- Verificar se coluna shopee_model_id existe em dim_products
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'dim_products' and column_name = 'shopee_model_id'
  ) then
    alter table dim_products add column shopee_model_id text null;
  end if;
end $$;

-- Índices para Shopee IDs
create index if not exists idx_fact_orders_shopee_order_sn on fact_orders(shopee_order_sn) where shopee_order_sn is not null;
create index if not exists idx_dim_products_shopee_item_id on dim_products(shopee_item_id) where shopee_item_id is not null;
create index if not exists idx_dim_products_shopee_model_id on dim_products(shopee_model_id) where shopee_model_id is not null;

-- =====================================================
-- ATUALIZAR ETL_CHECKPOINTS PARA SHOPEE
-- =====================================================

-- Inserir checkpoints iniciais para Shopee
insert into etl_checkpoints (company_id, resource, cursor, updated_at)
select 
  c.id as company_id,
  'shopee.' || resource as resource,
  '{"page_size": 100, "cursor": "", "last_updated": null}'::jsonb as cursor,
  now() as updated_at
from companies c
cross join (
  values 
    ('orders'),
    ('listings'),
    ('stock'),
    ('fees')
) as resources(resource)
where exists (select 1 from integrations_shopee ish where ish.company_id = c.id)
on conflict (company_id, resource) do nothing;

-- =====================================================
-- FUNÇÕES AUXILIARES PARA SHOPEE
-- =====================================================

-- Função para criptografar tokens Shopee
create or replace function encrypt_shopee_token(token_plain text)
returns text
language plpgsql
security definer
as $$
declare
  encryption_key text;
begin
  encryption_key := current_setting('app.encryption_key', true);
  
  if encryption_key is null or encryption_key = '' then
    raise exception 'Encryption key not configured';
  end if;
  
  return encode(
    encrypt(
      token_plain::bytea,
      encryption_key::bytea,
      'aes'
    ),
    'base64'
  );
end;
$$;

-- Função para descriptografar tokens Shopee
create or replace function decrypt_shopee_token(token_ciphertext text)
returns text
language plpgsql
security definer
as $$
declare
  encryption_key text;
begin
  encryption_key := current_setting('app.encryption_key', true);
  
  if encryption_key is null or encryption_key = '' then
    raise exception 'Encryption key not configured';
  end if;
  
  return convert_from(
    decrypt(
      decode(token_ciphertext, 'base64'),
      encryption_key::bytea,
      'aes'
    ),
    'utf8'
  );
end;
$$;

-- Função para atualizar timestamp de sync Shopee
create or replace function update_shopee_sync_timestamp(
  p_company_id uuid,
  p_resource text
)
returns void
language plpgsql
security definer
as $$
begin
  case p_resource
    when 'orders' then
      update integrations_shopee 
      set last_sync_orders = now(), updated_at = now()
      where company_id = p_company_id;
    when 'listings' then
      update integrations_shopee 
      set last_sync_listings = now(), updated_at = now()
      where company_id = p_company_id;
    when 'stock' then
      update integrations_shopee 
      set last_sync_stock = now(), updated_at = now()
      where company_id = p_company_id;
    when 'fees' then
      update integrations_shopee 
      set last_sync_fees = now(), updated_at = now()
      where company_id = p_company_id;
  end case;
end;
$$;

-- Função para limpar fees cache expirado
create or replace function cleanup_shopee_fees_cache()
returns void
language plpgsql
security definer
as $$
begin
  delete from shopee_fees_cache where expires_at < now();
end;
$$;

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
alter table integrations_shopee enable row level security;
alter table shopee_item_mapping enable row level security;
alter table shopee_webhook_events enable row level security;
alter table shopee_fees_cache enable row level security;

-- Políticas de acesso
create policy "integrations_shopee_select" on integrations_shopee
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_shopee_insert" on integrations_shopee
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_shopee_update" on integrations_shopee
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_shopee_delete" on integrations_shopee
  for delete using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_item_mapping_select" on shopee_item_mapping
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_item_mapping_insert" on shopee_item_mapping
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_item_mapping_update" on shopee_item_mapping
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_webhook_events_select" on shopee_webhook_events
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_webhook_events_insert" on shopee_webhook_events
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_webhook_events_update" on shopee_webhook_events
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_fees_cache_select" on shopee_fees_cache
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_fees_cache_insert" on shopee_fees_cache
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "shopee_fees_cache_update" on shopee_fees_cache
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Trigger para integrations_shopee
create or replace function update_integrations_shopee_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_integrations_shopee_updated_at
  before update on integrations_shopee
  for each row
  execute function update_integrations_shopee_updated_at();

-- Trigger para shopee_item_mapping
create or replace function update_shopee_item_mapping_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_shopee_item_mapping_updated_at
  before update on shopee_item_mapping
  for each row
  execute function update_shopee_item_mapping_updated_at();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

comment on table integrations_shopee is 'Configuração da integração com Shopee por empresa';
comment on table shopee_item_mapping is 'Mapeamento entre items Shopee e SKUs internos';
comment on table shopee_webhook_events is 'Log de eventos recebidos via webhook do Shopee';
comment on table shopee_fees_cache is 'Cache de fees do Shopee por order e item';

comment on column integrations_shopee.token_ciphertext is 'Access token do Shopee criptografado com AES-256';
comment on column integrations_shopee.refresh_ciphertext is 'Refresh token do Shopee criptografado com AES-256';
comment on column integrations_shopee.shop_id is 'ID da loja no Shopee';
comment on column integrations_shopee.partner_id is 'ID do parceiro no Shopee';
comment on column integrations_shopee.region is 'Região do Shopee (BR, SG, MY, etc.)';

-- =====================================================
-- CRON JOB PARA LIMPEZA
-- =====================================================

-- Agendar limpeza de fees cache (se pg_cron estiver disponível)
-- select cron.schedule('cleanup-shopee-fees-cache', '0 3 * * *', 'select cleanup_shopee_fees_cache();');
