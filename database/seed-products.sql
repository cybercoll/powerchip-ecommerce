-- Insert sample products with realistic data
-- Note: In production, you would replace these with actual product images

-- Carregadores
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Carregador USB-C 65W PowerChip Pro',
  'Carregador rápido USB-C de 65W com tecnologia GaN, compatível com smartphones, tablets e notebooks. Proteção contra sobrecarga e superaquecimento.',
  89.90,
  50,
  c.id,
  '/images/products/carregador-usb-c-65w.jpg',
  ARRAY['/images/products/carregador-usb-c-65w-1.jpg', '/images/products/carregador-usb-c-65w-2.jpg', '/images/products/carregador-usb-c-65w-3.jpg'],
  '{"potencia": "65W", "tipo_conector": "USB-C", "tecnologia": "GaN", "compatibilidade": "Universal", "garantia": "12 meses", "dimensoes": "6.5 x 6.5 x 3.2 cm", "peso": "120g"}'
FROM categories c WHERE c.name = 'Carregadores';

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Carregador Sem Fio 15W PowerChip Wireless',
  'Base de carregamento sem fio de 15W com tecnologia Qi, compatível com iPhone e Android. LED indicador de status e proteção contra superaquecimento.',
  129.90,
  30,
  c.id,
  '/images/products/carregador-sem-fio-15w.jpg',
  ARRAY['/images/products/carregador-sem-fio-15w-1.jpg', '/images/products/carregador-sem-fio-15w-2.jpg'],
  '{"potencia": "15W", "tecnologia": "Qi Wireless", "compatibilidade": "iPhone 8+, Android Qi", "indicador": "LED", "garantia": "12 meses", "dimensoes": "10 x 10 x 1.2 cm", "peso": "180g"}'
FROM categories c WHERE c.name = 'Carregadores';

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Carregador Veicular 2 USB 3.4A PowerChip Car',
  'Carregador veicular com 2 portas USB, saída total de 3.4A. Proteção contra curto-circuito e LED azul indicador.',
  39.90,
  75,
  c.id,
  '/images/products/carregador-veicular-2usb.jpg',
  ARRAY['/images/products/carregador-veicular-2usb-1.jpg', '/images/products/carregador-veicular-2usb-2.jpg'],
  '{"portas": "2x USB", "corrente_total": "3.4A", "voltagem_entrada": "12-24V", "protecao": "Curto-circuito", "garantia": "6 meses", "dimensoes": "7 x 3.5 x 3.5 cm", "peso": "45g"}'
FROM categories c WHERE c.name = 'Carregadores';

-- Fones de Ouvido
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Fone Bluetooth PowerChip AirPods Pro',
  'Fones de ouvido sem fio com cancelamento ativo de ruído, resistência à água IPX4 e até 30 horas de bateria com o estojo.',
  299.90,
  40,
  c.id,
  '/images/products/fone-bluetooth-airpods-pro.jpg',
  ARRAY['/images/products/fone-bluetooth-airpods-pro-1.jpg', '/images/products/fone-bluetooth-airpods-pro-2.jpg', '/images/products/fone-bluetooth-airpods-pro-3.jpg'],
  '{"conectividade": "Bluetooth 5.3", "cancelamento_ruido": "Ativo", "resistencia_agua": "IPX4", "bateria_fone": "6h", "bateria_estojo": "30h", "garantia": "12 meses", "peso": "5.4g cada"}'
FROM categories c WHERE c.name = 'Fones de Ouvido';

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Headset Gamer PowerChip RGB 7.1',
  'Headset gamer com som surround 7.1, microfone removível, iluminação RGB e almofadas confortáveis para longas sessões.',
  189.90,
  25,
  c.id,
  '/images/products/headset-gamer-rgb-71.jpg',
  ARRAY['/images/products/headset-gamer-rgb-71-1.jpg', '/images/products/headset-gamer-rgb-71-2.jpg'],
  '{"som": "7.1 Surround", "microfone": "Removível", "iluminacao": "RGB", "conectividade": "USB", "compatibilidade": "PC, PS4, PS5", "garantia": "12 meses", "peso": "320g"}'
