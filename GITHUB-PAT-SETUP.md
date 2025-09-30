# Configuração do Personal Access Token (PAT) - GitHub

O GitHub não aceita mais senhas para autenticação via API. É necessário criar um Personal Access Token (PAT).

## Passos para criar um PAT:

### 1. Acesse o GitHub
- Vá para: https://github.com/settings/tokens
- Faça login com suas credenciais:
  - **Usuário:** cybercoll
  - **Senha:** S1sAdm1N!@

### 2. Criar novo token
1. Clique em "Generate new token" → "Generate new token (classic)"
2. Dê um nome descritivo: `PowerChip E-commerce Token`
3. Defina expiração: `90 days` (ou conforme preferir)
4. Selecione os seguintes escopos:
   - ✅ **repo** (acesso completo aos repositórios)
   - ✅ **workflow** (atualizar workflows do GitHub Actions)
   - ✅ **write:packages** (upload de pacotes)
   - ✅ **delete:packages** (deletar pacotes)

### 3. Copiar o token
- Após criar, **COPIE O TOKEN IMEDIATAMENTE**
- ⚠️ **IMPORTANTE:** O token só será mostrado uma vez!
- Salve em local seguro

### 4. Atualizar o script
Após obter o token, execute:

```powershell
# Substitua SEU_TOKEN_AQUI pelo token real
$env:GITHUB_TOKEN = "SEU_TOKEN_AQUI"
.\scripts\github-connector.ps1 -Action setup
```

### 5. Alternativa: Usar Git Credential Manager

```powershell
# Configurar credenciais
git config --global credential.helper manager-core

# Fazer push (será solicitado login)
git push -u origin master
```

Quando solicitado:
- **Username:** cybercoll
- **Password:** [COLE O PAT AQUI, NÃO A SENHA]

## Exemplo de uso com PAT:

```powershell
# Definir token como variável de ambiente
$env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Executar script
.\scripts\github-connector.ps1 -Action setup
```

## Troubleshooting

### Erro 401 - Não Autorizado
- Verifique se o token está correto
- Confirme se os escopos necessários foram selecionados
- Verifique se o token não expirou

### Erro 404 - Repository not found
- O repositório será criado automaticamente pelo script
- Verifique se o nome do usuário está correto

### Erro de rede
- Verifique sua conexão com a internet
- Tente novamente após alguns minutos

## Links úteis
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [Documentação oficial](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git Credential Manager](https://github.com/GitCredentialManager/git-credential-manager)