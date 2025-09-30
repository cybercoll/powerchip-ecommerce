# PowerChip E-commerce - Deploy Script para Windows
# Deploy para VPS Ubuntu Server: 213.199.54.137
# Usuario: cybercolll.ti@gmail.com

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("full", "quick", "status", "logs", "ssl", "help")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [string]$Service = "powerchip-app"
)

# Configurações da VPS
$VPS_HOST = "213.199.54.137"
$VPS_USER = "cybercolll.ti@gmail.com"
$VPS_PASSWORD = "S1sAdm1N"
$APP_NAME = "powerchip-ecommerce"
$REMOTE_DIR = "/home/powerchip"
$DOMAIN = "powerchip-agente-ia.com.br"

# Cores para output
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# Função para executar comandos SSH
function Invoke-SSHCommand {
    param(
        [string]$Command
    )
    
    Write-Info "Executando: $Command"
    
    # Usar plink (PuTTY) se disponível, senão usar ssh nativo do Windows
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        $result = echo y | plink -ssh -l $VPS_USER -pw $VPS_PASSWORD $VPS_HOST $Command
    } else {
        # Usar ssh nativo do Windows 10/11
        $env:SSH_ASKPASS_REQUIRE = "never"
        $result = ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL $VPS_USER@$VPS_HOST $Command
    }
    
    return $result
}

# Função para copiar arquivos via SCP
function Copy-FilesToVPS {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    Write-Info "Copiando $LocalPath para $RemotePath"
    
    if (Get-Command pscp -ErrorAction SilentlyContinue) {
        # Usar pscp (PuTTY)
        pscp -r -pw $VPS_PASSWORD $LocalPath $VPS_USER@${VPS_HOST}:$RemotePath
    } else {
        # Usar scp nativo do Windows
        scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -r $LocalPath $VPS_USER@${VPS_HOST}:$RemotePath
    }
}

# Função para verificar pré-requisitos
function Test-Prerequisites {
    Write-Info "Verificando pré-requisitos..."
    
    # Verificar se SSH está disponível
    if (-not (Get-Command ssh -ErrorAction SilentlyContinue) -and -not (Get-Command plink -ErrorAction SilentlyContinue)) {
        Write-Error "SSH não está disponível. Instale o OpenSSH ou PuTTY."
        Write-Info "Para instalar OpenSSH: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0"
        return $false
    }
    
    # Verificar se o arquivo .env existe
    if (-not (Test-Path ".env")) {
        Write-Error "Arquivo .env não encontrado."
        return $false
    }
    
    Write-Success "Pré-requisitos verificados."
    return $true
}

