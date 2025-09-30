#!/bin/bash

# PowerChip E-commerce - N8N Manager Script
# Este script facilita o gerenciamento do n8n para automações do e-commerce

set -e

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

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
    
    log_success "Docker e Docker Compose estão instalados."
}

# Verificar arquivo .env
check_env() {
    if [ ! -f ".env" ]; then
        log_warning "Arquivo .env não encontrado. Criando arquivo de exemplo..."
        create_env_example
    else
        log_success "Arquivo .env encontrado."
    fi
}

# Criar arquivo .env de exemplo
create_env_example() {
    cat > .env << EOF
# PowerChip E-commerce - Configurações N8N

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key

# E-commerce API
ECOMMERCE_ADMIN_TOKEN=your_admin_token

# Email Configuration (Gmail)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Email Configuration (Custom SMTP)
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_TLS=true

# N8N Configuration
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=powerchip2024
EOF
    
    log_success "Arquivo .env de exemplo criado. Por favor, configure as variáveis antes de continuar."
}

# Iniciar n8n
start_n8n() {
    log_info "Iniciando n8n..."
    docker-compose -f docker-compose.n8n.yml up -d
    
    log_success "N8N iniciado com sucesso!"
    log_info "Acesse: http://localhost:5678"
    log_info "Usuário: admin"
    log_info "Senha: powerchip2024"
}

# Parar n8n
stop_n8n() {
    log_info "Parando n8n..."
    docker-compose -f docker-compose.n8n.yml down
    log_success "N8N parado com sucesso!"
}

# Reiniciar n8n
restart_n8n() {
    log_info "Reiniciando n8n..."
    stop_n8n
    start_n8n
}

# Ver logs do n8n
logs_n8n() {
    log_info "Mostrando logs do n8n..."
    docker-compose -f docker-compose.n8n.yml logs -f n8n
}

# Status do n8n
status_n8n() {
    log_info "Status dos containers n8n:"
    docker-compose -f docker-compose.n8n.yml ps
}

# Backup dos workflows
backup_workflows() {
    log_info "Fazendo backup dos workflows..."
    
    BACKUP_DIR="backups/n8n/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Copiar workflows
    if [ -d "n8n/workflows" ]; then
        cp -r n8n/workflows "$BACKUP_DIR/"
        log_success "Workflows copiados para $BACKUP_DIR/workflows"
    fi
    
    # Copiar credenciais
    if [ -d "n8n/credentials" ]; then
        cp -r n8n/credentials "$BACKUP_DIR/"
        log_success "Credenciais copiadas para $BACKUP_DIR/credentials"
    fi
    
    # Backup do banco de dados (se usando SQLite)
    if docker-compose -f docker-compose.n8n.yml exec -T n8n test -f /home/node/.n8n/database.sqlite; then
        docker-compose -f docker-compose.n8n.yml exec -T n8n cat /home/node/.n8n/database.sqlite > "$BACKUP_DIR/database.sqlite"
        log_success "Banco de dados copiado para $BACKUP_DIR/database.sqlite"
    fi
    
    log_success "Backup completo salvo em: $BACKUP_DIR"
}

# Restaurar workflows
restore_workflows() {
    if [ -z "$1" ]; then
        log_error "Por favor, especifique o diretório de backup."
        log_info "Uso: $0 restore <caminho_do_backup>"
        exit 1
    fi
    
    BACKUP_PATH="$1"
    
    if [ ! -d "$BACKUP_PATH" ]; then
        log_error "Diretório de backup não encontrado: $BACKUP_PATH"
        exit 1
    fi
    
    log_info "Restaurando workflows de: $BACKUP_PATH"
    
    # Parar n8n
    stop_n8n
    
    # Restaurar workflows
    if [ -d "$BACKUP_PATH/workflows" ]; then
        rm -rf n8n/workflows
        cp -r "$BACKUP_PATH/workflows" n8n/
        log_success "Workflows restaurados"
    fi
    
    # Restaurar credenciais
    if [ -d "$BACKUP_PATH/credentials" ]; then
        rm -rf n8n/credentials
        cp -r "$BACKUP_PATH/credentials" n8n/
        log_success "Credenciais restauradas"
    fi
    
    # Iniciar n8n
    start_n8n
    
    log_success "Restauração completa!"
}

# Instalar workflows padrão
install_default_workflows() {
    log_info "Instalando workflows padrão..."
    
    # Verificar se os workflows já existem
    if [ -f "n8n/workflows/ecommerce-automation.json" ]; then
        log_warning "Workflows já existem. Deseja sobrescrever? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log_info "Instalação cancelada."
            return
        fi
    fi
    
    # Criar diretórios se não existirem
    mkdir -p n8n/workflows
    mkdir -p n8n/credentials
    
    log_success "Workflows padrão instalados com sucesso!"
    log_info "Reinicie o n8n para carregar os novos workflows."
}

# Testar webhooks
test_webhooks() {
    log_info "Testando webhooks..."
    
    # Testar webhook de pedido criado
    log_info "Testando webhook: order-created"
    curl -X POST http://localhost:5678/webhook/order-created \
        -H "Content-Type: application/json" \
        -d '{
            "event": "order.created",
            "order": {
                "id": "test-123",
                "totalAmount": 299.99,
                "status": "pending",
                "createdAt": "2024-01-01T12:00:00Z",
                "user": {
                    "name": "João Silva",
                    "email": "joao@example.com"
                },
                "items": [
                    {
                        "product": {"name": "Produto Teste"},
                        "quantity": 1,
                        "price": 299.99
                    }
                ]
            }
        }'
    
    log_success "Teste de webhook concluído. Verifique os logs do n8n."
}

# Menu de ajuda
show_help() {
    echo "PowerChip E-commerce - N8N Manager"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start           Iniciar n8n"
    echo "  stop            Parar n8n"
    echo "  restart         Reiniciar n8n"
    echo "  logs            Ver logs do n8n"
    echo "  status          Ver status dos containers"
    echo "  backup          Fazer backup dos workflows"
    echo "  restore <path>  Restaurar workflows de um backup"
    echo "  install         Instalar workflows padrão"
    echo "  test            Testar webhooks"
    echo "  help            Mostrar esta ajuda"
    echo ""
}

# Função principal
main() {
    case "$1" in
        start)
            check_docker
            check_env
            start_n8n
            ;;
        stop)
            stop_n8n
            ;;
        restart)
            restart_n8n
            ;;
        logs)
            logs_n8n
            ;;
        status)
            status_n8n
            ;;
        backup)
            backup_workflows
            ;;
        restore)
            restore_workflows "$2"
            ;;
        install)
            install_default_workflows
            ;;
        test)
            test_webhooks
            ;;
        help|--help|-h)
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            log_error "Comando desconhecido: $1"
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"