#!/bin/bash

# PowerChip E-commerce - Deploy Script para VPS Ubuntu Server
# VPS: 213.199.54.137 (Ubuntu Server)
# Usuario: cybercolll.ti@gmail.com

set -e

# Configurações da VPS
VPS_HOST="213.199.54.137"
VPS_USER="cybercolll.ti@gmail.com"
VPS_PASSWORD="S1sAdm1N"
APP_NAME="powerchip-ecommerce"
REMOTE_DIR="/home/powerchip"
DOMAIN="powerchip-agente-ia.com.br"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para executar comandos remotos
execute_remote() {
    local command="$1"
    log_info "Executando: $command"
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "$command"
}

# Função para copiar arquivos
copy_files() {
    local local_path="$1"
    local remote_path="$2"
    log_info "Copiando $local_path para $remote_path"
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no -r "$local_path" "$VPS_USER@$VPS_HOST:$remote_path"
}

# Função para verificar pré-requisitos locais
check_local_prerequisites() {
    log_info "Verificando pré-requisitos locais..."
    
    # Verificar sshpass
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass não está instalado. Instale com: sudo apt install sshpass"
        exit 1
    fi
    
    # Verificar se o arquivo .env existe
    if [ ! -f ".env" ]; then
        log_error "Arquivo .env não encontrado."
        exit 1
    fi
    
    log_success "Pré-requisitos locais verificados."
}

# Função para preparar o servidor
setup_server() {
    log_info "Preparando servidor VPS..."
    
    # Atualizar sistema
    execute_remote "sudo apt update && sudo apt upgrade -y"
    
    # Instalar dependências para Ubuntu Server
    execute_remote "sudo apt install -y curl wget git unzip nginx certbot python3-certbot-nginx ufw htop"
    
    # Instalar Docker no Ubuntu Server
    execute_remote "curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    execute_remote "sudo usermod -aG docker \$USER"
    execute_remote "sudo systemctl enable docker"
    execute_remote "sudo systemctl start docker"
    
    # Instalar Docker Compose
    execute_remote "sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    execute_remote "sudo chmod +x /usr/local/bin/docker-compose"
    
    # Criar diretório da aplicação e configurar firewall Ubuntu
    execute_remote "sudo mkdir -p $REMOTE_DIR && sudo chown \$USER:\$USER $REMOTE_DIR"
    execute_remote "sudo ufw allow 22/tcp"
    execute_remote "sudo ufw allow 80/tcp"
    execute_remote "sudo ufw allow 443/tcp"
    execute_remote "sudo ufw --force enable"
    
    log_success "Servidor preparado com sucesso."
}

# Função para fazer upload dos arquivos
upload_files() {
    log_info "Fazendo upload dos arquivos..."
    
    # Criar arquivo temporário com exclusões
    cat > .rsync-exclude << EOF
.git/
node_modules/
.next/
dist/
build/
*.log
.env.local
.env.development
backups/
EOF
    
    # Fazer upload usando rsync via SSH
    log_info "Sincronizando arquivos..."
    sshpass -p "$VPS_PASSWORD" rsync -avz --exclude-from=.rsync-exclude \
        -e "ssh -o StrictHostKeyChecking=no" \
        ./ "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"
    
    # Remover arquivo temporário
    rm .rsync-exclude
    
    log_success "Upload concluído."
}

# Função para configurar ambiente
setup_environment() {
    log_info "Configurando ambiente de produção..."
    
    # Criar arquivo .env de produção
    execute_remote "cd $REMOTE_DIR && cat > .env << 'EOF'
# PowerChip E-commerce - Configuração de Produção VPS
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

# Mercado Pago - PRODUÇÃO (CONFIGURE AS CREDENCIAIS REAIS)
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
EOF"
    
    log_success "Ambiente configurado."
}

