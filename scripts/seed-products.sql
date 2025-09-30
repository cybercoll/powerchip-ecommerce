-- Script para popular o banco de dados com produtos eletrônicos
-- Execute este script no Supabase SQL Editor

-- Inserir categorias
INSERT INTO categories (name, description) VALUES
('Smartphones', 'Smartphones e acessórios móveis'),
('Audio', 'Fones de ouvido, caixas de som e equipamentos de áudio'),
('Carregadores', 'Carregadores, cabos e power banks'),
('Gaming', 'Equipamentos para jogos e periféricos'),
('Notebooks', 'Laptops e notebooks para trabalho e jogos')
ON CONFLICT (name) DO NOTHING;

-- Inserir produtos
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, specifications) VALUES
(
  'Smartphone PowerChip Pro Max',
  'Smartphone premium com tela OLED de 6.7 polegadas, câmera tripla de 108MP, processador octa-core e bateria de longa duração.',
  2499.99,
  25,
  (SELECT id FROM categories WHERE name = 'Smartphones'),
  '/images/smartphone-pro.svg',
  '{
    "tela": "6.7 OLED 120Hz",
    "camera": "108MP + 12MP + 12MP",
    "processador": "Snapdragon 8 Gen 2",
    "memoria": "256GB",
    "ram": "12GB",
    "bateria": "5000mAh",
    "sistema": "Android 14"
  }'
),
(
  'Fone Bluetooth PowerChip Elite',
  'Fone de ouvido over-ear com cancelamento ativo de ruído, Bluetooth 5.0 e bateria de até 30 horas.',
  599.99,
  40,
  (SELECT id FROM categories WHERE name = 'Audio'),
  '/images/fone-bluetooth.svg',
  '{
    "conectividade": "Bluetooth 5.0",
    "bateria": "30 horas",
    "cancelamento_ruido": "Ativo (ANC)",
    "drivers": "40mm",
    "peso": "280g",
    "carregamento": "USB-C"
  }'
),
(
  'Carregador USB-C PowerChip Fast',
  'Carregador rápido USB-C de 65W com cabo de 1.5m, compatível com smartphones, tablets e notebooks.',
  89.99,
  100,
  (SELECT id FROM categories WHERE name = 'Carregadores'),
  '/images/carregador-usb-c.svg',
  '{
    "potencia": "65W",
    "cabo": "1.5m USB-C",
    "compatibilidade": "Universal",
    "tecnologia": "Fast Charge 3.0",
    "protecao": "Sobrecarga e superaquecimento"
  }'
),
(
  'Caixa de Som Bluetooth PowerChip Bass',
  'Caixa de som portátil com 20W RMS, resistente à água IPX7 e conectividade Bluetooth 5.0.',
  299.99,
  35,
  (SELECT id FROM categories WHERE name = 'Audio'),
  '/images/caixa-som-bluetooth.svg',
  '{
    "potencia": "20W RMS",
    "conectividade": "Bluetooth 5.0",
    "resistencia": "IPX7",
    "bateria": "12 horas",
    "alcance": "10 metros",
    "peso": "650g"
  }'
),
(
  'Power Bank PowerChip Ultra 20000mAh',
  'Carregador portátil de 20000mAh com display digital, carregamento rápido e múltiplas portas USB.',
  199.99,
  60,
  (SELECT id FROM categories WHERE name = 'Carregadores'),
  '/images/power-bank.svg',
  '{
    "capacidade": "20000mAh",
    "portas": "2x USB-A + 1x USB-C",
    "display": "LED Digital",
    "carregamento_rapido": "18W",
    "peso": "420g",
    "dimensoes": "15x7x2.5cm"
  }'
),
(
  'Notebook Gamer PowerChip X1',
  'Notebook gamer com processador Intel i7, placa de vídeo RTX 4060, 16GB RAM e SSD 512GB.',
  4999.99,
  15,
  (SELECT id FROM categories WHERE name = 'Notebooks'),
  '/images/notebook-gamer.svg',
  '{
    "processador": "Intel Core i7-12700H",
    "placa_video": "NVIDIA RTX 4060 8GB",
    "memoria": "16GB DDR4",
    "armazenamento": "512GB SSD NVMe",
    "tela": "15.6 Full HD 144Hz",
    "sistema": "Windows 11"
  }'
),
(
  'Mouse Gamer PowerChip Pro',
  'Mouse gamer com sensor óptico de 16000 DPI, 7 botões programáveis e iluminação RGB.',
  149.99,
  80,
  (SELECT id FROM categories WHERE name = 'Gaming'),
  '/images/mouse-gamer.svg',
  '{
    "sensor": "Óptico 16000 DPI",
    "botoes": "7 programáveis",
    "iluminacao": "RGB 16.7M cores",
    "conectividade": "USB com fio",
    "peso": "95g",
    "cabo": "1.8m trançado"
  }'
),
(
  'Teclado Mecânico PowerChip RGB',
  'Teclado mecânico com switches Cherry MX Red, iluminação RGB por tecla e layout ABNT2.',
  399.99,
  45,
  (SELECT id FROM categories WHERE name = 'Gaming'),
  '/images/teclado-mecanico.svg',
  '{
    "switches": "Cherry MX Red",
    "iluminacao": "RGB por tecla",
    "layout": "ABNT2 87 teclas",
    "conectividade": "USB-C destacável",
    "material": "Alumínio anodizado",
    "anti_ghosting": "NKRO"
  }'
);

-- Verificar se os produtos foram inseridos corretamente
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock_quantity,
  c.name as category_name,
  p.image_url
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c.name, p.name;