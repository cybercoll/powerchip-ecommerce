require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Usuários realistas
const users = [
  {
    email: 'joao.silva@email.com',
    password: 'senha123',
    name: 'João Silva'
  },
  {
    email: 'maria.santos@gmail.com',
    password: 'senha123',
    name: 'Maria Santos'
  },
  {
    email: 'pedro.oliveira@hotmail.com',
    password: 'senha123',
    name: 'Pedro Oliveira'
  },
  {
    email: 'ana.costa@yahoo.com',
    password: 'senha123',
    name: 'Ana Costa'
  },
  {
    email: 'carlos.ferreira@outlook.com',
    password: 'senha123',
    name: 'Carlos Ferreira'
  }
];

async function createRealUsers() {
  try {
    console.log('👥 Iniciando criação de usuários realistas...');
    
    for (const user of users) {
      try {
        console.log(`\n🔐 Criando usuário: ${user.email}`);
        
        // Criar usuário apenas no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            name: user.name
          }
        });

        if (authError) {
          if (authError.message.includes('already been registered')) {
            console.log(`⚠️  Usuário ${user.email} já existe`);
          } else {
            console.error(`❌ Erro ao criar ${user.email}:`, authError.message);
          }
        } else {
          console.log(`✅ Usuário criado: ${user.name} (${user.email})`);
        }
        
      } catch (error) {
        console.error(`❌ Erro geral ao criar usuário ${user.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 Criação de usuários finalizada!');
    
    // Verificar quantos usuários foram criados no Auth
    const { data: { users: allUsers }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && allUsers) {
      console.log(`\n📊 Total de usuários no sistema: ${allUsers.length}`);
      allUsers.forEach(user => {
        const name = user.user_metadata?.name || user.email;
        console.log(`   - ${name} (${user.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante a criação de usuários:', error);
    process.exit(1);
  }
}

createRealUsers();