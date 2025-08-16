-- =====================================================
-- ECOMMIND - Seed Data for Testing
-- Dados de exemplo para e-commerce
-- =====================================================

-- Inserir empresa de exemplo
insert into companies (id, name, slug, settings) values 
('550e8400-e29b-41d4-a716-446655440000', 'ECOMMIND Demo Store', 'demo-store', '{"timezone": "America/Sao_Paulo"}')
on conflict (id) do nothing;

-- Inserir perfil de usuário
insert into profiles (id, company_id, email, name, role) values 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@demo.com', 'Admin Demo', 'admin')
on conflict (id) do nothing;

-- =====================================================
-- Produtos de exemplo
-- =====================================================

insert into products (company_id, sku, title, description, product_type, brand, category, weight_kg) values 
('550e8400-e29b-41d4-a716-446655440000', 'SMARTPHONE-001', 'Smartphone XYZ Pro', 'Smartphone top de linha', 'electronics', 'XYZ', 'smartphones', 0.180),
('550e8400-e29b-41d4-a716-446655440000', 'FONE-BT-001', 'Fone Bluetooth ABC', 'Fone sem fio premium', 'electronics', 'ABC', 'audio', 0.250),
('550e8400-e29b-41d4-a716-446655440000', 'CAPA-001', 'Capa Protetora Universal', 'Capa resistente', 'accessories', 'Generic', 'capas', 0.050),
('550e8400-e29b-41d4-a716-446655440000', 'CARREGADOR-001', 'Carregador Rápido USB-C', 'Carregador 65W', 'electronics', 'FastCharge', 'carregadores', 0.120),
('550e8400-e29b-41d4-a716-446655440000', 'CABO-001', 'Cabo USB-C 2m', 'Cabo reforçado', 'accessories', 'CableTech', 'cabos', 0.080)
on conflict (company_id, sku) do nothing;

-- =====================================================
-- Custos dos produtos
-- =====================================================

insert into costs (company_id, sku, cmv, valid_from, source) values 
('550e8400-e29b-41d4-a716-446655440000', 'SMARTPHONE-001', 450.00, '2024-01-01', 'bling'),
('550e8400-e29b-41d4-a716-446655440000', 'FONE-BT-001', 35.00, '2024-01-01', 'bling'),
('550e8400-e29b-41d4-a716-446655440000', 'CAPA-001', 8.50, '2024-01-01', 'manual'),
('550e8400-e29b-41d4-a716-446655440000', 'CARREGADOR-001', 22.00, '2024-01-01', 'bling'),
('550e8400-e29b-41d4-a716-446655440000', 'CABO-001', 12.00, '2024-01-01', 'manual'),
-- Atualização de custos
('550e8400-e29b-41d4-a716-446655440000', 'SMARTPHONE-001', 420.00, '2024-12-01', 'bling'),
('550e8400-e29b-41d4-a716-446655440000', 'FONE-BT-001', 32.00, '2024-12-01', 'bling')
on conflict (company_id, sku, valid_from) do nothing;

-- =====================================================
-- Pedidos de exemplo (últimos 30 dias)
-- =====================================================

-- Pedidos Mercado Livre
insert into orders (company_id, order_id, channel, order_dt, buyer_id, buyer_name, status, payment_method, total_amount, shipping_cost) values 
('550e8400-e29b-41d4-a716-446655440000', 'ML-001', 'meli', current_date - interval '5 days', 'buyer001', 'João Silva', 'delivered', 'pix', 899.90, 15.00),
('550e8400-e29b-41d4-a716-446655440000', 'ML-002', 'meli', current_date - interval '3 days', 'buyer002', 'Maria Santos', 'shipped', 'credit_card', 89.90, 12.00),
('550e8400-e29b-41d4-a716-446655440000', 'ML-003', 'meli', current_date - interval '2 days', 'buyer003', 'Pedro Costa', 'confirmed', 'pix', 45.90, 8.00),
('550e8400-e29b-41d4-a716-446655440000', 'ML-004', 'meli', current_date - interval '1 day', 'buyer004', 'Ana Lima', 'pending', 'boleto', 129.90, 10.00),

