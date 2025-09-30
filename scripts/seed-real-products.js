require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Categorias
const categories = [
  {
    name: 'Processadores',
    description: 'CPUs Intel e AMD para desktops e servidores',
    image_url: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400'
  },
  {
    name: 'Placas-Mãe',
    description: 'Motherboards para diferentes sockets e chipsets',
    image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400'
  },
  {
    name: 'Memória RAM',
    description: 'Módulos de memória DDR4 e DDR5',
    image_url: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=400'
  },
  {
    name: 'Placas de Vídeo',
    description: 'GPUs NVIDIA GeForce e AMD Radeon',
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400'
  },
  {
    name: 'Armazenamento',
    description: 'SSDs, HDDs e NVMe para todos os usos',
    image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400'
  },
  {
    name: 'Fontes',
    description: 'Fontes de alimentação modulares e semi-modulares',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
  }
];

// Produtos
const products = [
  {
    name: 'Intel Core i7-13700K',
    description: 'Processador Intel Core i7 de 13ª geração com 16 núcleos e 24 threads. Frequência base de 3.4GHz e boost até 5.4GHz.',
    price: 2299.99,
    stock_quantity: 15,
    category_name: 'Processadores',
    image_url: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600'
  },
  {
    name: 'AMD Ryzen 7 7700X',
    description: 'Processador AMD Ryzen 7 com arquitetura Zen 4, 8 núcleos e 16 threads. Frequência base de 4.5GHz.',
    price: 1899.99,
    stock_quantity: 12,
    category_name: 'Processadores',
    image_url: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600'
  },
  {
    name: 'ASUS ROG Strix Z790-E',
    description: 'Placa-mãe premium para Intel LGA 1700 com WiFi 6E, Bluetooth 5.3 e suporte a DDR5.',
    price: 1599.99,
    stock_quantity: 8,
    category_name: 'Placas-Mãe',
    image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600'
  },
  {
    name: 'MSI MAG B650 Tomahawk',
    description: 'Placa-mãe AMD AM5 com suporte a Ryzen 7000, DDR5 e PCIe 5.0.',
    price: 899.99,
    stock_quantity: 10,
    category_name: 'Placas-Mãe',
    image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600'
  },
  {
    name: 'Corsair Vengeance DDR5 32GB',
    description: 'Kit de memória DDR5-5600 32GB (2x16GB) com dissipadores de calor.',
    price: 799.99,
    stock_quantity: 20,
    category_name: 'Memória RAM',
    image_url: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=600'
  },
  {
    name: 'G.Skill Trident Z5 DDR5 16GB',
    description: 'Memória DDR5-6000 16GB (2x8GB) com RGB e perfil XMP 3.0.',
    price: 599.99,
    stock_quantity: 25,
    category_name: 'Memória RAM',
    image_url: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=600'
  },
  {
    name: 'NVIDIA RTX 4080 Super',
    description: 'Placa de vídeo NVIDIA GeForce RTX 4080 Super com 16GB GDDR6X e Ray Tracing.',
    price: 5999.99,
    stock_quantity: 5,
    category_name: 'Placas de Vídeo',
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600'
  },
  {
    name: 'AMD Radeon RX 7800 XT',
    description: 'GPU AMD Radeon RX 7800 XT com 16GB GDDR6 e arquitetura RDNA 3.',
    price: 3299.99,
    stock_quantity: 7,
    category_name: 'Placas de Vídeo',
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600'
  },
  {
    name: 'Samsung 980 PRO 2TB',
    description: 'SSD NVMe M.2 2TB com velocidades de até 7.000 MB/s de leitura.',
    price: 899.99,
    stock_quantity: 18,
    category_name: 'Armazenamento',
    image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600'
  },
  {
    name: 'WD Black SN850X 1TB',
    description: 'SSD NVMe PCIe 4.0 de 1TB otimizado para gaming com dissipador.',
    price: 649.99,
    stock_quantity: 22,
    category_name: 'Armazenamento',
    image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600'
  },
  {
    name: 'Corsair RM850x 850W',
    description: 'Fonte modular 850W 80+ Gold com certificação Cybenetics A- e garantia de 10 anos.',
    price: 699.99,
    stock_quantity: 14,
    category_name: 'Fontes',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
  },
  {
    name: 'Seasonic Focus GX-750 750W',
    description: 'Fonte semi-modular 750W 80+ Gold com proteções completas e ventilador silencioso.',
    price: 549.99,
    stock_quantity: 16,
    category_name: 'Fontes',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
  }
];

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

async function seedRealProducts() {
  try {
    console.log('🛍️ Iniciando criação de produtos reais...');
    
    // Criar categorias
    console.log('\n📂 Criando categorias...');
    const categoryMap = {};
    
    for (const category of categories) {
      try {
        // Tentar buscar categoria existente primeiro
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id, name')
          .eq('name', category.name)
          .single();
        
        if (existingCategory) {
          console.log(`⚠️  Categoria '${category.name}' já existe`);
          categoryMap[category.name] = existingCategory.id;
        } else {
          // Criar nova categoria
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert(category)
            .select('id, name')
            .single();
          
          if (categoryError) {
            console.error(`❌ Erro ao criar categoria '${category.name}':`, categoryError.message);
          } else {
            console.log(`✅ Categoria criada: ${category.name}`);
            categoryMap[category.name] = newCategory.id;
          }
        }
      } catch (error) {
        console.error(`❌ Erro geral na categoria '${category.name}':`, error.message);
      }
    }
    
    // Criar produtos
    console.log('\n🛒 Criando produtos...');
    let createdCount = 0;
    
    for (const product of products) {
      try {
        const categoryId = categoryMap[product.category_name];
        
        if (!categoryId) {
          console.error(`❌ Categoria '${product.category_name}' não encontrada para produto '${product.name}'`);
          continue;
        }
        
        // Criar produto com campos básicos apenas
         const productData = {
            name: product.name,
            slug: createSlug(product.name),
            sku: createSKU(product.name),
            description: product.description,
            price: product.price,
            stock_quantity: product.stock_quantity,
            category_id: categoryId,
            image_url: product.image_url
          };
        
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select('id, name')
          .single();
        
        if (productError) {
          console.error(`❌ Erro ao criar produto '${product.name}':`, productError.message);
        } else {
          console.log(`✅ Produto criado: ${product.name} - R$ ${product.price}`);
          createdCount++;
        }
        
      } catch (error) {
        console.error(`❌ Erro geral no produto '${product.name}':`, error.message);
      }
    }
    
    console.log(`\n🎉 Criação finalizada! ${Object.keys(categoryMap).length} categorias e ${createdCount} produtos criados.`);
    
    // Verificar produtos criados
    const { data: allProducts, error: countError } = await supabase
      .from('products')
      .select('name, price, stock_quantity');
    
    if (!countError && allProducts) {
      console.log(`\n📊 Total de produtos no sistema: ${allProducts.length}`);
      allProducts.forEach(product => {
        console.log(`   - ${product.name} - R$ ${product.price} (${product.stock_quantity} em estoque)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante a criação de produtos:', error);
    process.exit(1);
  }
}

seedRealProducts();