FROM categories c WHERE c.name = 'Fones de Ouvido';

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Fone de Ouvido com Fio PowerChip Studio',
  'Fone de ouvido profissional com drivers de 40mm, resposta de frequência ampla e cabo destacável de 3 metros.',
  149.90,
  35,
  c.id,
  '/images/products/fone-com-fio-studio.jpg',
  ARRAY['/images/products/fone-com-fio-studio-1.jpg', '/images/products/fone-com-fio-studio-2.jpg'],
  '{"drivers": "40mm", "resposta_frequencia": "20Hz-20kHz", "impedancia": "32 Ohm", "cabo": "3m destacável", "conector": "P2 3.5mm", "garantia": "12 meses", "peso": "280g"}'
FROM categories c WHERE c.name = 'Fones de Ouvido';

-- Celulares
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Smartphone PowerChip X1 Pro 256GB',
  'Smartphone premium com tela AMOLED 6.7", processador octa-core, 12GB RAM, 256GB armazenamento, câmera tripla 108MP e bateria 5000mAh.',
  2499.90,
  15,
  c.id,
  '/images/products/smartphone-x1-pro-256gb.jpg',
  ARRAY['/images/products/smartphone-x1-pro-256gb-1.jpg', '/images/products/smartphone-x1-pro-256gb-2.jpg', '/images/products/smartphone-x1-pro-256gb-3.jpg'],
  '{"tela": "6.7 AMOLED", "processador": "Octa-core 2.8GHz", "ram": "12GB", "armazenamento": "256GB", "camera_principal": "108MP", "bateria": "5000mAh", "sistema": "Android 14", "garantia": "12 meses"}'
FROM categories c WHERE c.name = 'Celulares';

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Smartphone PowerChip Lite 128GB',
  'Smartphone intermediário com tela IPS 6.1", processador quad-core, 6GB RAM, 128GB armazenamento, câmera dupla 48MP e bateria 4000mAh.',
  899.90,
  25,
  c.id,
  '/images/products/smartphone-lite-128gb.jpg',
  ARRAY['/images/products/smartphone-lite-128gb-1.jpg', '/images/products/smartphone-lite-128gb-2.jpg'],
  '{"tela": "6.1 IPS", "processador": "Quad-core 2.0GHz", "ram": "6GB", "armazenamento": "128GB", "camera_principal": "48MP", "bateria": "4000mAh", "sistema": "Android 13", "garantia": "12 meses"}'
FROM categories c WHERE c.name = 'Celulares';

-- Caixas de Som
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Caixa de Som Bluetooth PowerChip Bass 50W',
  'Caixa de som portátil com 50W RMS, Bluetooth 5.0, resistência à água IPX7, bateria de 20 horas e graves potentes.',
  249.90,
  30,
  c.id,
  '/images/products/caixa-som-bluetooth-bass-50w.jpg',
  ARRAY['/images/products/caixa-som-bluetooth-bass-50w-1.jpg', '/images/products/caixa-som-bluetooth-bass-50w-2.jpg'],
  '{"potencia": "50W RMS", "conectividade": "Bluetooth 5.0", "resistencia_agua": "IPX7", "bateria": "20 horas", "alcance": "10 metros", "garantia": "12 meses", "peso": "1.2kg"}'
FROM categories c WHERE c.name = 'Caixas de Som';

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Caixa de Som JBL PowerChip Mini 20W',
  'Caixa de som compacta com 20W, Bluetooth, entrada auxiliar, bateria de 12 horas e design portátil.',
  129.90,
  45,
  c.id,
  '/images/products/caixa-som-mini-20w.jpg',
  ARRAY['/images/products/caixa-som-mini-20w-1.jpg', '/images/products/caixa-som-mini-20w-2.jpg'],
  '{"potencia": "20W", "conectividade": "Bluetooth + P2", "bateria": "12 horas", "alcance": "8 metros", "garantia": "6 meses", "peso": "450g", "dimensoes": "18 x 7 x 7 cm"}'