-- Pedidos Shopee
('550e8400-e29b-41d4-a716-446655440000', 'SP-001', 'shopee', current_date - interval '4 days', 'sp_buyer001', 'Carlos Oliveira', 'delivered', 'pix', 89.90, 0.00),
('550e8400-e29b-41d4-a716-446655440000', 'SP-002', 'shopee', current_date - interval '2 days', 'sp_buyer002', 'Lucia Ferreira', 'shipped', 'credit_card', 25.90, 0.00),

-- Pedidos Site Próprio
('550e8400-e29b-41d4-a716-446655440000', 'SITE-001', 'site', current_date - interval '6 days', 'site001', 'Roberto Alves', 'delivered', 'pix', 1299.80, 0.00),
('550e8400-e29b-41d4-a716-446655440000', 'SITE-002', 'site', current_date - interval '1 day', 'site002', 'Fernanda Rocha', 'confirmed', 'credit_card', 67.90, 0.00)
on conflict (company_id, order_id) do nothing;

-- =====================================================
-- Itens dos pedidos
-- =====================================================

insert into order_items (company_id, order_id, item_seq, sku, product_title, qty, unit_price, fees_total, shipping_cost, ad_cost) values 
-- ML-001: Smartphone
('550e8400-e29b-41d4-a716-446655440000', 'ML-001', 1, 'SMARTPHONE-001', 'Smartphone XYZ Pro', 1, 899.90, 89.99, 15.00, 25.00),

-- ML-002: Fone Bluetooth
('550e8400-e29b-41d4-a716-446655440000', 'ML-002', 1, 'FONE-BT-001', 'Fone Bluetooth ABC', 1, 89.90, 8.99, 12.00, 5.00),

-- ML-003: Capa + Cabo
('550e8400-e29b-41d4-a716-446655440000', 'ML-003', 1, 'CAPA-001', 'Capa Protetora Universal', 1, 25.90, 2.59, 4.00, 2.00),
('550e8400-e29b-41d4-a716-446655440000', 'ML-003', 2, 'CABO-001', 'Cabo USB-C 2m', 1, 20.00, 2.00, 4.00, 1.50),

-- ML-004: Carregador + Cabo
('550e8400-e29b-41d4-a716-446655440000', 'ML-004', 1, 'CARREGADOR-001', 'Carregador Rápido USB-C', 1, 89.90, 8.99, 5.00, 3.00),
('550e8400-e29b-41d4-a716-446655440000', 'ML-004', 2, 'CABO-001', 'Cabo USB-C 2m', 2, 20.00, 4.00, 5.00, 2.00),

-- SP-001: Fone Bluetooth (Shopee)
('550e8400-e29b-41d4-a716-446655440000', 'SP-001', 1, 'FONE-BT-001', 'Fone Bluetooth ABC', 1, 89.90, 12.59, 0.00, 8.00),

-- SP-002: Capa (Shopee)
('550e8400-e29b-41d4-a716-446655440000', 'SP-002', 1, 'CAPA-001', 'Capa Protetora Universal', 1, 25.90, 3.89, 0.00, 3.00),

-- SITE-001: Smartphone + Acessórios (Site próprio - sem taxas)
('550e8400-e29b-41d4-a716-446655440000', 'SITE-001', 1, 'SMARTPHONE-001', 'Smartphone XYZ Pro', 1, 899.90, 0.00, 0.00, 0.00),
('550e8400-e29b-41d4-a716-446655440000', 'SITE-001', 2, 'FONE-BT-001', 'Fone Bluetooth ABC', 1, 89.90, 0.00, 0.00, 0.00),
('550e8400-e29b-41d4-a716-446655440000', 'SITE-001', 3, 'CARREGADOR-001', 'Carregador Rápido USB-C', 1, 89.90, 0.00, 0.00, 0.00),
('550e8400-e29b-41d4-a716-446655440000', 'SITE-001', 4, 'CAPA-001', 'Capa Protetora Universal', 1, 25.90, 0.00, 0.00, 0.00),
('550e8400-e29b-41d4-a716-446655440000', 'SITE-001', 5, 'CABO-001', 'Cabo USB-C 2m', 2, 20.00, 0.00, 0.00, 0.00),

