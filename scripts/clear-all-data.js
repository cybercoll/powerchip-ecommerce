require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearAllData() {
  try {
    console.log('🗑️  Iniciando limpeza completa do banco de dados...');
    
    // Limpar tabelas na ordem correta (respeitando foreign keys)
    console.log('\n📦 Limpando itens de pedidos...');
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (orderItemsError) {
      console.error('❌ Erro ao limpar order_items:', orderItemsError);
    } else {
      console.log('✅ Itens de pedidos removidos');
    }

    console.log('\n🛒 Limpando itens do carrinho...');
    const { error: cartItemsError } = await supabase
      .from('cart_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (cartItemsError) {
      console.error('❌ Erro ao limpar cart_items:', cartItemsError);
    } else {
      console.log('✅ Itens do carrinho removidos');
    }

    console.log('\n📋 Limpando pedidos...');
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (ordersError) {
      console.error('❌ Erro ao limpar orders:', ordersError);
    } else {
      console.log('✅ Pedidos removidos');
    }

    console.log('\n🛍️  Limpando produtos...');
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (productsError) {
      console.error('❌ Erro ao limpar products:', productsError);
    } else {
      console.log('✅ Produtos removidos');
    }

    console.log('\n📂 Limpando categorias...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (categoriesError) {
      console.error('❌ Erro ao limpar categories:', categoriesError);
    } else {
      console.log('✅ Categorias removidas');
    }

    console.log('\n👥 Limpando usuários...');
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (usersError) {
      console.error('❌ Erro ao limpar users:', usersError);
    } else {
      console.log('✅ Usuários removidos');
    }

    console.log('\n🎉 Limpeza completa do banco de dados finalizada!');
    console.log('📊 Todas as tabelas foram zeradas com sucesso.');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  }
}

clearAllData();