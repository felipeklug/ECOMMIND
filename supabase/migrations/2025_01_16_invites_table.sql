-- =====================================================
-- Invites Table Migration - PR#20.1
-- Sistema de convites para usuários
-- =====================================================

-- =====================================================
-- TABELA DE CONVITES
-- =====================================================

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'manager', 'operator', 'viewer')),
  token text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_by uuid not null references profiles(id),
  accepted_at timestamptz null,
  accepted_by uuid null references profiles(id),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para performance
create index if not exists idx_invites_company_id on invites(company_id);
create index if not exists idx_invites_email on invites(email);
create index if not exists idx_invites_token on invites(token);
create index if not exists idx_invites_expires_at on invites(expires_at);
create index if not exists idx_invites_active on invites(is_active) where is_active = true;
create index if not exists idx_invites_created_by on invites(created_by);

-- Índice único para email + company (evitar convites duplicados ativos)
create unique index if not exists idx_invites_email_company_active 
  on invites(email, company_id) 
  where is_active = true and accepted_at is null;

-- =====================================================
-- ATUALIZAR TABELA PROFILES
-- =====================================================

-- Adicionar campos se não existirem
do $$
begin
  -- Verificar se coluna role existe
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'profiles' and column_name = 'role'
  ) then
    alter table profiles add column role text not null default 'viewer' 
      check (role in ('admin', 'manager', 'operator', 'viewer'));
  end if;
  
  -- Verificar se coluna prefs existe
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'profiles' and column_name = 'prefs'
  ) then
    alter table profiles add column prefs jsonb not null default '{}'::jsonb;
  end if;
  
  -- Verificar se coluna invited_by existe
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'profiles' and column_name = 'invited_by'
  ) then
    alter table profiles add column invited_by uuid null references profiles(id);
  end if;
end $$;

-- Índices para novos campos
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_prefs on profiles using gin(prefs);
create index if not exists idx_profiles_invited_by on profiles(invited_by) where invited_by is not null;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para gerar token de convite
create or replace function generate_invite_token()
returns text
language plpgsql
security definer
as $$
declare
  token text;
  exists_token boolean;
begin
  loop
    -- Gerar token aleatório de 32 caracteres
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := replace(token, '=', '');
    
    -- Verificar se token já existe
    select exists(select 1 from invites where token = token) into exists_token;
    
    -- Se não existe, usar este token
    if not exists_token then
      exit;
    end if;
  end loop;
  
  return token;
end;
$$;

-- Função para validar convite
create or replace function validate_invite_token(invite_token text)
returns table(
  invite_id uuid,
  company_id uuid,
  email text,
  role text,
  company_name text,
  created_by_name text,
  is_valid boolean,
  error_message text
)
language plpgsql
security definer
as $$
declare
  invite_record invites%rowtype;
  company_record companies%rowtype;
  creator_record profiles%rowtype;
begin
  -- Buscar convite
  select * into invite_record from invites where token = invite_token;
  
  if not found then
    return query select 
      null::uuid, null::uuid, null::text, null::text, null::text, null::text,
      false, 'Convite não encontrado';
    return;
  end if;
  
  -- Verificar se convite está ativo
  if not invite_record.is_active then
    return query select 
      invite_record.id, invite_record.company_id, invite_record.email, invite_record.role,
      null::text, null::text, false, 'Convite foi cancelado';
    return;
  end if;
  
  -- Verificar se convite já foi aceito
  if invite_record.accepted_at is not null then
    return query select 
      invite_record.id, invite_record.company_id, invite_record.email, invite_record.role,
      null::text, null::text, false, 'Convite já foi aceito';
    return;
  end if;
  
  -- Verificar se convite expirou
  if invite_record.expires_at < now() then
    return query select 
      invite_record.id, invite_record.company_id, invite_record.email, invite_record.role,
      null::text, null::text, false, 'Convite expirado';
    return;
  end if;
  
  -- Buscar dados da empresa
  select * into company_record from companies where id = invite_record.company_id;
  
  -- Buscar dados do criador
  select * into creator_record from profiles where id = invite_record.created_by;
  
  -- Retornar dados válidos
  return query select 
    invite_record.id,
    invite_record.company_id,
    invite_record.email,
    invite_record.role,
    company_record.name,
    creator_record.full_name,
    true,
    null::text;
end;
$$;

-- Função para aceitar convite
create or replace function accept_invite(
  invite_token text,
  user_id uuid,
  user_email text
)
returns table(
  success boolean,
  error_message text,
  company_id uuid
)
language plpgsql
security definer
as $$
declare
  invite_record invites%rowtype;
  validation_result record;
begin
  -- Validar convite
  select * into validation_result from validate_invite_token(invite_token);
  
  if not validation_result.is_valid then
    return query select false, validation_result.error_message, null::uuid;
    return;
  end if;
  
  -- Verificar se email do usuário confere
  if lower(user_email) != lower(validation_result.email) then
    return query select false, 'Email não confere com o convite', null::uuid;
    return;
  end if;
  
  -- Buscar convite
  select * into invite_record from invites where token = invite_token;
  
  -- Marcar convite como aceito
  update invites 
  set 
    accepted_at = now(),
    accepted_by = user_id,
    updated_at = now()
  where id = invite_record.id;
  
  -- Atualizar perfil do usuário
  update profiles 
  set 
    company_id = invite_record.company_id,
    role = invite_record.role,
    invited_by = invite_record.created_by,
    updated_at = now()
  where id = user_id;
  
  return query select true, null::text, invite_record.company_id;
end;
$$;

-- Função para limpar convites expirados
create or replace function cleanup_expired_invites()
returns void
language plpgsql
security definer
as $$
begin
  update invites 
  set is_active = false, updated_at = now()
  where expires_at < now() and is_active = true and accepted_at is null;
end;
$$;

-- Função para atualizar timestamp
create or replace function update_invites_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para updated_at
create trigger trigger_invites_updated_at
  before update on invites
  for each row
  execute function update_invites_updated_at();

-- Trigger para gerar token automaticamente
create or replace function set_invite_token()
returns trigger
language plpgsql
as $$
begin
  if new.token is null or new.token = '' then
    new.token = generate_invite_token();
  end if;
  return new;
end;
$$;

create trigger trigger_invites_set_token
  before insert on invites
  for each row
  execute function set_invite_token();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS
alter table invites enable row level security;

-- Políticas para invites
create policy "invites_select" on invites
  for select using (
    company_id = (auth.jwt()->>'company_id')::uuid
    or 
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'manager')
      and company_id = invites.company_id
    )
  );

create policy "invites_insert" on invites
  for insert with check (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'manager')
      and company_id = invites.company_id
    )
  );

create policy "invites_update" on invites
  for update using (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'manager')
      and company_id = invites.company_id
    )
  );

create policy "invites_delete" on invites
  for delete using (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'manager')
      and company_id = invites.company_id
    )
  );

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

comment on table invites is 'Convites para usuários se juntarem a empresas';
comment on column invites.token is 'Token único para aceitar o convite';
comment on column invites.role is 'Papel que o usuário terá: admin, manager, operator, viewer';
comment on column invites.expires_at is 'Data de expiração do convite (padrão: 7 dias)';
comment on column invites.metadata is 'Dados adicionais do convite (mensagem personalizada, etc.)';

comment on function generate_invite_token() is 'Gera token único para convite';
comment on function validate_invite_token(text) is 'Valida se token de convite é válido';
comment on function accept_invite(text, uuid, text) is 'Aceita convite e associa usuário à empresa';
comment on function cleanup_expired_invites() is 'Desativa convites expirados';
