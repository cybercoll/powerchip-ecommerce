# GitHub Connector - PowerChip E-commerce
param(
    [string]$Action = "setup",
    [string]$Token = $env:GITHUB_TOKEN
)

# Configuracoes
$GITHUB_USER = "cybercoll"
$GITHUB_EMAIL = "cybercoll@gmail.com"
$GITHUB_PASSWORD = "S1sAdm1N!@"
$REPO_NAME = "powerchip-ecommerce"
$REPO_URL = "https://github.com/$GITHUB_USER/$REPO_NAME.git"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Get-AuthHeaders {
    if ($Token) {
        Write-Info "Usando Personal Access Token para autenticacao"
        return @{
            "Authorization" = "Bearer $Token"
            "User-Agent" = "PowerChip-Connector"
        }
    } else {
        Write-Info "Usando autenticacao basica (usuario/senha)"
        $auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$GITHUB_USER`:$GITHUB_PASSWORD"))
        return @{
            "Authorization" = "Basic $auth"
            "User-Agent" = "PowerChip-Connector"
        }
    }
}

function Test-GitHubConnection {
    try {
        Write-Info "Testando conexao com GitHub..."
        
        $headers = Get-AuthHeaders
        $response = Invoke-WebRequest -Uri "https://api.github.com/user" -Headers $headers -UseBasicParsing
        $userData = $response.Content | ConvertFrom-Json
        
        Write-Success "Conectado ao GitHub como: $($userData.login)"
        return $true
    } catch {
        if ($_.Exception.Message -like "*401*") {
            Write-Error-Custom "Erro de autenticacao (401): Credenciais invalidas"
            if (-not $Token) {
                Write-Warning-Custom "GitHub nao aceita mais senhas para API. Use um Personal Access Token:"
                Write-Host "1. Va para: https://github.com/settings/tokens" -ForegroundColor Yellow
                Write-Host "2. Crie um novo token com escopo 'repo'" -ForegroundColor Yellow
                Write-Host "3. Execute: `$env:GITHUB_TOKEN = 'seu_token_aqui'" -ForegroundColor Yellow
                Write-Host "4. Execute novamente o script" -ForegroundColor Yellow
            }
        } else {
            Write-Error-Custom "Erro na conexao com GitHub: $($_.Exception.Message)"
        }
        return $false
    }
}

function New-GitHubRepository {
    try {
        Write-Info "Criando repositorio '$REPO_NAME' no GitHub..."
        
        $repoData = @{
            name = $REPO_NAME
            description = "Sistema completo de e-commerce - PowerChip"
            private = $false
            auto_init = $false
        } | ConvertTo-Json
        
        $headers = Get-AuthHeaders
        $headers["Content-Type"] = "application/json"
        
        $response = Invoke-WebRequest -Uri "https://api.github.com/user/repos" -Method POST -Body $repoData -Headers $headers -UseBasicParsing
        $repoInfo = $response.Content | ConvertFrom-Json
        
        Write-Success "Repositorio '$REPO_NAME' criado com sucesso!"
        Write-Info "URL: $($repoInfo.html_url)"
        return $true
    } catch {
        if ($_.Exception.Message -like "*422*" -or $_.Exception.Message -like "*already exists*") {
            Write-Success "Repositorio '$REPO_NAME' ja existe"
            return $true
        }
        Write-Error-Custom "Erro ao criar repositorio: $($_.Exception.Message)"
        return $false
    }
}

function Set-GitConfig {
    try {
        Write-Info "Configurando Git..."
        
        git config --global user.name "$GITHUB_USER"
        git config --global user.email "$GITHUB_EMAIL"
        git config --global credential.helper manager-core
        
        Write-Success "Git configurado com sucesso"
        return $true
    } catch {
        Write-Error-Custom "Erro ao configurar Git: $($_.Exception.Message)"
        return $false
    }
}

function Set-GitRemote {
    try {
        Write-Info "Configurando remote origin..."
        
        git remote remove origin 2>$null
        git remote add origin $REPO_URL
        
        Write-Success "Remote origin configurado: $REPO_URL"
        return $true
    } catch {
        Write-Error-Custom "Erro ao configurar remote: $($_.Exception.Message)"
        return $false
    }
}

function Push-ToGitHub {
    try {
        Write-Info "Fazendo push para GitHub..."
        
        if ($Token) {
            # Usar token para autenticacao
            $repoUrlWithToken = "https://$GITHUB_USER`:$Token@github.com/$GITHUB_USER/$REPO_NAME.git"
            git remote set-url origin $repoUrlWithToken
        }
        
        git push -u origin master
        
        # Restaurar URL original sem credenciais
        git remote set-url origin $REPO_URL
        
        Write-Success "Push realizado com sucesso!"
        return $true
    } catch {
        Write-Error-Custom "Erro ao fazer push: $($_.Exception.Message)"
        Write-Info "Tente fazer push manualmente com: git push -u origin master"
        return $false
    }
}

