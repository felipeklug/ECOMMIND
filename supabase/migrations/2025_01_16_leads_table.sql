-- =====================================================
-- Leads Table Migration - PR#20.0
-- Captura de leads do site de marketing
-- =====================================================

-- =====================================================
-- TABELA DE LEADS
-- =====================================================

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text null,
  company text null,
  interest text[] not null default '{}',
  message text null,
  utm jsonb not null default '{}'::jsonb,
  ip_address inet null,
  user_agent text null,
  referer text null,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  assigned_to uuid null references profiles(id),
  contacted_at timestamptz null,
  qualified_at timestamptz null,
  converted_at timestamptz null,
  notes text null,
  score integer null check (score >= 0 and score <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para performance
create index if not exists idx_leads_email on leads(email);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_created_at on leads(created_at desc);
create index if not exists idx_leads_assigned_to on leads(assigned_to) where assigned_to is not null;
create index if not exists idx_leads_interest on leads using gin(interest);
create index if not exists idx_leads_utm on leads using gin(utm);

-- Índice único para email (evitar duplicatas)
create unique index if not exists idx_leads_email_unique on leads(email);

-- =====================================================
-- TABELA DE LEAD ACTIVITIES
-- =====================================================

create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  activity_type text not null check (activity_type in (
    'created', 'contacted', 'email_sent', 'email_opened', 'email_clicked',
    'call_made', 'meeting_scheduled', 'demo_requested', 'qualified', 
    'proposal_sent', 'converted', 'lost', 'note_added'
  )),
  title text not null,
  description text null,
  metadata jsonb not null default '{}'::jsonb,
  performed_by uuid null references profiles(id),
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Índices para activities
create index if not exists idx_lead_activities_lead_id on lead_activities(lead_id);
create index if not exists idx_lead_activities_type on lead_activities(activity_type);
create index if not exists idx_lead_activities_performed_at on lead_activities(performed_at desc);
create index if not exists idx_lead_activities_performed_by on lead_activities(performed_by) where performed_by is not null;

-- =====================================================
-- TABELA DE LEAD SOURCES
-- =====================================================

create table if not exists lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  is_active boolean not null default true,
  conversion_rate numeric(5,2) null check (conversion_rate >= 0 and conversion_rate <= 100),
  cost_per_lead numeric(10,2) null check (cost_per_lead >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para sources
create index if not exists idx_lead_sources_active on lead_sources(is_active) where is_active = true;
create index if not exists idx_lead_sources_utm on lead_sources(utm_source, utm_medium, utm_campaign);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular score do lead
create or replace function calculate_lead_score(lead_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  lead_record leads%rowtype;
  score integer := 0;
begin
  select * into lead_record from leads where id = lead_id;
  
  if not found then
    return 0;
  end if;
  
  -- Score base por interesse
  if 'bi' = any(lead_record.interest) then
    score := score + 20;
  end if;
  
  if 'chat360' = any(lead_record.interest) then
    score := score + 15;
  end if;
  
  if 'automacao' = any(lead_record.interest) then
    score := score + 15;
  end if;
  
  if 'integracao' = any(lead_record.interest) then
    score := score + 10;
  end if;
  
  -- Score por ter empresa
  if lead_record.company is not null and length(trim(lead_record.company)) > 0 then
    score := score + 20;
  end if;
  
  -- Score por ter telefone
  if lead_record.phone is not null and length(trim(lead_record.phone)) > 0 then
    score := score + 10;
  end if;
  
  -- Score por ter mensagem
  if lead_record.message is not null and length(trim(lead_record.message)) > 10 then
    score := score + 10;
  end if;
  
  -- Score por fonte UTM
  if lead_record.utm->>'source' = 'google' then
    score := score + 15;
  elsif lead_record.utm->>'source' = 'linkedin' then
    score := score + 20;
  elsif lead_record.utm->>'source' = 'direct' then
    score := score + 10;
  end if;
  
  -- Limitar score entre 0 e 100
  score := greatest(0, least(100, score));
  
  return score;
end;
$$;

-- Função para atualizar timestamp
create or replace function update_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Função para criar atividade automática
create or replace function create_lead_activity()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Atividade de criação
  if tg_op = 'INSERT' then
    insert into lead_activities (lead_id, activity_type, title, description, metadata)
    values (
      new.id,
      'created',
      'Lead criado',
      'Lead criado através do site',
      jsonb_build_object(
        'source', new.utm->>'source',
        'medium', new.utm->>'medium',
        'campaign', new.utm->>'campaign',
        'interests', new.interest
      )
    );
    
    -- Calcular e atualizar score
    update leads 
    set score = calculate_lead_score(new.id)
    where id = new.id;
    
    return new;
  end if;
  
  -- Atividades de mudança de status
  if tg_op = 'UPDATE' then
    if old.status != new.status then
      insert into lead_activities (lead_id, activity_type, title, description, performed_by)
      values (
        new.id,
        case new.status
          when 'contacted' then 'contacted'
          when 'qualified' then 'qualified'
          when 'converted' then 'converted'
          when 'lost' then 'lost'
          else 'note_added'
        end,
        'Status alterado para ' || new.status,
        'Status alterado de ' || old.status || ' para ' || new.status,
        new.assigned_to
      );
    end if;
    
    return new;
  end if;
  
  return null;
end;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para updated_at
create trigger trigger_leads_updated_at
  before update on leads
  for each row
  execute function update_leads_updated_at();

create trigger trigger_lead_sources_updated_at
  before update on lead_sources
  for each row
  execute function update_leads_updated_at();

-- Trigger para atividades automáticas
create trigger trigger_lead_activities_auto
  after insert or update on leads
  for each row
  execute function create_lead_activity();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS
alter table leads enable row level security;
alter table lead_activities enable row level security;
alter table lead_sources enable row level security;

-- Políticas para leads (acesso apenas para admins e vendas)
create policy "leads_select" on leads
  for select using (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'sales', 'manager')
    )
  );

create policy "leads_insert" on leads
  for insert with check (true); -- Qualquer um pode criar lead via site

create policy "leads_update" on leads
  for update using (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'sales', 'manager')
    )
  );

