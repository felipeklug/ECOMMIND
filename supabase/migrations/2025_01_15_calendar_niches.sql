-- =====================================================
-- Calendar Niches Migration - PR#7.1
-- Evolução do calendário com inteligência por nicho
-- =====================================================

-- Evoluir calendar_events com campos de nicho e origem IA
alter table calendar_events
  add column if not exists niche text null,        -- 'pet','moda','saude','auto',...
  add column if not exists global boolean not null default false, -- true p/ datas "qualquer nicho"
  add column if not exists ai_origin text null;    -- 'seed','curated_ai','manual','upload'

-- Índices para performance
create index if not exists idx_calendar_company_niche on calendar_events(company_id, niche);
create index if not exists idx_calendar_global on calendar_events(global);
create index if not exists idx_calendar_ai_origin on calendar_events(ai_origin);

-- Tabela de mapeamento categoria → nicho
create table if not exists category_niche_map (
  id uuid primary key default gen_random_uuid(),
  marketplace text not null,     -- 'meli','shopee','amazon'
  category_path text not null,   -- ex.: "Calçados, Roupas e Bolsas > Roupas, Calçados e Acessórios"
  niche text not null,           -- 'moda','pet','saude','auto',...
  confidence numeric not null default 0.9,
  created_at timestamptz not null default now()
);

-- Índices para mapeamento
create index if not exists idx_category_niche_marketplace on category_niche_map(marketplace);
create index if not exists idx_category_niche_path on category_niche_map(category_path);
create index if not exists idx_category_niche_niche on category_niche_map(niche);

-- Comentários para documentação
comment on column calendar_events.niche is 'Nicho específico: pet, moda, saude, auto, casa, etc.';
comment on column calendar_events.global is 'Evento global aplicável a todos os nichos';
comment on column calendar_events.ai_origin is 'Origem: seed, curated_ai, manual, upload';

comment on table category_niche_map is 'Mapeamento de categorias de marketplace para nichos';
comment on column category_niche_map.category_path is 'Caminho completo da categoria no marketplace';
comment on column category_niche_map.confidence is 'Confiança do mapeamento (0-1)';

-- Seed inicial de mapeamentos categoria → nicho
insert into category_niche_map (marketplace, category_path, niche, confidence) values
-- Mercado Livre
('meli', 'Animais', 'pet', 0.95),
('meli', 'Calçados, Roupas e Bolsas', 'moda', 0.90),
('meli', 'Beleza e Cuidado Pessoal', 'beleza', 0.90),
('meli', 'Saúde', 'saude', 0.95),
('meli', 'Carros, Motos e Outros', 'auto', 0.90),
('meli', 'Casa, Móveis e Decoração', 'casa', 0.85),
('meli', 'Eletrônicos, Áudio e Vídeo', 'eletronicos', 0.85),
('meli', 'Bebês', 'infantil', 0.90),
('meli', 'Brinquedos e Hobbies', 'infantil', 0.85),
('meli', 'Esportes e Fitness', 'esportes', 0.90),
('meli', 'Games', 'games', 0.95),
('meli', 'Agro', 'agro', 0.95),
('meli', 'Papelaria', 'papelaria', 0.90),
('meli', 'Ferramentas', 'ferramentas', 0.90),

-- Shopee
('shopee', 'Pet Shop', 'pet', 0.95),
('shopee', 'Moda Feminina', 'moda', 0.90),
('shopee', 'Moda Masculina', 'moda', 0.90),
('shopee', 'Beleza e Cuidados Pessoais', 'beleza', 0.90),
('shopee', 'Saúde', 'saude', 0.95),
('shopee', 'Automotivo', 'auto', 0.90),
('shopee', 'Casa e Construção', 'casa', 0.85),
('shopee', 'Eletrônicos', 'eletronicos', 0.85),
('shopee', 'Mãe e Bebê', 'infantil', 0.90),
('shopee', 'Brinquedos', 'infantil', 0.85),
('shopee', 'Esporte e Lazer', 'esportes', 0.90),

-- Amazon
('amazon', 'Pet Shop', 'pet', 0.95),
('amazon', 'Roupas, Calçados e Joias', 'moda', 0.90),
('amazon', 'Beleza', 'beleza', 0.90),
('amazon', 'Saúde e Cuidados Pessoais', 'saude', 0.95),
('amazon', 'Automotivo', 'auto', 0.90),
('amazon', 'Casa e Cozinha', 'casa', 0.85),
('amazon', 'Eletrônicos', 'eletronicos', 0.85),
('amazon', 'Bebês', 'infantil', 0.90),
('amazon', 'Brinquedos e Jogos', 'infantil', 0.85),
('amazon', 'Esportes e Aventura', 'esportes', 0.90),
('amazon', 'Games', 'games', 0.95)
on conflict do nothing;

