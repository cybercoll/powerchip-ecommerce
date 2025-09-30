# 🚀 Conector GitHub - PowerChip E-commerce

## ✅ Status Atual

- ✅ **Repositório Git local configurado**
- ✅ **Código commitado localmente**
- ✅ **Scripts de conexão criados**
- ⚠️ **Aguardando criação do repositório no GitHub**

## 🔑 Suas Credenciais

- **Usuário:** cybercoll
- **Senha:** S1sAdm1N!@
- **Email:** cybercoll@gmail.com
- **Repositório:** powerchip-ecommerce

## 🎯 Opções para Conectar com GitHub

### Opção 1: Automática com Personal Access Token (RECOMENDADA)

#### Passo 1: Criar Personal Access Token
1. Acesse: https://github.com/settings/tokens
2. Faça login com:
   - **Usuário:** cybercoll
   - **Senha:** S1sAdm1N!@
3. Clique em "Generate new token" → "Generate new token (classic)"
4. Configure:
   - **Nome:** PowerChip E-commerce Token
   - **Expiração:** 90 days
   - **Escopos:** ✅ repo (acesso completo aos repositórios)
5. Clique em "Generate token"
6. **COPIE O TOKEN IMEDIATAMENTE** (só aparece uma vez!)

#### Passo 2: Executar Script Automático
```powershell
# Definir o token (substitua pelo token real)
$env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Executar script de criação
.\scripts\create-github-repo.ps1
```

### Opção 2: Manual via Interface Web

#### Passo 1: Criar Repositório Manualmente
1. Acesse: https://github.com/new
2. Faça login com suas credenciais
3. Configure:
   - **Repository name:** powerchip-ecommerce
   - **Description:** Sistema completo de e-commerce - PowerChip
   - **Visibility:** Public
   - **NÃO** marque "Add a README file"
4. Clique em "Create repository"

#### Passo 2: Fazer Push Manual
```powershell
# Configurar remote
git remote add origin https://github.com/cybercoll/powerchip-ecommerce.git

# Fazer push (será solicitado login)
git push -u origin master
```

Quando solicitado:
- **Username:** cybercoll
- **Password:** [USE O PERSONAL ACCESS TOKEN, NÃO A SENHA]

### Opção 3: Usando GitHub Desktop (Mais Simples)

1. Baixe e instale: https://desktop.github.com/
2. Faça login com suas credenciais
3. Clique em "Add an Existing Repository from your Hard Drive"
4. Selecione a pasta: `C:\Users\domicio.dourado\Desktop\trae\powerchip-ecommerce`
5. Clique em "Publish repository"
6. Configure:
   - **Name:** powerchip-ecommerce
   - **Description:** Sistema completo de e-commerce - PowerChip
   - Desmarque "Keep this code private"
7. Clique em "Publish Repository"

## 🛠️ Scripts Disponíveis

### Script Principal (github-connector.ps1)
```powershell
# Configuração completa
.\scripts\github-connector.ps1 -Action setup

# Fazer push de alterações
.\scripts\github-connector.ps1 -Action push

# Ver status
.\scripts\github-connector.ps1 -Action status

# Configurar token
.\scripts\github-connector.ps1 -Action token
```

### Script de Criação Direta (create-github-repo.ps1)
```powershell
# Com token definido
$env:GITHUB_TOKEN = "seu_token_aqui"
.\scripts\create-github-repo.ps1
```

## 🔧 Troubleshooting

### Erro 401 - Não Autorizado
- **Causa:** GitHub não aceita mais senhas para API
- **Solução:** Use Personal Access Token (Opção 1)

### Erro 404 - Repository not found
- **Causa:** Repositório não existe no GitHub
- **Solução:** Crie o repositório primeiro (Opção 2 ou 3)

### Erro de Push
- **Causa:** Credenciais incorretas ou expiradas
- **Solução:** 
  1. Verifique se o token está correto
  2. Verifique se o token tem escopo 'repo'
  3. Tente fazer push manual

### Git Credential Manager
```powershell
# Limpar credenciais salvas
git config --global --unset credential.helper
git credential-manager-core erase

# Reconfigurar
git config --global credential.helper manager-core
```

## 📋 Checklist Final

- [ ] Criar Personal Access Token no GitHub
- [ ] Executar script de criação OU criar repositório manualmente
- [ ] Verificar se o código foi enviado: https://github.com/cybercoll/powerchip-ecommerce
- [ ] Configurar GitHub Actions (opcional)
- [ ] Configurar deploy automático (opcional)

## 🎉 Próximos Passos

Após conectar com sucesso:

1. **Verificar repositório:** https://github.com/cybercoll/powerchip-ecommerce
2. **Configurar GitHub Actions** para deploy automático
3. **Configurar Webhooks** para integração contínua
4. **Documentar** o processo de desenvolvimento

## 📞 Suporte

Se encontrar problemas:

1. Consulte os arquivos de troubleshooting:
   - `GITHUB-PAT-SETUP.md`
   - `GITHUB-SETUP.md`
   - `TROUBLESHOOTING-SSH.md`

2. Verifique os logs dos scripts

3. Tente a abordagem manual (Opção 2 ou 3)

---

**✨ Seu sistema PowerChip E-commerce está pronto para ser compartilhado no GitHub!**