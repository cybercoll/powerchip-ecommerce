const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Function to load environment variables from .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env.local não encontrado');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Carregar variáveis de ambiente
loadEnvLocal();

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDatabase() {
  try {
    console.log('🧹 Iniciando limpeza do banco de dados...');

    // 1. Limpar itens do carrinho
    console.log('Limpando itens do carrinho...');
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .gte('created_at', '1900-01-01');
    
    if (cartError) {
      console.error('Erro ao limpar carrinho:', cartError);
    } else {
      console.log('✅ Itens do carrinho removidos');
    }

    // 2. Limpar itens de pedidos
    console.log('Limpando itens de pedidos...');
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .delete()
      .gte('created_at', '1900-01-01');
    
    if (orderItemsError) {
      console.error('Erro ao limpar itens de pedidos:', orderItemsError);
    } else {
      console.log('✅ Itens de pedidos removidos');
    }

    // 3. Limpar pedidos
    console.log('Limpando pedidos...');
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .gte('created_at', '1900-01-01');
    
    if (ordersError) {
      console.error('Erro ao limpar pedidos:', ordersError);
    } else {
      console.log('✅ Pedidos removidos');
    }

    // 4. Limpar produtos
    console.log('Limpando produtos...');
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .gte('created_at', '1900-01-01');
    
    if (productsError) {
      console.error('Erro ao limpar produtos:', productsError);
    } else {
      console.log('✅ Produtos removidos');
    }

    // 5. Limpar categorias (opcional)
    console.log('Limpando categorias...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .delete()
      .gte('created_at', '1900-01-01');
    
    if (categoriesError) {
      console.error('Erro ao limpar categorias:', categoriesError);
    } else {
      console.log('✅ Categorias removidas');
    }

    console.log('🎉 Limpeza do banco de dados concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  }
}

// Executar a limpeza
clearDatabase()
  .then(() => {
    console.log('Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });