#!/bin/bash

# PowerChip E-commerce - Deploy Script
# Script automatizado para deploy em VPS

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
APP_NAME="powerchip-ecommerce"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="backups/deploy"
LOG_FILE="deploy.log"

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
}

# Função para verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado."
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado."
        exit 1
    fi
    
    # Verificar arquivo .env
    if [ ! -f ".env" ]; then
        log_error "Arquivo .env não encontrado."
        exit 1
    fi
    
    # Verificar arquivo docker-compose
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "Arquivo $DOCKER_COMPOSE_FILE não encontrado."
        exit 1
    fi
    
    log_success "Pré-requisitos verificados."
}

# Função para fazer backup
backup_current() {
    log_info "Fazendo backup da versão atual..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup do banco de dados (se aplicável)
    if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "powerchip-redis"; then
        log_info "Fazendo backup do Redis..."
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli --rdb /data/backup.rdb
        docker cp powerchip-redis:/data/backup.rdb "$BACKUP_PATH/redis-backup.rdb"
    fi
    
    # Backup dos volumes
    log_info "Fazendo backup dos volumes..."
    docker run --rm -v powerchip-ecommerce_app-logs:/data -v "$(pwd)/$BACKUP_PATH:/backup" alpine tar czf /backup/app-logs.tar.gz -C /data .
    docker run --rm -v powerchip-ecommerce_n8n-data:/data -v "$(pwd)/$BACKUP_PATH:/backup" alpine tar czf /backup/n8n-data.tar.gz -C /data .
    
    # Backup da configuração
    cp .env "$BACKUP_PATH/env.backup"
    cp $DOCKER_COMPOSE_FILE "$BACKUP_PATH/docker-compose.backup.yml"
    
    log_success "Backup criado em: $BACKUP_PATH"
    echo "$BACKUP_PATH" > .last_backup
}

# Função para parar serviços
stop_services() {
    log_info "Parando serviços..."
    
    if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
        docker-compose -f $DOCKER_COMPOSE_FILE down
        log_success "Serviços parados."
    else
        log_info "Nenhum serviço estava rodando."
    fi
}

# Função para construir imagens
build_images() {
    log_info "Construindo imagens Docker..."
    
    # Build da aplicação principal
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache powerchip-app
    
    log_success "Imagens construídas com sucesso."
}

# Função para iniciar serviços
start_services() {
    log_info "Iniciando serviços..."
    
    # Iniciar serviços essenciais primeiro
    docker-compose -f $DOCKER_COMPOSE_FILE up -d redis
    sleep 5
    
    # Iniciar aplicação principal
    docker-compose -f $DOCKER_COMPOSE_FILE up -d powerchip-app
    sleep 10
    
    # Iniciar nginx
    docker-compose -f $DOCKER_COMPOSE_FILE up -d nginx
    sleep 5
    
    # Iniciar N8N
    docker-compose -f $DOCKER_COMPOSE_FILE up -d n8n
    
    # Iniciar Traefik (se usando)
    if grep -q "traefik:" $DOCKER_COMPOSE_FILE; then
        docker-compose -f $DOCKER_COMPOSE_FILE up -d traefik
    fi
    
    log_success "Serviços iniciados."
}

# Função para verificar saúde dos serviços
health_check() {
    log_info "Verificando saúde dos serviços..."
    
    # Aguardar inicialização
    sleep 30
    
    # Verificar aplicação principal
    if curl -f -s http://localhost:3000/health > /dev/null; then
        log_success "Aplicação principal: OK"
    else
        log_error "Aplicação principal: FALHOU"
        return 1
    fi
    
    # Verificar Nginx
    if curl -f -s http://localhost:80 > /dev/null; then
        log_success "Nginx: OK"
    else
        log_warning "Nginx: Pode não estar configurado corretamente"
    fi
    
    # Verificar N8N
    if curl -f -s http://localhost:5678 > /dev/null; then
        log_success "N8N: OK"
    else
        log_warning "N8N: Pode não estar acessível"
    fi
    
    # Verificar Redis
    if docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "Redis: OK"
    else
        log_error "Redis: FALHOU"
        return 1
    fi
    
    log_success "Verificação de saúde concluída."
}

