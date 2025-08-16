-- =====================================================
-- Mercado Livre Integration Migration - PR#10.1
-- OAuth2 integration for Orders, Items, Listings, Inventory, Fees
-- =====================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- =====================================================
-- TABELA DE INTEGRAÇÃO MERCADO LIVRE
-- =====================================================

create table if not exists integrations_meli (
  company_id uuid primary key references companies(id) on delete cascade,
  user_id text not null, -- Mercado Livre user ID
  token_ciphertext text not null,
  refresh_ciphertext text not null,
  scopes text[] not null default '{}',
  last_sync_orders timestamptz null,
  last_sync_listings timestamptz null,
  last_sync_inventory timestamptz null,
  last_sync_fees timestamptz null,
  webhook_secret text null,
  webhook_enabled boolean not null default false,
  sync_enabled boolean not null default true,
  error_count integer not null default 0,
  last_error text null,
  last_error_at timestamptz null,
  site_id text not null default 'MLB', -- MLB (Brasil), MLA (Argentina), etc.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para performance
create index if not exists idx_integrations_meli_sync_enabled on integrations_meli(sync_enabled) where sync_enabled = true;
create index if not exists idx_integrations_meli_last_sync on integrations_meli(last_sync_orders, last_sync_listings, last_sync_inventory, last_sync_fees);
create index if not exists idx_integrations_meli_user_id on integrations_meli(user_id);

-- =====================================================
-- TABELA DE MAPEAMENTO MELI
-- =====================================================

create table if not exists meli_listing_mapping (
  company_id uuid not null references companies(id) on delete cascade,
  meli_id text not null, -- MLBxxxxxxx
  internal_sku text not null,
  listing_type text not null default 'gold_special', -- gold_special, gold_pro, etc.
  status text not null default 'active', -- active, paused, closed
  sync_enabled boolean not null default true,
  last_synced_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, meli_id)
);

-- Índices para mapeamento
create index if not exists idx_meli_listing_mapping_sku on meli_listing_mapping(company_id, internal_sku);
create index if not exists idx_meli_listing_mapping_sync on meli_listing_mapping(sync_enabled) where sync_enabled = true;
create index if not exists idx_meli_listing_mapping_status on meli_listing_mapping(status);

-- =====================================================
-- TABELA DE WEBHOOKS MELI
-- =====================================================

create table if not exists meli_webhook_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  topic text not null, -- orders, items, questions
  resource text not null, -- /orders/123456, /items/MLB123456
  user_id text not null, -- Meli user ID
  application_id text not null, -- App ID
  attempts integer not null default 1,
  sent timestamptz not null,
  received timestamptz not null default now(),
  processed boolean not null default false,
  processed_at timestamptz null,
  error_message text null,
  retry_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Índices para webhooks
create index if not exists idx_meli_webhook_events_company on meli_webhook_events(company_id);
create index if not exists idx_meli_webhook_events_processed on meli_webhook_events(processed, created_at) where not processed;
create index if not exists idx_meli_webhook_events_topic on meli_webhook_events(topic, resource);
create index if not exists idx_meli_webhook_events_user on meli_webhook_events(user_id);

-- =====================================================
-- TABELA DE FEES MELI
-- =====================================================

create table if not exists meli_fees_cache (
  company_id uuid not null references companies(id) on delete cascade,
  meli_id text not null, -- Item ID
  listing_type text not null,
  category_id text not null,
  price numeric(10,2) not null,
  sale_fee_amount numeric(10,2) not null,
  listing_fee_amount numeric(10,2) not null default 0,
  shipping_fee_amount numeric(10,2) not null default 0,
  total_fee_amount numeric(10,2) not null,
  fee_percentage numeric(5,2) not null,
  calculated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  primary key (company_id, meli_id, price)
);

-- Índices para fees cache
create index if not exists idx_meli_fees_cache_expires on meli_fees_cache(expires_at);
create index if not exists idx_meli_fees_cache_category on meli_fees_cache(category_id, listing_type);

-- =====================================================
-- ATUALIZAR TABELAS EXISTENTES PARA MELI
-- =====================================================

-- Adicionar campos específicos do Meli se não existirem
do $$
begin
  -- Verificar se coluna meli_id existe em fact_orders
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'fact_orders' and column_name = 'meli_id'
  ) then
    alter table fact_orders add column meli_id text null;
  end if;
  
  -- Verificar se coluna meli_id existe em dim_products
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'dim_products' and column_name = 'meli_id'
  ) then
    alter table dim_products add column meli_id text null;
  end if;
end $$;

-- Índices para Meli IDs
create index if not exists idx_fact_orders_meli_id on fact_orders(meli_id) where meli_id is not null;
create index if not exists idx_dim_products_meli_id on dim_products(meli_id) where meli_id is not null;

-- =====================================================
-- ATUALIZAR ETL_CHECKPOINTS PARA MELI
-- =====================================================

-- Inserir checkpoints iniciais para Meli
insert into etl_checkpoints (company_id, resource, cursor, updated_at)
select 
  c.id as company_id,
  'meli.' || resource as resource,
  '{"offset": 0, "limit": 50, "last_updated": null}'::jsonb as cursor,
  now() as updated_at
from companies c
cross join (
  values 
    ('orders'),
    ('listings'),
    ('inventory'),
    ('fees')
) as resources(resource)
where exists (select 1 from integrations_meli im where im.company_id = c.id)
on conflict (company_id, resource) do nothing;

-- =====================================================
-- FUNÇÕES AUXILIARES PARA MELI
-- =====================================================

-- Função para criptografar tokens Meli
create or replace function encrypt_meli_token(token_plain text)
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

-- Função para descriptografar tokens Meli
create or replace function decrypt_meli_token(token_ciphertext text)
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

-- Função para atualizar timestamp de sync Meli
create or replace function update_meli_sync_timestamp(
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
      update integrations_meli 
      set last_sync_orders = now(), updated_at = now()
      where company_id = p_company_id;
    when 'listings' then
      update integrations_meli 
      set last_sync_listings = now(), updated_at = now()
      where company_id = p_company_id;
    when 'inventory' then
      update integrations_meli 
      set last_sync_inventory = now(), updated_at = now()
      where company_id = p_company_id;
    when 'fees' then
      update integrations_meli 
      set last_sync_fees = now(), updated_at = now()
      where company_id = p_company_id;
  end case;
end;
$$;

-- Função para limpar fees cache expirado
create or replace function cleanup_meli_fees_cache()
returns void
language plpgsql
security definer
as $$
begin
  delete from meli_fees_cache where expires_at < now();
end;
$$;

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
alter table integrations_meli enable row level security;
alter table meli_listing_mapping enable row level security;
alter table meli_webhook_events enable row level security;
alter table meli_fees_cache enable row level security;

-- Políticas de acesso
create policy "integrations_meli_select" on integrations_meli
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_meli_insert" on integrations_meli
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_meli_update" on integrations_meli
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_meli_delete" on integrations_meli
  for delete using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_listing_mapping_select" on meli_listing_mapping
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_listing_mapping_insert" on meli_listing_mapping
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_listing_mapping_update" on meli_listing_mapping
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_webhook_events_select" on meli_webhook_events
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_webhook_events_insert" on meli_webhook_events
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_webhook_events_update" on meli_webhook_events
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_fees_cache_select" on meli_fees_cache
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_fees_cache_insert" on meli_fees_cache
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "meli_fees_cache_update" on meli_fees_cache
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Trigger para integrations_meli
create or replace function update_integrations_meli_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_integrations_meli_updated_at
  before update on integrations_meli
  for each row
  execute function update_integrations_meli_updated_at();

-- Trigger para meli_listing_mapping
create or replace function update_meli_listing_mapping_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_meli_listing_mapping_updated_at
  before update on meli_listing_mapping
  for each row
  execute function update_meli_listing_mapping_updated_at();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

comment on table integrations_meli is 'Configuração da integração com Mercado Livre por empresa';
comment on table meli_listing_mapping is 'Mapeamento entre listings Meli e SKUs internos';
comment on table meli_webhook_events is 'Log de eventos recebidos via webhook do Mercado Livre';
comment on table meli_fees_cache is 'Cache de fees do Mercado Livre por item e preço';

comment on column integrations_meli.token_ciphertext is 'Access token do Meli criptografado com AES-256';
comment on column integrations_meli.refresh_ciphertext is 'Refresh token do Meli criptografado com AES-256';
comment on column integrations_meli.user_id is 'ID do usuário no Mercado Livre';
comment on column integrations_meli.site_id is 'Site do Mercado Livre (MLB, MLA, etc.)';

-- =====================================================
-- CRON JOB PARA LIMPEZA
-- =====================================================

-- Agendar limpeza de fees cache (se pg_cron estiver disponível)
-- select cron.schedule('cleanup-meli-fees-cache', '0 2 * * *', 'select cleanup_meli_fees_cache();');
