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

async function fixUserSync() {
  try {
    console.log('🔧 Sincronizando usuários entre Auth e tabela users...');
    
    // Primeiro, vamos ver a estrutura atual da tabela users
    console.log('🔍 Verificando estrutura da tabela users...');
    const { data: existingUsers, error: structureError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError);
    } else {
      console.log('📋 Estrutura da tabela users:', existingUsers?.[0] ? Object.keys(existingUsers[0]) : 'Tabela vazia');
    }
    
    // Buscar usuários do Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao consultar usuários do Auth:', authError);
      return;
    }
    
    console.log(`\n📊 Encontrados ${authUsers?.users?.length || 0} usuários no Auth`);
    
    for (const authUser of authUsers.users) {
      console.log(`\n🔍 Processando usuário: ${authUser.email}`);
      
      // Verificar se já existe na tabela users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Erro ao verificar usuário ${authUser.email}:`, checkError);
        continue;
      }
      
      if (existingUser) {
        console.log(`✅ Usuário ${authUser.email} já existe na tabela users`);
        continue;
      }
      
      // Determinar role e nomes baseado no email
      const role = authUser.email.includes('admin') ? 'admin' : 'client'; // Usar 'client' ao invés de 'customer'
      const firstName = authUser.email.includes('admin') ? 'Administrador' : 'Cliente';
      const lastName = authUser.email.includes('admin') ? 'Sistema' : 'Teste';
      
      // Inserir usuário na tabela users com a estrutura correta
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          password_hash: 'supabase_auth', // Placeholder, pois a autenticação é feita pelo Supabase Auth
          first_name: firstName,
          last_name: lastName,
          role: role,
          active: true,
          email_verified: true
        }, {
          onConflict: 'id'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error(`❌ Erro ao inserir usuário ${authUser.email}:`, insertError);
      } else {
        console.log(`✅ Usuário ${authUser.email} sincronizado com sucesso!`);
        console.log(`   ID: ${newUser.id}`);
        console.log(`   Nome: ${newUser.name}`);
        console.log(`   Role: ${newUser.role}`);
      }
    }
    
    console.log('\n🎉 Sincronização concluída!');
    console.log('\n📋 Credenciais para teste:');
    console.log('\n👤 CLIENTE:');
    console.log('   Email: cliente@powerchip.com.br');
    console.log('   Senha: Cliente123!');
    console.log('\n👨‍💼 ADMINISTRADOR:');
    console.log('   Email: admin@powerchip.com.br');
    console.log('   Senha: Admin123!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixUserSync();