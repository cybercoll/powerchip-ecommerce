const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler variáveis do arquivo .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env.local não encontrado');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

const env = loadEnvFile();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUsers() {
  console.log('🔧 Criando usuários de teste...');
  
  try {
    // Criar usuário cliente
    console.log('👤 Criando usuário cliente...');
    const { data: customerAuth, error: customerAuthError } = await supabase.auth.admin.createUser({
      email: 'cliente@powerchip.com.br',
      password: 'Cliente123!',
      email_confirm: true
    });
    
    if (customerAuthError && !customerAuthError.message.includes('already exists')) {
      throw customerAuthError;
    }
    
    if (customerAuth.user) {
      // Criar perfil do cliente na tabela users
      const { error: customerProfileError } = await supabase
        .from('users')
        .upsert({
          id: customerAuth.user.id,
          email: 'cliente@powerchip.com.br',
          name: 'Cliente Teste',
          role: 'customer'
        });
      
      if (customerProfileError && !customerProfileError.message.includes('duplicate')) {
        console.warn('⚠️ Aviso ao criar perfil do cliente:', customerProfileError.message);
      }
    }
    
    console.log('✅ Cliente criado/atualizado');
    
    // Criar usuário administrador
    console.log('👨‍💼 Criando usuário administrador...');
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: 'admin@powerchip.com.br',
      password: 'Admin123!',
      email_confirm: true
    });
    
    if (adminAuthError && !adminAuthError.message.includes('already exists')) {
      throw adminAuthError;
    }
    
    if (adminAuth.user) {
      // Criar perfil do admin na tabela users
      const { error: adminProfileError } = await supabase
        .from('users')
        .upsert({
          id: adminAuth.user.id,
          email: 'admin@powerchip.com.br',
          name: 'Administrador Teste',
          role: 'admin'
        });
      
      if (adminProfileError && !adminProfileError.message.includes('duplicate')) {
        console.warn('⚠️ Aviso ao criar perfil do admin:', adminProfileError.message);
      }
    }
    
    console.log('✅ Admin criado/atualizado');
    
    console.log('\n🎉 Credenciais de teste criadas com sucesso!');
    console.log('\n📋 Credenciais para login:');
    console.log('\n👤 CLIENTE:');
    console.log('   Email: cliente@powerchip.com.br');
    console.log('   Senha: Cliente123!');
    console.log('\n👨‍💼 ADMINISTRADOR:');
    console.log('   Email: admin@powerchip.com.br');
    console.log('   Senha: Admin123!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error.message || error);
    process.exit(1);
  }
  
  process.exit(0);
}

createTestUsers();