-- SITE-002: Kit Acessórios
('550e8400-e29b-41d4-a716-446655440000', 'SITE-002', 1, 'CAPA-001', 'Capa Protetora Universal', 1, 25.90, 0.00, 0.00, 0.00),
('550e8400-e29b-41d4-a716-446655440000', 'SITE-002', 2, 'CABO-001', 'Cabo USB-C 2m', 2, 21.00, 0.00, 0.00, 0.00)
on conflict (company_id, order_id, item_seq) do nothing;

-- =====================================================
-- Metas para o mês atual
-- =====================================================

insert into targets (company_id, period, channel, sku, target_units, target_revenue, target_margin_pct) values 
-- Metas Mercado Livre
('550e8400-e29b-41d4-a716-446655440000', date_trunc('month', current_date)::date, 'meli', 'SMARTPHONE-001', 10, 8999.00, 25.0),
('550e8400-e29b-41d4-a716-446655440000', date_trunc('month', current_date)::date, 'meli', 'FONE-BT-001', 50, 4495.00, 40.0),
('550e8400-e29b-41d4-a716-446655440000', date_trunc('month', current_date)::date, 'meli', 'CAPA-001', 100, 2590.00, 60.0),

-- Metas Shopee
('550e8400-e29b-41d4-a716-446655440000', date_trunc('month', current_date)::date, 'shopee', 'FONE-BT-001', 30, 2697.00, 35.0),
('550e8400-e29b-41d4-a716-446655440000', date_trunc('month', current_date)::date, 'shopee', 'CAPA-001', 80, 2072.00, 55.0),

-- Metas Site Próprio
('550e8400-e29b-41d4-a716-446655440000', date_trunc('month', current_date)::date, 'site', 'SMARTPHONE-001', 5, 4499.50, 35.0),
('550e8400-e29b-41d4-a716-446655440000', date_trunc('month', current_date)::date, 'site', 'FONE-BT-001', 20, 1798.00, 45.0)
on conflict (company_id, period, channel, sku) do nothing;

-- =====================================================
-- Orçamentos
-- =====================================================

insert into budgets (company_id, year, month, category, subcategory, amount) values 
('550e8400-e29b-41d4-a716-446655440000', extract(year from current_date)::int, extract(month from current_date)::int, 'ads', 'google', 2000.00),
('550e8400-e29b-41d4-a716-446655440000', extract(year from current_date)::int, extract(month from current_date)::int, 'ads', 'facebook', 1500.00),
('550e8400-e29b-41d4-a716-446655440000', extract(year from current_date)::int, extract(month from current_date)::int, 'ads', 'mercadolivre', 3000.00),
('550e8400-e29b-41d4-a716-446655440000', extract(year from current_date)::int, extract(month from current_date)::int, 'shipping', 'correios', 1000.00),
('550e8400-e29b-41d4-a716-446655440000', extract(year from current_date)::int, extract(month from current_date)::int, 'fees', 'marketplace', 2500.00),
('550e8400-e29b-41d4-a716-446655440000', extract(year from current_date)::int, extract(month from current_date)::int, 'inventory', 'purchase', 15000.00)
on conflict (company_id, year, month, category, subcategory) do nothing;

-- =====================================================
-- Insights de exemplo
-- =====================================================

