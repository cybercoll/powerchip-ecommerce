import { chromium, FullConfig } from '@playwright/test';
import { DatabaseService } from '../src/lib/database';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global dos testes...');
  
  // Configurar banco de dados de teste
  await setupTestDatabase();
  
  // Criar usuários de teste
  await createTestUsers();
  
  // Criar produtos de teste
  await createTestProducts();
  
  // Verificar se a aplicação está rodando
  await verifyApplicationRunning(config);
  
  console.log('✅ Setup global concluído!');
}

async function setupTestDatabase() {
  console.log('📊 Configurando banco de dados de teste...');
  
  try {
    const db = new DatabaseService();
    
    // Limpar dados de teste anteriores
    await db.query(`
      DELETE FROM order_items WHERE order_id IN (
        SELECT id FROM orders WHERE user_id IN (
          SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%@powerchip.com.br'
        )
      )
    `);
    
    await db.query(`
      DELETE FROM orders WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%@powerchip.com.br'
      )
    `);
    
    await db.query(`
      DELETE FROM cart_items WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%@powerchip.com.br'
      )
    `);
    
    await db.query(`
      DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%@powerchip.com.br'
    `);
    
    console.log('✅ Banco de dados limpo');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    throw error;
  }
}

async function createTestUsers() {
  console.log('👥 Criando usuários de teste...');
  
  try {
    const db = new DatabaseService();
    
    // Usuário teste comum
    await db.createUser({
      email: 'test@powerchip.com.br',
      password: 'Test123!@#',
      name: 'Usuário Teste',
      role: 'customer'
    });
    
    // Usuário admin
    await db.createUser({
      email: 'admin@powerchip.com.br',
      password: 'Admin123!@#',
      name: 'Admin Teste',
      role: 'admin'
    });
    
    console.log('✅ Usuários de teste criados');
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
    // Não falhar se usuários já existem
  }
}

async function createTestProducts() {
  console.log('📱 Criando produtos de teste...');
  
  try {
    const db = new DatabaseService();
    
    const testProducts = [
      {
        name: 'iPhone 15 Pro Max Teste',
        description: 'iPhone 15 Pro Max para testes automatizados',
        price: 8999.00,
        category: 'smartphones',
        brand: 'Apple',
        stock: 100,
        images: ['/images/iphone-15-pro-max.jpg'],
        specifications: {
          'Tela': '6.7 polegadas',
          'Processador': 'A17 Pro',
          'Memória': '256GB',
          'Câmera': '48MP'
        },
        featured: true,
        active: true
      },
      {
        name: 'Samsung Galaxy S24 Ultra Teste',
        description: 'Samsung Galaxy S24 Ultra para testes automatizados',
        price: 7999.00,
        category: 'smartphones',
        brand: 'Samsung',
        stock: 50,
        images: ['/images/galaxy-s24-ultra.jpg'],
        specifications: {
          'Tela': '6.8 polegadas',
          'Processador': 'Snapdragon 8 Gen 3',
          'Memória': '512GB',
          'Câmera': '200MP'
        },
        featured: true,
        active: true
      },
      {
        name: 'MacBook Pro M3 Teste',
        description: 'MacBook Pro M3 para testes automatizados',
        price: 15999.00,
        category: 'notebooks',
        brand: 'Apple',
        stock: 25,
        images: ['/images/macbook-pro-m3.jpg'],
        specifications: {
          'Tela': '14 polegadas',
          'Processador': 'Apple M3',
          'Memória': '16GB RAM',
          'Armazenamento': '512GB SSD'
        },
        featured: false,
        active: true
      }
    ];
    
    for (const product of testProducts) {
      await db.createProduct(product);
    }
    
    console.log('✅ Produtos de teste criados');
  } catch (error) {
    console.error('❌ Erro ao criar produtos de teste:', error);
    // Não falhar se produtos já existem
  }
}

async function verifyApplicationRunning(config: FullConfig) {
  console.log('🔍 Verificando se a aplicação está rodando...');
  
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
  
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Tentar acessar a página inicial
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Verificar se a página carregou corretamente
    const title = await page.title();
    if (!title.includes('PowerChip')) {
      throw new Error('Aplicação não está respondendo corretamente');
    }
    
    await browser.close();
    console.log('✅ Aplicação está rodando corretamente');
  } catch (error) {
    console.error('❌ Erro ao verificar aplicação:', error);
    throw new Error(`Aplicação não está acessível em ${baseURL}. Certifique-se de que está rodando.`);
  }
}

export default globalSetup;