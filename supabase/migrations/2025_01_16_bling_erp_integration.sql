-- =====================================================
-- Bling ERP Integration Migration - PR#3.2
-- OAuth2 integration for Products, Stock, Orders, Finance
-- =====================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- =====================================================
-- TABELA DE INTEGRAÇÃO BLING
-- =====================================================

create table if not exists integrations_bling (
  company_id uuid primary key references companies(id) on delete cascade,
  token_ciphertext text not null,
  refresh_ciphertext text not null,
  scopes text[] not null default '{}',
  last_sync_products timestamptz null,
  last_sync_orders timestamptz null,
  last_sync_finance timestamptz null,
  webhook_secret text null,
  webhook_enabled boolean not null default false,
  sync_enabled boolean not null default true,
  error_count integer not null default 0,
  last_error text null,
  last_error_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para performance
create index if not exists idx_integrations_bling_sync_enabled on integrations_bling(sync_enabled) where sync_enabled = true;
create index if not exists idx_integrations_bling_last_sync on integrations_bling(last_sync_products, last_sync_orders, last_sync_finance);

-- =====================================================
-- ATUALIZAR TABELAS EXISTENTES PARA BLING
-- =====================================================

-- Adicionar source='bling' nas tabelas existentes se não existir
do $$
begin
  -- Verificar se coluna source existe em dim_products
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'dim_products' and column_name = 'source'
  ) then
    alter table dim_products add column source text not null default 'manual';
  end if;
  
  -- Verificar se coluna source existe em dim_costs
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'dim_costs' and column_name = 'source'
  ) then
    alter table dim_costs add column source text not null default 'manual';
  end if;
end $$;

-- Adicionar external_id para mapeamento com Bling
alter table dim_products add column if not exists external_id text null;
alter table fact_orders add column if not exists external_id text null;
alter table fact_finance_ap add column if not exists external_id text null;
alter table fact_finance_ar add column if not exists external_id text null;

-- Índices para external_id
create index if not exists idx_dim_products_external_id on dim_products(external_id) where external_id is not null;
create index if not exists idx_fact_orders_external_id on fact_orders(external_id) where external_id is not null;
create index if not exists idx_fact_finance_ap_external_id on fact_finance_ap(external_id) where external_id is not null;
create index if not exists idx_fact_finance_ar_external_id on fact_finance_ar(external_id) where external_id is not null;

-- =====================================================
-- TABELA DE MAPEAMENTO BLING
-- =====================================================

create table if not exists bling_product_mapping (
  company_id uuid not null references companies(id) on delete cascade,
  bling_id text not null,
  internal_sku text not null,
  bling_sku text null,
  product_type text not null default 'PA', -- PA (Produto Acabado), MP (Matéria Prima), etc.
  sync_enabled boolean not null default true,
  last_synced_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, bling_id)
);

-- Índices para mapeamento
create index if not exists idx_bling_product_mapping_sku on bling_product_mapping(company_id, internal_sku);
create index if not exists idx_bling_product_mapping_sync on bling_product_mapping(sync_enabled) where sync_enabled = true;

-- =====================================================
-- TABELA DE WEBHOOKS BLING
-- =====================================================

create table if not exists bling_webhook_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  event_type text not null, -- order.created, order.updated, product.updated, etc.
  external_id text not null, -- ID do objeto no Bling
  payload jsonb not null,
  signature text null,
  processed boolean not null default false,
  processed_at timestamptz null,
  error_message text null,
  retry_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Índices para webhooks
create index if not exists idx_bling_webhook_events_company on bling_webhook_events(company_id);
create index if not exists idx_bling_webhook_events_processed on bling_webhook_events(processed, created_at) where not processed;
create index if not exists idx_bling_webhook_events_type on bling_webhook_events(event_type, external_id);

-- =====================================================
-- ATUALIZAR ETL_CHECKPOINTS PARA BLING
-- =====================================================

-- Inserir checkpoints iniciais para Bling
insert into etl_checkpoints (company_id, resource, cursor, updated_at)
select 
  c.id as company_id,
  'bling.' || resource as resource,
  '{"page": 1, "last_updated_at": null}'::jsonb as cursor,
  now() as updated_at
from companies c
cross join (
  values 
    ('products'),
    ('orders'),
    ('finance.ap'),
    ('finance.ar')
) as resources(resource)
where exists (select 1 from integrations_bling ib where ib.company_id = c.id)
on conflict (company_id, resource) do nothing;

-- =====================================================
-- FUNÇÕES AUXILIARES PARA BLING
-- =====================================================

-- Função para criptografar tokens
create or replace function encrypt_bling_token(token_plain text)
returns text
language plpgsql
security definer
as $$
declare
  encryption_key text;
begin
  -- Buscar chave de criptografia das configurações
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

-- Função para descriptografar tokens
create or replace function decrypt_bling_token(token_ciphertext text)
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

-- Função para atualizar timestamp de sync
create or replace function update_bling_sync_timestamp(
  p_company_id uuid,
  p_resource text
)
returns void
language plpgsql
security definer
as $$
begin
  case p_resource
    when 'products' then
      update integrations_bling 
      set last_sync_products = now(), updated_at = now()
      where company_id = p_company_id;
    when 'orders' then
      update integrations_bling 
      set last_sync_orders = now(), updated_at = now()
      where company_id = p_company_id;
    when 'finance' then
      update integrations_bling 
      set last_sync_finance = now(), updated_at = now()
      where company_id = p_company_id;
  end case;
end;
$$;

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
alter table integrations_bling enable row level security;
alter table bling_product_mapping enable row level security;
alter table bling_webhook_events enable row level security;

-- Políticas de acesso
create policy "integrations_bling_select" on integrations_bling
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_bling_insert" on integrations_bling
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_bling_update" on integrations_bling
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "integrations_bling_delete" on integrations_bling
  for delete using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "bling_product_mapping_select" on bling_product_mapping
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "bling_product_mapping_insert" on bling_product_mapping
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "bling_product_mapping_update" on bling_product_mapping
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "bling_webhook_events_select" on bling_webhook_events
  for select using ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "bling_webhook_events_insert" on bling_webhook_events
  for insert with check ((auth.jwt()->>'company_id')::uuid = company_id);

create policy "bling_webhook_events_update" on bling_webhook_events
  for update using ((auth.jwt()->>'company_id')::uuid = company_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Trigger para integrations_bling
create or replace function update_integrations_bling_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_integrations_bling_updated_at
  before update on integrations_bling
  for each row
  execute function update_integrations_bling_updated_at();

-- Trigger para bling_product_mapping
create or replace function update_bling_product_mapping_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_bling_product_mapping_updated_at
  before update on bling_product_mapping
  for each row
  execute function update_bling_product_mapping_updated_at();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

comment on table integrations_bling is 'Configuração da integração com Bling ERP por empresa';
comment on table bling_product_mapping is 'Mapeamento entre produtos Bling e SKUs internos';
comment on table bling_webhook_events is 'Log de eventos recebidos via webhook do Bling';

comment on column integrations_bling.token_ciphertext is 'Access token do Bling criptografado com AES-256';
comment on column integrations_bling.refresh_ciphertext is 'Refresh token do Bling criptografado com AES-256';
comment on column integrations_bling.scopes is 'Escopos OAuth2 concedidos pelo Bling';

-- =====================================================
-- DADOS INICIAIS (SE NECESSÁRIO)
-- =====================================================

-- Inserir configurações padrão se necessário
-- (Será feito via API durante o onboarding)