insert into insights (company_id, agent, module, type, title, summary, confidence, impact, priority, status) values 
('550e8400-e29b-41d4-a716-446655440000', 'bi', 'bi', 'low_margin', 'Margem baixa no Fone Bluetooth ABC', 'O produto FONE-BT-001 está com margem de apenas 8% no Mercado Livre devido a taxas altas', 0.95, 'margin', 'high', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'ops', 'ops', 'trend_up', 'Aumento de vendas em capas', 'Vendas de CAPA-001 aumentaram 40% na última semana', 0.88, 'revenue', 'medium', 'active'),
('550e8400-e29b-41d4-a716-446655440000', 'planning', 'planning', 'target_risk', 'Meta de smartphones em risco', 'Meta mensal de smartphones no ML pode não ser atingida (30% do período, 10% da meta)', 0.75, 'revenue', 'high', 'active')
on conflict (id) do nothing;

-- =====================================================
-- Missões derivadas dos insights
-- =====================================================

insert into missions (company_id, module, title, description, status, priority, assignee_id) values 
('550e8400-e29b-41d4-a716-446655440000', 'bi', 'Revisar preço do Fone Bluetooth', 'Analisar possibilidade de aumento de preço ou negociação de taxas para melhorar margem', 'backlog', 'P1', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440000', 'ops', 'Aumentar estoque de capas', 'Aproveitar tendência de alta e aumentar estoque de capas protetoras', 'planned', 'P2', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440000', 'planning', 'Campanha smartphones ML', 'Criar campanha promocional para smartphones no Mercado Livre', 'in_progress', 'P1', '550e8400-e29b-41d4-a716-446655440001')
on conflict (id) do nothing;

-- =====================================================
-- ETL Checkpoints
-- =====================================================

insert into etl_checkpoints (company_id, source, last_run_at) values
('550e8400-e29b-41d4-a716-446655440000', 'bling.products', current_timestamp - interval '2 hours'),
('550e8400-e29b-41d4-a716-446655440000', 'bling.orders', current_timestamp - interval '1 hour'),
('550e8400-e29b-41d4-a716-446655440000', 'meli.orders', current_timestamp - interval '30 minutes'),
('550e8400-e29b-41d4-a716-446655440000', 'shopee.orders', current_timestamp - interval '45 minutes')
on conflict (company_id, source) do nothing;

-- =====================================================
-- Eventos de E-commerce (Calendário Comercial Brasileiro)
-- =====================================================

-- Criar tabela de eventos se não existir
create table if not exists commercial_events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  event_date date not null,
  event_type text not null, -- 'holiday'|'commercial'|'seasonal'|'special'
  impact_level text default 'medium', -- 'low'|'medium'|'high'|'critical'
  categories text[], -- categorias de produtos mais impactadas
  preparation_days int default 30, -- dias de antecedência para preparação
  created_at timestamptz not null default utc_now()
);

-- Eventos 2025
insert into commercial_events (name, description, event_date, event_type, impact_level, categories, preparation_days) values
-- Janeiro
('Liquidação de Janeiro', 'Liquidação pós-natal e ano novo', '2025-01-02', 'commercial', 'high', '{"fashion","home","electronics"}', 21),
('Volta às Aulas', 'Período de volta às aulas', '2025-01-15', 'seasonal', 'high', '{"education","electronics","fashion"}', 30),

-- Fevereiro
('Carnaval', 'Feriado de Carnaval', '2025-03-03', 'holiday', 'medium', '{"fashion","party","travel"}', 45),
('Dia dos Namorados (Preparação)', 'Preparação para Dia dos Namorados', '2025-02-01', 'commercial', 'high', '{"gifts","jewelry","fashion","beauty"}', 14),

-- Março
('Dia da Mulher', 'Dia Internacional da Mulher', '2025-03-08', 'commercial', 'high', '{"beauty","fashion","jewelry","flowers"}', 21),
('Outono (Início)', 'Início do outono - mudança de estação', '2025-03-20', 'seasonal', 'medium', '{"fashion","home"}', 30),

-- Abril
('Páscoa', 'Feriado de Páscoa', '2025-04-20', 'holiday', 'high', '{"food","gifts","toys"}', 30),
('Dia do Livro', 'Dia Mundial do Livro', '2025-04-23', 'commercial', 'medium', '{"books","education"}', 14),

-- Maio
('Dia das Mães', 'Dia das Mães', '2025-05-11', 'commercial', 'critical', '{"gifts","beauty","jewelry","home","flowers"}', 45),
('Festa Junina (Preparação)', 'Preparação para festas juninas', '2025-05-01', 'seasonal', 'medium', '{"party","food","fashion"}', 30),

-- Junho
('Dia dos Namorados', 'Dia dos Namorados', '2025-06-12', 'commercial', 'critical', '{"gifts","jewelry","fashion","beauty","restaurants"}', 30),
('Festa Junina', 'Festas Juninas', '2025-06-24', 'seasonal', 'high', '{"party","food","fashion"}', 21),
('Inverno (Início)', 'Início do inverno', '2025-06-21', 'seasonal', 'high', '{"fashion","home","heating"}', 45),
('Meio do Ano', 'Promoções de meio de ano', '2025-06-15', 'commercial', 'high', '{"electronics","home","fashion"}', 30),

-- Julho
('Férias Escolares', 'Férias de julho', '2025-07-01', 'seasonal', 'high', '{"travel","toys","entertainment","sports"}', 30),
('Dia dos Avós', 'Dia dos Avós', '2025-07-26', 'commercial', 'medium', '{"gifts","health","books"}', 21),

-- Agosto
('Dia dos Pais', 'Dia dos Pais', '2025-08-10', 'commercial', 'critical', '{"gifts","electronics","sports","tools","fashion"}', 45),
('Dia do Estudante', 'Dia do Estudante', '2025-08-11', 'commercial', 'medium', '{"education","electronics","books"}', 14),

-- Setembro
('Independência do Brasil', 'Feriado da Independência', '2025-09-07', 'holiday', 'low', '{"patriotic"}', 14),
('Primavera (Início)', 'Início da primavera', '2025-09-22', 'seasonal', 'medium', '{"fashion","beauty","home","garden"}', 30),

-- Outubro
('Dia das Crianças', 'Dia das Crianças', '2025-10-12', 'commercial', 'critical', '{"toys","games","electronics","education","fashion"}', 45),
('Halloween', 'Halloween (crescente no Brasil)', '2025-10-31', 'commercial', 'medium', '{"party","costumes","decoration"}', 30),

-- Novembro
('Black Friday', 'Black Friday', '2025-11-28', 'commercial', 'critical', '{"electronics","fashion","home","beauty","sports"}', 60),
('Cyber Monday', 'Cyber Monday', '2025-12-01', 'commercial', 'critical', '{"electronics","software","digital"}', 60),
('Preparação Natal', 'Início das vendas de Natal', '2025-11-01', 'commercial', 'high', '{"gifts","decoration","food","toys"}', 30),

-- Dezembro
('Verão (Início)', 'Início do verão', '2025-12-21', 'seasonal', 'high', '{"fashion","sports","travel","beach"}', 45),
('Natal', 'Natal', '2025-12-25', 'holiday', 'critical', '{"gifts","food","decoration","toys","electronics"}', 60),
('Ano Novo', 'Réveillon', '2025-12-31', 'holiday', 'high', '{"party","fashion","travel","beauty"}', 30),

-- Eventos especiais de e-commerce
('Amazon Prime Day Brasil', 'Prime Day da Amazon no Brasil', '2025-07-15', 'commercial', 'high', '{"electronics","home","books"}', 21),
('Aniversário Mercado Livre', 'Aniversário do Mercado Livre', '2025-08-02', 'commercial', 'high', '{"electronics","home","fashion"}', 30),
('Semana do Brasil (Preparação)', 'Preparação Semana do Brasil', '2025-08-15', 'commercial', 'high', '{"all"}', 21),
('Semana do Brasil', 'Semana do Brasil', '2025-09-01', 'commercial', 'critical', '{"all"}', 45)

on conflict (id) do nothing;