-- Atualizar eventos seed existentes para marcar como globais
update calendar_events 
set global = true, ai_origin = 'seed'
where source = 'seed' and global is null;

-- Seed de eventos específicos por nicho (Brasil 2025)
insert into calendar_events (company_id, date, title, channel, category, importance, source, niche, global, ai_origin, metadata)
select 
  c.id as company_id,
  date,
  title,
  channel,
  category,
  importance,
  'seed' as source,
  niche,
  false as global,
  'seed' as ai_origin,
  metadata
from companies c
cross join (
  values
    -- PET
    ('2025-04-04', 'Dia Mundial dos Animais de Rua', null, 'Pet', 'high', 'pet', '{"description": "Conscientização sobre animais abandonados"}'),
    ('2025-10-04', 'Dia Mundial dos Animais', null, 'Pet', 'high', 'pet', '{"description": "Celebração mundial dos animais"}'),
    ('2025-09-27', 'Dia do Médico Veterinário', null, 'Pet', 'medium', 'pet', '{"description": "Homenagem aos veterinários"}'),
    
    -- MODA
    ('2025-01-23', 'São Paulo Fashion Week', null, 'Moda', 'high', 'moda', '{"description": "Principal evento de moda do Brasil"}'),
    ('2025-06-21', 'Rio Fashion Week', null, 'Moda', 'high', 'moda', '{"description": "Semana de moda do Rio de Janeiro"}'),
    ('2025-09-15', 'Semana da Moda Sustentável', null, 'Moda', 'medium', 'moda', '{"description": "Foco em moda consciente"}'),
    
    -- SAÚDE
    ('2025-10-01', 'Outubro Rosa', null, 'Saúde', 'high', 'saude', '{"description": "Campanha de prevenção ao câncer de mama"}'),
    ('2025-11-01', 'Novembro Azul', null, 'Saúde', 'high', 'saude', '{"description": "Campanha de prevenção ao câncer de próstata"}'),
    ('2025-09-10', 'Dia Mundial de Prevenção ao Suicídio', null, 'Saúde', 'high', 'saude', '{"description": "Setembro Amarelo"}'),
    
    -- AUTO
    ('2025-10-24', 'Salão do Automóvel', null, 'Auto', 'high', 'auto', '{"description": "Principal evento automotivo do Brasil"}'),
    ('2025-05-25', 'Dia do Motorista', null, 'Auto', 'medium', 'auto', '{"description": "Homenagem aos motoristas"}'),
    
    -- CASA
    ('2025-03-15', 'Feira da Casa', null, 'Casa', 'medium', 'casa', '{"description": "Feira de decoração e móveis"}'),
    ('2025-09-21', 'Dia da Árvore', null, 'Casa', 'medium', 'casa', '{"description": "Plantas e jardinagem"}'),
    
    -- ELETRÔNICOS
    ('2025-01-07', 'CES Las Vegas', null, 'Eletrônicos', 'high', 'eletronicos', '{"description": "Maior feira de tecnologia do mundo"}'),
    ('2025-06-15', 'Dia do Gamer', null, 'Games', 'high', 'games', '{"description": "Celebração dos jogadores"}'),
    
    -- INFANTIL
    ('2025-08-24', 'Dia da Infância', null, 'Infantil', 'high', 'infantil', '{"description": "Celebração das crianças"}'),
    ('2025-11-20', 'Dia da Consciência Negra', null, 'Infantil', 'medium', 'infantil', '{"description": "Educação e diversidade"}'),
    
    -- BELEZA
    ('2025-09-09', 'Dia da Beleza', null, 'Beleza', 'high', 'beleza', '{"description": "Celebração da beleza e autocuidado"}'),
    ('2025-03-08', 'Dia da Mulher', null, 'Beleza', 'high', 'beleza', '{"description": "Empoderamento feminino"}'),
    
    -- ESPORTES
    ('2025-04-06', 'Dia Mundial da Atividade Física', null, 'Esportes', 'medium', 'esportes', '{"description": "Incentivo à prática esportiva"}'),
    ('2025-06-23', 'Dia Olímpico', null, 'Esportes', 'medium', 'esportes', '{"description": "Celebração do esporte olímpico"}')
) as events(date, title, channel, category, importance, niche, metadata)
where not exists (
  select 1 from calendar_events ce 
  where ce.company_id = c.id 
  and ce.date = events.date::date 
  and ce.title = events.title
  and ce.niche = events.niche
);
