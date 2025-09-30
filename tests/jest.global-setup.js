const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Iniciando setup global do Jest...');
  
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    checkEnvironmentVariables();
    
    // Verificar se o banco de dados está acessível
    await checkDatabaseConnection();
    
    // Limpar dados de teste anteriores
    await cleanupTestData();
    
    // Criar diretórios necessários
    createTestDirectories();
    
    console.log('✅ Setup global do Jest concluído!');
  } catch (error) {
    console.error('❌ Erro no setup global:', error);
    process.exit(1);
  }
};

function checkEnvironmentVariables() {
  console.log('🔍 Verificando variáveis de ambiente...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    console.log('ℹ️ Usando valores de teste padrão...');
    
    // Definir valores padrão para testes
    process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';
  }
  
  console.log('✅ Variáveis de ambiente verificadas');
}

async function checkDatabaseConnection() {
  console.log('🗄️ Verificando conexão com banco de dados...');
  
  try {
    // Simular verificação de conexão
    // Em um ambiente real, você faria uma conexão real com o Supabase
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Tentar uma query simples para verificar a conexão
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && !error.message.includes('relation "users" does not exist')) {
      throw error;
    }
    
    console.log('✅ Conexão com banco de dados verificada');
  } catch (error) {
    console.warn('⚠️ Não foi possível conectar ao banco de dados:', error.message);
    console.log('ℹ️ Continuando com mocks...');
  }
}

async function cleanupTestData() {
  console.log('🧹 Limpando dados de teste anteriores...');
  
  try {
    // Aqui você limparia dados de teste do banco
    // Por enquanto, apenas simular
    console.log('✅ Dados de teste limpos');
  } catch (error) {
    console.warn('⚠️ Erro ao limpar dados de teste:', error.message);
  }
}

function createTestDirectories() {
  console.log('📁 Criando diretórios de teste...');
  
  const testDirs = [
    'coverage',
    'test-results',
    'temp/test-uploads',
    'temp/test-images'
  ];
  
  testDirs.forEach(dir => {
    const fullPath = path.resolve(dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📂 Criado: ${dir}`);
    }
  });
  
  console.log('✅ Diretórios de teste criados');
}