-- Políticas para activities
create policy "lead_activities_select" on lead_activities
  for select using (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'sales', 'manager')
    )
  );

create policy "lead_activities_insert" on lead_activities
  for insert with check (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'sales', 'manager')
    )
  );

-- Políticas para sources
create policy "lead_sources_select" on lead_sources
  for select using (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'sales', 'manager')
    )
  );

create policy "lead_sources_all" on lead_sources
  for all using (
    exists (
      select 1 from profiles 
      where id = (auth.jwt()->>'user_id')::uuid 
      and role in ('admin', 'manager')
    )
  );

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir fontes de lead padrão
insert into lead_sources (name, description, utm_source, utm_medium) values
  ('Site Direto', 'Acesso direto ao site', 'direct', 'none'),
  ('Google Orgânico', 'Busca orgânica no Google', 'google', 'organic'),
  ('Google Ads', 'Anúncios do Google', 'google', 'cpc'),
  ('LinkedIn', 'Rede social LinkedIn', 'linkedin', 'social'),
  ('Facebook', 'Rede social Facebook', 'facebook', 'social'),
  ('Email Marketing', 'Campanhas de email', 'email', 'email'),
  ('Indicação', 'Indicação de clientes', 'referral', 'referral')
on conflict (name) do nothing;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

comment on table leads is 'Leads capturados do site de marketing';
comment on table lead_activities is 'Histórico de atividades dos leads';
comment on table lead_sources is 'Fontes de origem dos leads';

comment on column leads.interest is 'Array de interesses: bi, chat360, automacao, integracao, consultoria, outro';
comment on column leads.utm is 'Dados de UTM para tracking de campanhas';
comment on column leads.score is 'Score calculado automaticamente (0-100)';
comment on column leads.status is 'Status do lead: new, contacted, qualified, converted, lost';