function Show-Instructions {
    Write-Host ""
    Write-Host "=== PROXIMOS PASSOS ===" -ForegroundColor Green
    Write-Host "1. Acesse: https://github.com/$GITHUB_USER/$REPO_NAME" -ForegroundColor Cyan
    Write-Host "2. Verifique se o codigo foi enviado corretamente" -ForegroundColor Cyan
    Write-Host "3. Configure GitHub Actions (se necessario)" -ForegroundColor Cyan
    Write-Host "4. Configure deploy automatico" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "=== COMANDOS UTEIS ===" -ForegroundColor Yellow
    Write-Host "Push alteracoes: .\scripts\github-connector.ps1 -Action push" -ForegroundColor White
    Write-Host "Ver status: .\scripts\github-connector.ps1 -Action status" -ForegroundColor White
    Write-Host ""
}

# Funcao principal
Write-Host "GitHub Connector - PowerChip E-commerce" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

if (-not $Token) {
    Write-Warning-Custom "Nenhum Personal Access Token fornecido. Tentando com senha..."
    Write-Info "Para melhor seguranca, use: `$env:GITHUB_TOKEN = 'seu_token'"
}

switch ($Action.ToLower()) {
    "setup" {
        Write-Info "Iniciando configuracao completa..."
        
        if (-not (Set-GitConfig)) {
            Write-Error-Custom "Falha na configuracao do Git"
            exit 1
        }
        
        if (-not (Test-GitHubConnection)) {
            Write-Error-Custom "Falha na conexao com GitHub"
            Write-Info "Consulte o arquivo GITHUB-PAT-SETUP.md para instrucoes detalhadas"
            exit 1
        }
        
        if (-not (New-GitHubRepository)) {
            Write-Error-Custom "Falha ao criar repositorio"
            exit 1
        }
        
        if (-not (Set-GitRemote)) {
            Write-Error-Custom "Falha ao configurar remote"
            exit 1
        }
        
        Write-Success "Configuracao completa realizada com sucesso!"
        Write-Info "Repositorio: https://github.com/$GITHUB_USER/$REPO_NAME"
        Show-Instructions
    }
    
    "push" {
        Write-Info "Fazendo push das alteracoes..."
        
        git add .
        $commitMsg = Read-Host "Digite a mensagem do commit (ou Enter para padrao)"
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        
        git commit -m "$commitMsg"
        
        if (Push-ToGitHub) {
            Write-Success "Alteracoes enviadas com sucesso!"
        }
    }
    
    "status" {
        Write-Info "Status do repositorio:"
        Write-Host "URL: https://github.com/$GITHUB_USER/$REPO_NAME" -ForegroundColor Green
        Write-Host "Usuario: $GITHUB_USER" -ForegroundColor Cyan
        Write-Host "Email: $GITHUB_EMAIL" -ForegroundColor Cyan
        
        if ($Token) {
            Write-Host "Autenticacao: Personal Access Token" -ForegroundColor Green
        } else {
            Write-Host "Autenticacao: Usuario/Senha (recomenda-se PAT)" -ForegroundColor Yellow
        }
        
        Write-Host "Status Git:" -ForegroundColor Yellow
        git status --short
    }
    
    "token" {
        Write-Info "Configurando Personal Access Token..."
        $newToken = Read-Host "Digite seu Personal Access Token" -AsSecureString
        $tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($newToken))
        
        $env:GITHUB_TOKEN = $tokenPlain
        Write-Success "Token configurado para esta sessao"
        Write-Info "Para tornar permanente, adicione ao seu perfil do PowerShell:"
        Write-Host "`$env:GITHUB_TOKEN = 'seu_token'" -ForegroundColor Yellow
    }
    
    default {
        Write-Error-Custom "Acao invalida: $Action"
        Write-Host "Acoes disponiveis: setup, push, status, token" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Exemplos:" -ForegroundColor Cyan
        Write-Host "  .\scripts\github-connector.ps1 -Action setup" -ForegroundColor White
        Write-Host "  .\scripts\github-connector.ps1 -Action push" -ForegroundColor White
        Write-Host "  .\scripts\github-connector.ps1 -Action token" -ForegroundColor White
    }
}

Write-Host "Concluido!" -ForegroundColor Green