# Função para preparar o servidor
function Initialize-Server {
    Write-Info "Preparando servidor Ubuntu..."
    
    # Atualizar sistema
    Invoke-SSHCommand "sudo apt update && sudo apt upgrade -y"
    
    # Instalar dependências
    Invoke-SSHCommand "sudo apt install -y curl wget git unzip nginx certbot python3-certbot-nginx ufw htop"
    
    # Configurar firewall
    Invoke-SSHCommand "sudo ufw allow 22/tcp"
    Invoke-SSHCommand "sudo ufw allow 80/tcp"
    Invoke-SSHCommand "sudo ufw allow 443/tcp"
    Invoke-SSHCommand "sudo ufw --force enable"
    
    # Instalar Docker
    Invoke-SSHCommand "curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    Invoke-SSHCommand "sudo usermod -aG docker `$USER"
    Invoke-SSHCommand "sudo systemctl enable docker"
    Invoke-SSHCommand "sudo systemctl start docker"
    
    # Instalar Docker Compose
    Invoke-SSHCommand "sudo curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-`$(uname -s)-`$(uname -m)' -o /usr/local/bin/docker-compose"
    Invoke-SSHCommand "sudo chmod +x /usr/local/bin/docker-compose"
    
    # Criar diretório da aplicação
    Invoke-SSHCommand "sudo mkdir -p $REMOTE_DIR && sudo chown `$USER:`$USER $REMOTE_DIR"
    
    Write-Success "Servidor preparado com sucesso."
}

# Função para fazer upload dos arquivos
function Send-ApplicationFiles {
    Write-Info "Fazendo upload dos arquivos..."
    
    # Criar lista de exclusões
    $excludeItems = @(
        ".git",
        "node_modules",
        ".next",
        "dist",
        "build",
        "*.log",
        ".env.local",
        ".env.development",
        "backups"
    )
    
    # Criar arquivo temporário com exclusões para robocopy
    $excludeFile = "exclude.txt"
    $excludeItems | Out-File -FilePath $excludeFile -Encoding UTF8
    
    try {
        # Usar robocopy para preparar arquivos (excluindo itens desnecessários)
        $tempDir = "temp_deploy"
        if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
        
        robocopy . $tempDir /E /XF $excludeFile /XD $excludeItems
        
        # Copiar para o servidor
        Copy-FilesToVPS "$tempDir\*" $REMOTE_DIR
        
        # Limpar diretório temporário
        Remove-Item $tempDir -Recurse -Force
    }
    finally {
        # Remover arquivo de exclusões
        if (Test-Path $excludeFile) { Remove-Item $excludeFile }
    }
    
    Write-Success "Upload concluído."
}

# Função para configurar ambiente
function Set-Environment {
    Write-Info "Configurando ambiente de produção..."
    
    $envContent = @"
# PowerChip E-commerce - Configuração de Produção Ubuntu Server
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xrtwemlaecwktsyuphjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydHdlbWxhZWN3a3RzeXVwaGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODUzNjAsImV4cCI6MjA3MTk2MTM2MH0.-QubGuQ74P2W4XkH_qjoAAZI5hO2agv3xVepLlCAQeg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydHdlbWxhZWN3a3RzeXVwaGp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM4NTM2MCwiZXhwIjoyMDcxOTYxMzYwfQ.rl3-qx18P49lcMZ7iJBHXwbdN1RFZldE-2gZ_kGBOuE

# Autenticação
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=powerchip-nextauth-secret-key-2024-production-ultra-secure

# Mercado Pago - CONFIGURE AS CREDENCIAIS REAIS DE PRODUÇÃO
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-your-production-public-key-here
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-your-production-access-token-here
MERCADO_PAGO_WEBHOOK_SECRET=your-production-webhook-secret-here

# Empresa
NEXT_PUBLIC_COMPANY_NAME=PowerChip
NEXT_PUBLIC_COMPANY_EMAIL=powerchip@$DOMAIN
NEXT_PUBLIC_COMPANY_PHONE=61 98143-7533
NEXT_PUBLIC_COMPANY_DOMAIN=$DOMAIN
NEXT_PUBLIC_COMPANY_IP=$VPS_HOST

# N8N
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://$DOMAIN/webhook
N8N_HOST=$DOMAIN
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=PowerChip2024!

# Segurança
JWT_SECRET=powerchip-jwt-secret-2024-production-ultra-secure-key

# Redis
REDIS_PASSWORD=PowerChipRedis2024!
"@
    
    # Criar arquivo .env no servidor
    $envContent | Out-File -FilePath "temp_env" -Encoding UTF8 -NoNewline
    Copy-FilesToVPS "temp_env" "$REMOTE_DIR/.env"
    Remove-Item "temp_env"
    
    Write-Success "Ambiente configurado."
}

# Função para configurar Nginx
function Set-Nginx {
    Write-Info "Configurando Nginx..."
    
    $nginxConfig = @"
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://`$server_name`$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /n8n/ {
        proxy_pass http://localhost:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
    
    location /webhook {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}
"@
    
    # Criar arquivo de configuração temporário
    $nginxConfig | Out-File -FilePath "temp_nginx" -Encoding UTF8 -NoNewline
    Copy-FilesToVPS "temp_nginx" "/tmp/nginx_config"
    Remove-Item "temp_nginx"
    
    # Aplicar configuração no servidor
    Invoke-SSHCommand "sudo mv /tmp/nginx_config /etc/nginx/sites-available/$DOMAIN"
    Invoke-SSHCommand "sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
    Invoke-SSHCommand "sudo rm -f /etc/nginx/sites-enabled/default"
    Invoke-SSHCommand "sudo nginx -t"
    
    Write-Success "Nginx configurado."
}

# Função para configurar SSL
function Set-SSL {
    Write-Info "Configurando SSL com Let's Encrypt..."
    
    Invoke-SSHCommand "sudo systemctl stop nginx"
    Invoke-SSHCommand "sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email cybercolll.ti@gmail.com --agree-tos --non-interactive"
    Invoke-SSHCommand "sudo systemctl start nginx"
    Invoke-SSHCommand "sudo systemctl enable nginx"
    Invoke-SSHCommand "echo '0 12 * * * /usr/bin/certbot renew --quiet' | sudo crontab -"
    
    Write-Success "SSL configurado com sucesso."
}

# Função para fazer deploy da aplicação
function Deploy-Application {
    Write-Info "Fazendo deploy da aplicação..."
    
    Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml down || true"
    Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml build --no-cache"
    Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml up -d"
    
    Start-Sleep -Seconds 30
    
    Write-Success "Aplicação deployada com sucesso."
}

# Função para verificar saúde
function Test-ApplicationHealth {
    Write-Info "Verificando saúde da aplicação..."
    
    $appTest = Invoke-SSHCommand "curl -f -s http://localhost:3000 > /dev/null && echo 'OK' || echo 'FAIL'"
    if ($appTest -match "OK") {
        Write-Success "Aplicação principal: OK"
    } else {
        Write-Error "Aplicação principal: FALHOU"
        return $false
    }
    
    $nginxTest = Invoke-SSHCommand "curl -f -s http://localhost:80 > /dev/null && echo 'OK' || echo 'FAIL'"
    if ($nginxTest -match "OK") {
        Write-Success "Nginx: OK"
    } else {
        Write-Error "Nginx: FALHOU"
        return $false
    }
    
    Write-Success "Verificação de saúde concluída com sucesso."
    return $true
}

# Função para mostrar status
function Show-Status {
    Write-Info "Status dos serviços:"
    Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml ps"
    
    Write-Info "Status do Nginx:"
    Invoke-SSHCommand "sudo systemctl status nginx --no-pager"
    
    Write-Info "Certificados SSL:"
    Invoke-SSHCommand "sudo certbot certificates"
}

# Função para mostrar logs
function Show-Logs {
    param([string]$ServiceName = "powerchip-app")
    
    Write-Info "Logs do serviço: $ServiceName"
    Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml logs --tail=50 $ServiceName"
}

# Função de deploy completo
function Start-FullDeploy {
    Write-Info "Iniciando deploy completo para VPS $VPS_HOST..."
    
    if (-not (Test-Prerequisites)) { return }
    
    Initialize-Server
    Send-ApplicationFiles
    Set-Environment
    Set-Nginx
    Set-SSL
    Deploy-Application
    
    if (Test-ApplicationHealth) {
        Write-Success "Deploy concluído com sucesso!"
        Write-Info "Aplicação disponível em: https://$DOMAIN"
        Write-Info "N8N disponível em: https://$DOMAIN/n8n"
        Write-Warning "IMPORTANTE: Configure as credenciais reais do Mercado Pago no arquivo .env do servidor!"
    } else {
        Write-Error "Deploy falhou na verificação de saúde."
    }
}

# Função de deploy rápido
function Start-QuickDeploy {
    Write-Info "Iniciando deploy rápido..."
    
    if (-not (Test-Prerequisites)) { return }
    
    Send-ApplicationFiles
    Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml restart powerchip-app"
    
    if (Test-ApplicationHealth) {
        Write-Success "Deploy rápido concluído!"
    } else {
        Write-Error "Deploy rápido falhou."
    }
}

# Função de ajuda
function Show-Help {
    Write-Host "PowerChip E-commerce - Deploy Script para Windows" -ForegroundColor Cyan
    Write-Host "Deploy para VPS Ubuntu Server: $VPS_HOST" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\scripts\deploy-windows.ps1 -Action <comando> [-Service <serviço>]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Comandos disponíveis:" -ForegroundColor Green
    Write-Host "  full    - Deploy completo (primeira vez)" -ForegroundColor White
    Write-Host "  quick   - Deploy rápido (apenas código)" -ForegroundColor White
    Write-Host "  status  - Mostrar status dos serviços" -ForegroundColor White
    Write-Host "  logs    - Mostrar logs (use -Service para especificar)" -ForegroundColor White
    Write-Host "  ssl     - Configurar/renovar SSL" -ForegroundColor White
    Write-Host "  help    - Mostrar esta ajuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Green
    Write-Host "  .\scripts\deploy-windows.ps1 -Action full" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-windows.ps1 -Action quick" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-windows.ps1 -Action logs -Service powerchip-app" -ForegroundColor Cyan
    Write-Host "  .\scripts\deploy-windows.ps1 -Action status" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pré-requisitos:" -ForegroundColor Yellow
    Write-Host "  - OpenSSH Client ou PuTTY instalado" -ForegroundColor White
    Write-Host "  - Arquivo .env configurado" -ForegroundColor White
    Write-Host "  - Acesso SSH à VPS" -ForegroundColor White
}

# Executar ação baseada no parâmetro
switch ($Action) {
    "full" { Start-FullDeploy }
    "quick" { Start-QuickDeploy }
    "status" { Show-Status }
    "logs" { Show-Logs -ServiceName $Service }
    "ssl" { Set-SSL }
    "help" { Show-Help }
    default { 
        Write-Error "Comando inválido: $Action"
        Show-Help
    }
}