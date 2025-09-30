const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Função para carregar variáveis do .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          process.env[key.trim()] = value.slice(1, -1);
        } else {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

// Carregar variáveis de ambiente
loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProducts() {
  try {
    console.log('🌱 Iniciando criação de produtos eletrônicos...');
    
    // Primeiro, criar as categorias
    const categories = [
      { name: 'Smartphones', description: 'Smartphones e acessórios móveis' },
      { name: 'Audio', description: 'Fones de ouvido, caixas de som e equipamentos de áudio' },
      { name: 'Carregadores', description: 'Carregadores, cabos e power banks' },
      { name: 'Gaming', description: 'Equipamentos para jogos e periféricos' },
      { name: 'Notebooks', description: 'Laptops e notebooks para trabalho e jogos' }
    ];
    
    console.log('📂 Criando categorias...');
    for (const category of categories) {
      const { error } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'name' });
      
      if (error) {
        console.error(`Erro ao criar categoria ${category.name}:`, error);
      } else {
        console.log(`✅ Categoria criada: ${category.name}`);
      }
    }
    
    // Buscar IDs das categorias
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name');
    
    const categoryMap = {};
    categoriesData?.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Função para criar slug a partir do nome
    function createSlug(name) {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    // Função para criar SKU a partir do nome
    function createSKU(name) {
      return name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .split(' ')
        .map(word => word.substring(0, 3))
        .join('')
        .substring(0, 10) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    }
    
    // Criar produtos (usando apenas colunas que existem na tabela)
    const products = [
      {
        name: 'Smartphone PowerChip Pro Max',
        slug: createSlug('Smartphone PowerChip Pro Max'),
        sku: createSKU('Smartphone PowerChip Pro Max'),
        description: 'Smartphone premium com tela OLED de 6.7 polegadas, câmera tripla de 108MP, processador octa-core e bateria de longa duração.',
        price: 2499.99,
        stock_quantity: 25,
        category_id: categoryMap['Smartphones'],
        image_url: '/images/smartphone-pro.svg'
      },
      {
        name: 'Fone Bluetooth PowerChip Elite',
        slug: createSlug('Fone Bluetooth PowerChip Elite'),
        sku: createSKU('Fone Bluetooth PowerChip Elite'),
        description: 'Fone de ouvido over-ear com cancelamento ativo de ruído, Bluetooth 5.0 e bateria de até 30 horas.',
        price: 599.99,
        stock_quantity: 40,
        category_id: categoryMap['Audio'],
        image_url: '/images/fone-bluetooth.svg'
      },
      {
        name: 'Carregador USB-C 65W PowerChip Pro',
        slug: createSlug('Carregador USB-C 65W PowerChip Pro'),
        sku: createSKU('Carregador USB-C 65W PowerChip Pro'),
        description: 'Carregador rápido USB-C de 65W com tecnologia GaN, compatível com smartphones, tablets e notebooks.',
        price: 89.90,
        stock_quantity: 50,
        category_id: categoryMap['Carregadores'],
        image_url: '/images/carregador-usb-c.svg'
      },
      {
        name: 'Mouse Gamer PowerChip Pro',
        slug: createSlug('Mouse Gamer PowerChip Pro'),
        sku: createSKU('Mouse Gamer PowerChip Pro'),
        description: 'Mouse gamer com sensor óptico de 16000 DPI, 7 botões programáveis e iluminação RGB.',
        price: 149.99,
        stock_quantity: 80,
        category_id: categoryMap['Gaming'],
        image_url: '/images/mouse-gamer.svg'
      },
      {
        name: 'Notebook PowerChip Gamer RTX',
        slug: createSlug('Notebook PowerChip Gamer RTX'),
        sku: createSKU('Notebook PowerChip Gamer RTX'),
        description: 'Notebook gamer com processador Intel i7, placa de vídeo RTX 4060, 16GB RAM e SSD 512GB.',
        price: 4999.99,
        stock_quantity: 15,
        category_id: categoryMap['Notebooks'],
        image_url: '/images/notebook-gamer.svg'
      },
      {
        name: 'Teclado Mecânico PowerChip RGB',
        slug: createSlug('Teclado Mecânico PowerChip RGB'),
        sku: createSKU('Teclado Mecânico PowerChip RGB'),
        description: 'Teclado mecânico com switches Cherry MX Red, iluminação RGB por tecla e layout ABNT2.',
        price: 399.99,
        stock_quantity: 45,
        category_id: categoryMap['Gaming'],
        image_url: '/images/teclado-mecanico.svg'
      },
      {
        name: 'Caixa de Som Bluetooth PowerChip Bass',
        slug: createSlug('Caixa de Som Bluetooth PowerChip Bass'),
        sku: createSKU('Caixa de Som Bluetooth PowerChip Bass'),
        description: 'Caixa de som portátil com 50W RMS, Bluetooth 5.0, resistência à água IPX7 e bateria de 20 horas.',
        price: 249.90,
        stock_quantity: 30,
        category_id: categoryMap['Audio'],
        image_url: '/images/caixa-som-bluetooth.svg'
      },
      {
        name: 'Power Bank PowerChip 20000mAh',
        slug: createSlug('Power Bank PowerChip 20000mAh'),
        sku: createSKU('Power Bank PowerChip 20000mAh'),
        description: 'Bateria portátil de 20000mAh com carregamento rápido 22.5W, 3 portas USB e display LED.',
        price: 159.90,
        stock_quantity: 40,
        category_id: categoryMap['Carregadores'],
        image_url: '/images/power-bank.svg'
      }
    ];
    
    console.log('🛍️ Criando produtos...');
    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .insert(product);
      
      if (error) {
        console.error(`Erro ao criar produto ${product.name}:`, error);
      } else {
        console.log(`✅ Produto criado: ${product.name}`);
      }
    }
    
    // Verificar quantos produtos foram criados
    const { data: productsCount } = await supabase
      .from('products')
      .select('id', { count: 'exact' });
    
    console.log(`\n🎉 Seed concluído com sucesso!`);
    console.log(`📊 Total de produtos no banco: ${productsCount?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

// Executar o seed
seedProducts();