# 🚀 Guia para Subir o PowerChip E-commerce no GitHub

## 📋 Status Atual

✅ **Git configurado** com usuário `cybercoll`  
✅ **Projeto commitado** localmente  
❌ **Repositório GitHub** precisa ser criado  

## 🔧 Passos para Criar o Repositório no GitHub

### 1. Acesse o GitHub

1. Abra seu navegador e vá para: https://github.com
2. Faça login com suas credenciais:
   - **Usuário**: `cybercoll`
   - **Senha**: `S1sAdm1N!@`

### 2. Criar Novo Repositório

1. **Clique no botão "+"** no canto superior direito
2. **Selecione "New repository"**
3. **Configure o repositório:**
   - **Repository name**: `powerchip-ecommerce`
   - **Description**: `Sistema completo de e-commerce com admin, pagamentos e automação`
   - **Visibility**: `Public` (ou Private se preferir)
   - **NÃO marque** "Add a README file"
   - **NÃO marque** "Add .gitignore"
   - **NÃO marque** "Choose a license"

4. **Clique em "Create repository"**

### 3. Fazer Push do Código

Após criar o repositório, execute estes comandos no terminal:

```powershell
# Verificar se o remote está configurado
git remote -v

# Se não estiver, adicionar o remote
git remote add origin https://github.com/cybercoll/powerchip-ecommerce.git

# Fazer push do código
git push -u origin master
```

## 🔐 Autenticação

Quando executar o `git push`, o GitHub pode solicitar autenticação:

### Opção 1: Token de Acesso Pessoal (Recomendado)

1. **Vá para GitHub Settings**: https://github.com/settings/tokens
2. **Clique em "Generate new token (classic)"**
3. **Configure o token:**
   - **Note**: `PowerChip E-commerce Deploy`
   - **Expiration**: `90 days` (ou conforme preferir)
   - **Scopes**: Marque `repo` (acesso completo aos repositórios)
4. **Clique em "Generate token"**
5. **Copie o token** (você não verá novamente!)
6. **Use o token como senha** quando o Git solicitar

### Opção 2: GitHub Desktop (Alternativa)

1. **Baixe o GitHub Desktop**: https://desktop.github.com
2. **Instale e faça login**
3. **Adicione o repositório local**
4. **Publique no GitHub**

## 📁 Estrutura do Projeto

O repositório conterá:

```
powerchip-ecommerce/
├── 📁 src/                    # Código fonte da aplicação
│   ├── app/                   # Páginas Next.js (App Router)
│   ├── components/            # Componentes React
│   ├── contexts/              # Contextos (Auth, Cart)
│   └── lib/                   # Utilitários e configurações
├── 📁 scripts/                # Scripts de deploy e automação
├── 📁 database/               # Schema e seeds do banco
├── 📁 nginx/                  # Configurações do Nginx
├── 📁 n8n/                    # Workflows de automação
├── 📁 tests/                  # Testes E2E e unitários
├── 📄 docker-compose.prod.yml # Docker para produção
├── 📄 Dockerfile              # Imagem Docker da aplicação
├── 📄 DEPLOY-README.md        # Guia completo de deploy
└── 📄 package.json            # Dependências do projeto
```

## 🎯 Próximos Passos Após Upload

### 1. Configurar GitHub Actions (Opcional)

O projeto já inclui workflows em `.github/workflows/` para:
- ✅ **CI/CD automático**
- ✅ **Testes automatizados**
- ✅ **Deploy automático**

### 2. Configurar Webhooks

Para integração com N8N:
- **URL**: `https://powerchip-agente-ia.com.br/webhook/github`
- **Events**: `push`, `pull_request`

### 3. Documentação

O repositório inclui documentação completa:
- 📄 **README.md** - Visão geral do projeto
- 📄 **DEPLOY-README.md** - Guia de deploy
- 📄 **DEPLOYMENT.md** - Deploy avançado
- 📄 **CONFIGURACAO-PRODUCAO.md** - Configurações de produção

## 🔄 Comandos Git Úteis

```powershell
# Verificar status
git status

# Ver histórico de commits
git log --oneline

# Verificar remotes configurados
git remote -v

# Fazer push de mudanças futuras
git add .
git commit -m "Descrição das mudanças"
git push

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Fazer merge
git checkout master
git merge feature/nova-funcionalidade
```

## 🆘 Troubleshooting

### Erro: "Repository not found"
- ✅ Verifique se o repositório foi criado no GitHub
- ✅ Confirme o nome exato: `powerchip-ecommerce`
- ✅ Verifique se está logado na conta correta

### Erro: "Authentication failed"
- ✅ Use um Personal Access Token em vez da senha
- ✅ Verifique se o token tem permissões de `repo`
- ✅ Confirme se o token não expirou

### Erro: "Permission denied"
- ✅ Verifique se você é o dono do repositório
- ✅ Confirme se o repositório não é privado (se você não tem acesso)

## 📞 Comandos Prontos

Após criar o repositório no GitHub, execute:

```powershell
# Navegar para o projeto
cd C:\Users\domicio.dourado\Desktop\trae\powerchip-ecommerce

# Verificar se está tudo commitado
git status

# Fazer push (será solicitada autenticação)
git push -u origin master
```

---

**✨ Após seguir estes passos, seu projeto PowerChip E-commerce estará disponível no GitHub!**

**🔗 URL do repositório**: https://github.com/cybercoll/powerchip-ecommerce