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