FROM categories c WHERE c.name = 'Caixas de Som';

-- Power Banks
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Power Bank PowerChip 20000mAh Fast Charge',
  'Bateria portátil de 20000mAh com carregamento rápido 22.5W, 3 portas USB, display LED e proteção múltipla.',
  159.90,
  40,
  c.id,
  '/images/products/power-bank-20000mah-fast.jpg',
  ARRAY['/images/products/power-bank-20000mah-fast-1.jpg', '/images/products/power-bank-20000mah-fast-2.jpg'],
  '{"capacidade": "20000mAh", "potencia_saida": "22.5W", "portas": "3x USB", "display": "LED", "protecao": "Múltipla", "garantia": "12 meses", "peso": "420g"}'
FROM categories c WHERE c.name = 'Power Banks';

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Power Bank PowerChip Slim 10000mAh',
  'Bateria portátil ultra-fina de 10000mAh, carregamento sem fio 10W, USB-C PD 18W e design premium.',
  119.90,
  35,
  c.id,
  '/images/products/power-bank-slim-10000mah.jpg',
  ARRAY['/images/products/power-bank-slim-10000mah-1.jpg', '/images/products/power-bank-slim-10000mah-2.jpg'],
  '{"capacidade": "10000mAh", "carregamento_sem_fio": "10W", "usb_c_pd": "18W", "design": "Ultra-fino", "garantia": "12 meses", "peso": "220g", "espessura": "1.2cm"}'
FROM categories c WHERE c.name = 'Power Banks';

-- Notebooks
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Notebook PowerChip Pro 15.6" i7 16GB 512GB SSD',
  'Notebook profissional com processador Intel i7 11ª geração, 16GB RAM, SSD 512GB, tela Full HD IPS e placa de vídeo dedicada.',
  3999.90,
  10,
  c.id,
  '/images/products/notebook-pro-156-i7.jpg',
  ARRAY['/images/products/notebook-pro-156-i7-1.jpg', '/images/products/notebook-pro-156-i7-2.jpg', '/images/products/notebook-pro-156-i7-3.jpg'],
  '{"processador": "Intel i7-1165G7", "ram": "16GB DDR4", "armazenamento": "512GB SSD", "tela": "15.6 Full HD IPS", "placa_video": "NVIDIA MX450", "sistema": "Windows 11", "garantia": "12 meses", "peso": "1.8kg"}'
FROM categories c WHERE c.name = 'Notebooks';

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url, images, specifications) 
SELECT 
  'Notebook PowerChip Student 14" i5 8GB 256GB SSD',
  'Notebook para estudantes com processador Intel i5, 8GB RAM, SSD 256GB, tela HD e bateria de longa duração.',
  2299.90,
  20,
  c.id,
  '/images/products/notebook-student-14-i5.jpg',
  ARRAY['/images/products/notebook-student-14-i5-1.jpg', '/images/products/notebook-student-14-i5-2.jpg'],
  '{"processador": "Intel i5-1035G1", "ram": "8GB DDR4", "armazenamento": "256GB SSD", "tela": "14 HD", "placa_video": "Intel UHD", "sistema": "Windows 11", "garantia": "12 meses", "peso": "1.5kg"}'
FROM categories c WHERE c.name = 'Notebooks';

-- Update stock quantities to simulate real inventory
UPDATE products SET stock_quantity = 
  CASE 
    WHEN price > 2000 THEN FLOOR(RANDOM() * 15) + 5  -- High-end products: 5-20 units
    WHEN price > 500 THEN FLOOR(RANDOM() * 30) + 10   -- Mid-range products: 10-40 units
    ELSE FLOOR(RANDOM() * 50) + 20                    -- Budget products: 20-70 units
  END;