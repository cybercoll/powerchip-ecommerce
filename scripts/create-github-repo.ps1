# Script para criar repositório no GitHub - PowerChip E-commerce
param(
    [string]$Token = $env:GITHUB_TOKEN
)

$GITHUB_USER = "cybercoll"
$REPO_NAME = "powerchip-ecommerce"

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

Write-Host "Criador de Repositório GitHub - PowerChip E-commerce" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

if (-not $Token) {
    Write-Error-Custom "Personal Access Token não fornecido!"
    Write-Host "Execute: `$env:GITHUB_TOKEN = 'seu_token_aqui'" -ForegroundColor Yellow
    Write-Host "Ou crie manualmente em: https://github.com/new" -ForegroundColor Yellow
    exit 1
}

try {
    Write-Info "Criando repositório '$REPO_NAME' no GitHub..."
    
    # Dados do repositório
    $repoData = @{
        name = $REPO_NAME
        description = "Sistema completo de e-commerce - PowerChip"
        private = $false
        auto_init = $false
    } | ConvertTo-Json -Depth 3
    
    # Headers para autenticação
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "PowerChip-Connector"
        "Content-Type" = "application/json"
    }
    
    # Criar repositório
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method POST -Body $repoData -Headers $headers
    
    Write-Success "Repositório '$REPO_NAME' criado com sucesso!"
    Write-Info "URL: $($response.html_url)"
    Write-Info "Clone URL: $($response.clone_url)"
    
    # Configurar remote
    Write-Info "Configurando remote origin..."
    git remote remove origin 2>$null
    git remote add origin $response.clone_url
    
    Write-Success "Remote configurado com sucesso!"
    
    # Tentar fazer push
    Write-Info "Tentando fazer push..."
    $repoUrlWithToken = "https://$GITHUB_USER`:$Token@github.com/$GITHUB_USER/$REPO_NAME.git"
    git remote set-url origin $repoUrlWithToken
    
    git push -u origin master
    
    # Restaurar URL original
    git remote set-url origin $response.clone_url
    
    Write-Success "Push realizado com sucesso!"
    Write-Host ""
    Write-Host "=== REPOSITÓRIO CRIADO COM SUCESSO ===" -ForegroundColor Green
    Write-Host "URL: $($response.html_url)" -ForegroundColor Cyan
    Write-Host "Acesse o link acima para ver seu código no GitHub!" -ForegroundColor Cyan
    
} catch {
    if ($_.Exception.Message -like "*422*" -or $_.Exception.Message -like "*already exists*") {
        Write-Success "Repositório '$REPO_NAME' já existe!"
        Write-Info "URL: https://github.com/$GITHUB_USER/$REPO_NAME"
        
        # Configurar remote mesmo assim
        git remote remove origin 2>$null
        git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
        
        # Tentar push
        Write-Info "Tentando fazer push para repositório existente..."
        $repoUrlWithToken = "https://$GITHUB_USER`:$Token@github.com/$GITHUB_USER/$REPO_NAME.git"
        git remote set-url origin $repoUrlWithToken
        
        try {
            git push -u origin master
            git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
            Write-Success "Push realizado com sucesso!"
        } catch {
            Write-Error-Custom "Erro no push: $($_.Exception.Message)"
            Write-Info "Tente fazer push manualmente: git push -u origin master"
        }
        
    } else {
        Write-Error-Custom "Erro ao criar repositório: $($_.Exception.Message)"
        
        if ($_.Exception.Message -like "*401*") {
            Write-Host "Erro de autenticação. Verifique seu token:" -ForegroundColor Yellow
            Write-Host "1. Acesse: https://github.com/settings/tokens" -ForegroundColor Yellow
            Write-Host "2. Verifique se o token tem escopo 'repo'" -ForegroundColor Yellow
            Write-Host "3. Verifique se o token não expirou" -ForegroundColor Yellow
        }
    }
}

Write-Host "Concluído!" -ForegroundColor Green