# Função para rollback
rollback() {
    log_warning "Iniciando rollback..."
    
    if [ ! -f ".last_backup" ]; then
        log_error "Nenhum backup encontrado para rollback."
        exit 1
    fi
    
    BACKUP_PATH=$(cat .last_backup)
    
    if [ ! -d "$BACKUP_PATH" ]; then
        log_error "Diretório de backup não encontrado: $BACKUP_PATH"
        exit 1
    fi
    
    # Parar serviços
    stop_services
    
    # Restaurar configuração
    cp "$BACKUP_PATH/env.backup" .env
    
    # Restaurar volumes
    log_info "Restaurando volumes..."
    docker run --rm -v powerchip-ecommerce_app-logs:/data -v "$(pwd)/$BACKUP_PATH:/backup" alpine tar xzf /backup/app-logs.tar.gz -C /data
    docker run --rm -v powerchip-ecommerce_n8n-data:/data -v "$(pwd)/$BACKUP_PATH:/backup" alpine tar xzf /backup/n8n-data.tar.gz -C /data
    
    # Restaurar Redis
    if [ -f "$BACKUP_PATH/redis-backup.rdb" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE up -d redis
        sleep 5
        docker cp "$BACKUP_PATH/redis-backup.rdb" powerchip-redis:/data/dump.rdb
        docker-compose -f $DOCKER_COMPOSE_FILE restart redis
    fi
    
    # Iniciar serviços
    start_services
    
    log_success "Rollback concluído."
}

# Função para limpeza
cleanup() {
    log_info "Limpando recursos não utilizados..."
    
    # Remover imagens não utilizadas
    docker image prune -f
    
    # Remover volumes órfãos
    docker volume prune -f
    
    # Remover redes não utilizadas
    docker network prune -f
    
    log_success "Limpeza concluída."
}

# Função para mostrar status
show_status() {
    log_info "Status dos serviços:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    echo ""
    log_info "Uso de recursos:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Função para mostrar logs
show_logs() {
    SERVICE=${1:-powerchip-app}
    LINES=${2:-100}
    
    log_info "Mostrando logs do serviço: $SERVICE"
    docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=$LINES -f $SERVICE
}

# Função para deploy completo
full_deploy() {
    log_info "Iniciando deploy completo do $APP_NAME..."
    
    # Verificar pré-requisitos
    check_prerequisites
    
    # Fazer backup
    backup_current
    
    # Parar serviços
    stop_services
    
    # Construir imagens
    build_images
    
    # Iniciar serviços
    start_services
    
    # Verificar saúde
    if ! health_check; then
        log_error "Deploy falhou na verificação de saúde. Iniciando rollback..."
        rollback
        exit 1
    fi
    
    # Limpeza
    cleanup
    
    log_success "Deploy concluído com sucesso!"
    log_info "Aplicação disponível em: http://localhost"
    log_info "N8N disponível em: http://localhost:5678"
}

# Função para deploy rápido (sem rebuild)
quick_deploy() {
    log_info "Iniciando deploy rápido..."
    
    check_prerequisites
    backup_current
    
    # Apenas reiniciar serviços
    docker-compose -f $DOCKER_COMPOSE_FILE down
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    if ! health_check; then
        log_error "Deploy rápido falhou. Iniciando rollback..."
        rollback
        exit 1
    fi
    
    log_success "Deploy rápido concluído!"
}

# Função para configurar SSL
setup_ssl() {
    log_info "Configurando SSL com Let's Encrypt..."
    
    # Verificar se certbot está instalado
    if ! command -v certbot &> /dev/null; then
        log_info "Instalando certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obter certificado
    DOMAIN=${1:-powerchip.com.br}
    EMAIL=${2:-admin@powerchip.com.br}
    
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Configurar renovação automática
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log_success "SSL configurado para $DOMAIN"
}

# Função de ajuda
show_help() {
    echo "PowerChip E-commerce - Deploy Script"
    echo ""
    echo "Uso: $0 [comando] [opções]"
    echo ""
    echo "Comandos:"
    echo "  deploy          Deploy completo (padrão)"
    echo "  quick           Deploy rápido (sem rebuild)"
    echo "  rollback        Rollback para versão anterior"
    echo "  status          Mostrar status dos serviços"
    echo "  logs [service]  Mostrar logs (padrão: powerchip-app)"
    echo "  stop            Parar todos os serviços"
    echo "  start           Iniciar todos os serviços"
    echo "  restart         Reiniciar todos os serviços"
    echo "  backup          Fazer backup manual"
    echo "  cleanup         Limpar recursos Docker"
    echo "  ssl [domain]    Configurar SSL com Let's Encrypt"
    echo "  health          Verificar saúde dos serviços"
    echo "  help            Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 deploy                    # Deploy completo"
    echo "  $0 quick                     # Deploy rápido"
    echo "  $0 logs nginx                # Ver logs do nginx"
    echo "  $0 ssl powerchip.com.br      # Configurar SSL"
    echo ""
}

# Função principal
main() {
    # Criar diretório de logs
    mkdir -p logs
    
    # Iniciar log
    echo "$(date): Deploy iniciado com comando: $*" >> $LOG_FILE
    
    case "$1" in
        deploy|"")
            full_deploy
            ;;
        quick)
            quick_deploy
            ;;
        rollback)
            rollback
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2" "$3"
            ;;
        stop)
            stop_services
            ;;
        start)
            start_services
            ;;
        restart)
            stop_services
            start_services
            ;;
        backup)
            backup_current
            ;;
        cleanup)
            cleanup
            ;;
        ssl)
            setup_ssl "$2" "$3"
            ;;
        health)
            health_check
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Comando desconhecido: $1"
            show_help
            exit 1
            ;;
    esac
}

# Trap para limpeza em caso de interrupção
trap 'log_error "Deploy interrompido!"; exit 1' INT TERM

# Executar função principal
main "$@"