# Função para configurar Nginx
setup_nginx() {
    log_info "Configurando Nginx..."
    
    # Criar configuração do Nginx
    execute_remote "sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << 'EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (será configurado pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection \"1; mode=block\";
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # N8N automation
    location /n8n/ {
        proxy_pass http://localhost:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Webhook endpoints
    location /webhook {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"
    
    # Ativar site
    execute_remote "sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
    execute_remote "sudo rm -f /etc/nginx/sites-enabled/default"
    
    # Testar configuração
    execute_remote "sudo nginx -t"
    
    log_success "Nginx configurado."
}

# Função para configurar SSL
setup_ssl() {
    log_info "Configurando SSL com Let's Encrypt..."
    
    # Parar Nginx temporariamente
    execute_remote "sudo systemctl stop nginx"
    
    # Obter certificado SSL
    execute_remote "sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email cybercolll.ti@gmail.com --agree-tos --non-interactive"
    
    # Iniciar Nginx
    execute_remote "sudo systemctl start nginx"
    execute_remote "sudo systemctl enable nginx"
    
    # Configurar renovação automática
    execute_remote "echo '0 12 * * * /usr/bin/certbot renew --quiet' | sudo crontab -"
    
    log_success "SSL configurado com sucesso."
}

# Função para fazer deploy da aplicação
deploy_application() {
    log_info "Fazendo deploy da aplicação..."
    
    # Parar serviços existentes (se houver)
    execute_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml down || true"
    
    # Construir e iniciar aplicação
    execute_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml build --no-cache"
    execute_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml up -d"
    
    # Aguardar inicialização
    sleep 30
    
    log_success "Aplicação deployada com sucesso."
}

# Função para verificar saúde da aplicação
health_check() {
    log_info "Verificando saúde da aplicação..."
    
    # Verificar se a aplicação está respondendo
    if execute_remote "curl -f -s http://localhost:3000 > /dev/null"; then
        log_success "Aplicação principal: OK"
    else
        log_error "Aplicação principal: FALHOU"
        return 1
    fi
    
    # Verificar Nginx
    if execute_remote "curl -f -s http://localhost:80 > /dev/null"; then
        log_success "Nginx: OK"
    else
        log_error "Nginx: FALHOU"
        return 1
    fi
    
    log_success "Verificação de saúde concluída com sucesso."
}

# Função para mostrar status
show_status() {
    log_info "Status dos serviços:"
    execute_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml ps"
    
    log_info "Status do Nginx:"
    execute_remote "sudo systemctl status nginx --no-pager"
    
    log_info "Certificados SSL:"
    execute_remote "sudo certbot certificates"
}

# Função para mostrar logs
show_logs() {
    local service=${1:-powerchip-app}
    log_info "Logs do serviço: $service"
    execute_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml logs --tail=50 $service"
}

# Função principal de deploy completo
full_deploy() {
    log_info "Iniciando deploy completo para VPS $VPS_HOST..."
    
    check_local_prerequisites
    setup_server
    upload_files
    setup_environment
    setup_nginx
    setup_ssl
    deploy_application
    
    if health_check; then
        log_success "Deploy concluído com sucesso!"
        log_info "Aplicação disponível em: https://$DOMAIN"
        log_info "N8N disponível em: https://$DOMAIN/n8n"
        log_warning "IMPORTANTE: Configure as credenciais reais do Mercado Pago no arquivo .env do servidor!"
    else
        log_error "Deploy falhou na verificação de saúde."
        exit 1
    fi
}

# Função para deploy rápido (apenas código)
quick_deploy() {
    log_info "Iniciando deploy rápido..."
    
    check_local_prerequisites
    upload_files
    
    # Reiniciar apenas a aplicação
    execute_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.prod.yml restart powerchip-app"
    
    if health_check; then
        log_success "Deploy rápido concluído!"
    else
        log_error "Deploy rápido falhou."
        exit 1
    fi
}

# Menu principal
case "${1:-help}" in
    "full")
        full_deploy
        ;;
    "quick")
        quick_deploy
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$2"
        ;;
    "ssl")
        setup_ssl
        ;;
    "nginx")
        setup_nginx
        execute_remote "sudo systemctl reload nginx"
        ;;
    "help")
        echo "Uso: $0 {full|quick|status|logs|ssl|nginx|help}"
        echo ""
        echo "Comandos:"
        echo "  full    - Deploy completo (primeira vez)"
        echo "  quick   - Deploy rápido (apenas código)"
        echo "  status  - Mostrar status dos serviços"
        echo "  logs    - Mostrar logs (opcional: nome do serviço)"
        echo "  ssl     - Configurar/renovar SSL"
        echo "  nginx   - Reconfigurar Nginx"
        echo "  help    - Mostrar esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  $0 full                    # Deploy completo"
        echo "  $0 quick                   # Deploy rápido"
        echo "  $0 logs powerchip-app      # Ver logs da aplicação"
        ;;
    *)
        log_error "Comando inválido: $1"
        echo "Use '$0 help' para ver os comandos disponíveis."
        exit 1
        ;;
esac