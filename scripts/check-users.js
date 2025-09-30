const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Function to load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários na tabela users...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao consultar usuários:', error);
      return;
    }
    
    console.log(`\n📊 Total de usuários encontrados: ${users?.length || 0}`);
    
    if (users && users.length > 0) {
      console.log('\n👥 Usuários na tabela:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Criado em: ${user.created_at}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  Nenhum usuário encontrado na tabela users!');
    }
    
    // Verificar também usuários no Supabase Auth
    console.log('\n🔍 Verificando usuários no Supabase Auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao consultar usuários do Auth:', authError);
      return;
    }
    
    console.log(`\n📊 Total de usuários no Auth: ${authUsers?.users?.length || 0}`);
    
    if (authUsers?.users && authUsers.users.length > 0) {
      console.log('\n🔐 Usuários no Supabase Auth:');
      authUsers.users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log(`   Criado em: ${user.created_at}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkUsers();