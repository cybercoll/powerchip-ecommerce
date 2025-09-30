#!/bin/bash

# PowerChip E-commerce - Script de Monitoramento
# Monitora a saúde dos serviços e envia alertas

set -e

# Configurações
APP_NAME="powerchip-ecommerce"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="logs/monitor.log"
ALERT_EMAIL="admin@powerchip.com.br"
SLACK_WEBHOOK=""  # Configure se usar Slack
TELEGRAM_BOT_TOKEN=""  # Configure se usar Telegram
TELEGRAM_CHAT_ID=""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
RESPONSE_TIME_THRESHOLD=5000  # ms

# URLs para monitoramento
APP_URL="http://localhost:3000"
API_URL="http://localhost:3000/api/health"
N8N_URL="http://localhost:5678"
REDIS_URL="redis://localhost:6379"

# Função para log
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[$timestamp] [INFO]${NC} $message" | tee -a $LOG_FILE
            ;;
        "SUCCESS")
            echo -e "${GREEN}[$timestamp] [SUCCESS]${NC} $message" | tee -a $LOG_FILE
            ;;
        "WARNING")
            echo -e "${YELLOW}[$timestamp] [WARNING]${NC} $message" | tee -a $LOG_FILE
            ;;
        "ERROR")
            echo -e "${RED}[$timestamp] [ERROR]${NC} $message" | tee -a $LOG_FILE
            ;;
    esac
}

# Função para enviar alertas por email
send_email_alert() {
    local subject="$1"
    local body="$2"
    
    if command -v mail &> /dev/null; then
        echo "$body" | mail -s "[PowerChip] $subject" "$ALERT_EMAIL"
        log_message "INFO" "Alerta enviado por email: $subject"
    else
        log_message "WARNING" "Comando 'mail' não encontrado. Instale mailutils."
    fi
}

# Função para enviar alertas via Slack
send_slack_alert() {
    local message="$1"
    local color="$2"  # good, warning, danger
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
            "$SLACK_WEBHOOK" &> /dev/null
        log_message "INFO" "Alerta enviado via Slack"
    fi
}

# Função para enviar alertas via Telegram
send_telegram_alert() {
    local message="$1"
    
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d chat_id="$TELEGRAM_CHAT_ID" \
            -d text="🚨 PowerChip Alert: $message" &> /dev/null
        log_message "INFO" "Alerta enviado via Telegram"
    fi
}

# Função para enviar alerta geral
send_alert() {
    local subject="$1"
    local message="$2"
    local severity="$3"  # info, warning, critical
    
    log_message "WARNING" "ALERTA: $subject - $message"
    
    # Email
    send_email_alert "$subject" "$message"
    
    # Slack
    case $severity in
        "info")
            send_slack_alert "$message" "good"
            ;;
        "warning")
            send_slack_alert "$message" "warning"
            ;;
        "critical")
            send_slack_alert "$message" "danger"
            ;;
    esac
    
    # Telegram
    send_telegram_alert "$message"
}

# Função para verificar se um serviço está rodando
check_service_running() {
    local service_name="$1"
    
    if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "$service_name.*Up"; then
        return 0
    else
        return 1
    fi
}

# Função para verificar resposta HTTP
check_http_response() {
    local url="$1"
    local expected_code="$2"
    local timeout="$3"
    
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "000")
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time $timeout "$url" 2>/dev/null || echo "0")
    
    # Converter para milissegundos
    response_time=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
    
    if [ "$response_code" = "$expected_code" ]; then
        if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
            log_message "WARNING" "$url responde lentamente: ${response_time}ms"
            return 2  # Lento mas funcionando
        else
            log_message "SUCCESS" "$url OK (${response_time}ms)"
            return 0  # OK
        fi
    else
        log_message "ERROR" "$url retornou código $response_code"
        return 1  # Erro
    fi
}

# Função para verificar uso de recursos
check_system_resources() {
    log_message "INFO" "Verificando recursos do sistema..."
    
    # CPU
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    cpu_usage=${cpu_usage%.*}  # Remover decimais
    
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        send_alert "Alto uso de CPU" "CPU em ${cpu_usage}% (limite: ${CPU_THRESHOLD}%)" "warning"
    else
        log_message "SUCCESS" "CPU: ${cpu_usage}%"
    fi
    
    # Memória
    local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$memory_usage" -gt "$MEMORY_THRESHOLD" ]; then
        send_alert "Alto uso de Memória" "Memória em ${memory_usage}% (limite: ${MEMORY_THRESHOLD}%)" "warning"
    else
        log_message "SUCCESS" "Memória: ${memory_usage}%"
    fi
    
    # Disco
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        send_alert "Alto uso de Disco" "Disco em ${disk_usage}% (limite: ${DISK_THRESHOLD}%)" "critical"
    else
        log_message "SUCCESS" "Disco: ${disk_usage}%"
    fi
}

# Função para verificar containers Docker
check_docker_containers() {
    log_message "INFO" "Verificando containers Docker..."
    
    local services=("powerchip-app" "redis" "nginx" "n8n")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if check_service_running "$service"; then
            log_message "SUCCESS" "Serviço $service está rodando"
            
            # Verificar saúde do container
            local container_id=$(docker-compose -f $DOCKER_COMPOSE_FILE ps -q "$service")
            if [ -n "$container_id" ]; then
                local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_id" 2>/dev/null || echo "unknown")
                
                if [ "$health_status" = "healthy" ] || [ "$health_status" = "unknown" ]; then
                    log_message "SUCCESS" "Container $service está saudável"
                else
                    log_message "WARNING" "Container $service não está saudável: $health_status"
                    failed_services+=("$service")
                fi
            fi
        else
            log_message "ERROR" "Serviço $service não está rodando"
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        local failed_list=$(IFS=', '; echo "${failed_services[*]}")
        send_alert "Serviços com problema" "Os seguintes serviços estão com problema: $failed_list" "critical"
        return 1
    fi
    
    return 0
}

# Função para verificar endpoints HTTP
check_http_endpoints() {
    log_message "INFO" "Verificando endpoints HTTP..."
    
    local failed_endpoints=()
    
    # Verificar aplicação principal
    if ! check_http_response "$APP_URL" "200" 10; then
        failed_endpoints+=("Aplicação Principal")
    fi
    
    # Verificar API de saúde
    if ! check_http_response "$API_URL" "200" 5; then
        failed_endpoints+=("API Health")
    fi
    
    # Verificar N8N
    if ! check_http_response "$N8N_URL" "200" 10; then
        failed_endpoints+=("N8N")
    fi
    
    if [ ${#failed_endpoints[@]} -gt 0 ]; then
        local failed_list=$(IFS=', '; echo "${failed_endpoints[*]}")
        send_alert "Endpoints com problema" "Os seguintes endpoints estão inacessíveis: $failed_list" "critical"
        return 1
    fi
    
    return 0
}

# Função para verificar Redis
check_redis() {
    log_message "INFO" "Verificando Redis..."
    
    if docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli ping | grep -q "PONG"; then
        log_message "SUCCESS" "Redis está respondendo"
        
        # Verificar uso de memória do Redis
        local redis_memory=$(docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli info memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
        log_message "INFO" "Redis usando: $redis_memory de memória"
        
        return 0
    else
        log_message "ERROR" "Redis não está respondendo"
        send_alert "Redis com problema" "Redis não está respondendo ao comando PING" "critical"
        return 1
    fi
}

# Função para verificar logs de erro
check_error_logs() {
    log_message "INFO" "Verificando logs de erro..."
    
    local error_count=0
    local log_files=("logs/app.log" "logs/nginx.log" "logs/n8n.log")
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            # Contar erros nas últimas 5 minutos
            local recent_errors=$(grep -c "ERROR\|FATAL\|CRITICAL" "$log_file" 2>/dev/null | tail -100 || echo "0")
            error_count=$((error_count + recent_errors))
        fi
    done
    
    if [ "$error_count" -gt 10 ]; then
        send_alert "Muitos erros nos logs" "Encontrados $error_count erros recentes nos logs" "warning"
    else
        log_message "SUCCESS" "Logs sem erros críticos ($error_count erros encontrados)"
    fi
}

# Função para verificar certificados SSL
check_ssl_certificates() {
    log_message "INFO" "Verificando certificados SSL..."
    
    local domain="powerchip.com.br"
    
    if command -v openssl &> /dev/null; then
        local expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
        
        if [ -n "$expiry_date" ]; then
            local expiry_timestamp=$(date -d "$expiry_date" +%s)
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ "$days_until_expiry" -lt 30 ]; then
                send_alert "Certificado SSL expirando" "Certificado SSL expira em $days_until_expiry dias" "warning"
            else
                log_message "SUCCESS" "Certificado SSL válido por mais $days_until_expiry dias"
            fi
        else
            log_message "WARNING" "Não foi possível verificar o certificado SSL"
        fi
    else
        log_message "WARNING" "OpenSSL não está instalado"
    fi
}

# Função para gerar relatório de status
generate_status_report() {
    local report_file="reports/status-$(date +%Y%m%d-%H%M%S).json"
    mkdir -p reports
    
    log_message "INFO" "Gerando relatório de status..."
    
    # Coletar métricas
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    local uptime=$(uptime -p)
    local load_average=$(uptime | awk -F'load average:' '{print $2}')
    
    # Gerar JSON
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "status": "healthy",
  "system": {
    "cpu_usage": "$cpu_usage%",
    "memory_usage": "$memory_usage%",
    "disk_usage": "$disk_usage%",
    "uptime": "$uptime",
    "load_average": "$load_average"
  },
  "services": {
    "powerchip-app": "$(check_service_running 'powerchip-app' && echo 'running' || echo 'stopped')",
    "redis": "$(check_service_running 'redis' && echo 'running' || echo 'stopped')",
    "nginx": "$(check_service_running 'nginx' && echo 'running' || echo 'stopped')",
    "n8n": "$(check_service_running 'n8n' && echo 'running' || echo 'stopped')"
  },
  "endpoints": {
    "app_url": "$APP_URL",
    "api_url": "$API_URL",
    "n8n_url": "$N8N_URL"
  }
}
EOF
    
    log_message "SUCCESS" "Relatório gerado: $report_file"
}

# Função para monitoramento completo
full_monitoring() {
    log_message "INFO" "Iniciando monitoramento completo..."
    
    local overall_status=0
    
    # Verificar recursos do sistema
    check_system_resources || overall_status=1
    
    # Verificar containers
    check_docker_containers || overall_status=1
    
    # Verificar endpoints
    check_http_endpoints || overall_status=1
    
    # Verificar Redis
    check_redis || overall_status=1
    
    # Verificar logs de erro
    check_error_logs
    
    # Verificar SSL
    check_ssl_certificates
    
    # Gerar relatório
    generate_status_report
    
    if [ $overall_status -eq 0 ]; then
        log_message "SUCCESS" "Monitoramento completo: Todos os serviços estão funcionando normalmente"
    else
        log_message "ERROR" "Monitoramento completo: Alguns serviços apresentam problemas"
        send_alert "Problemas detectados" "O monitoramento detectou problemas nos serviços. Verifique os logs." "critical"
    fi
    
    return $overall_status
}

# Função para monitoramento rápido
quick_monitoring() {
    log_message "INFO" "Iniciando monitoramento rápido..."
    
    # Verificar apenas serviços críticos
    check_docker_containers
    check_http_response "$APP_URL" "200" 5
    check_redis
    
    log_message "SUCCESS" "Monitoramento rápido concluído"
}

# Função para configurar monitoramento automático
setup_cron() {
    log_message "INFO" "Configurando monitoramento automático..."
    
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/scripts/monitor.sh quick") | crontab -
    (crontab -l 2>/dev/null; echo "0 */1 * * * $(pwd)/scripts/monitor.sh full") | crontab -
    (crontab -l 2>/dev/null; echo "0 6 * * * $(pwd)/scripts/monitor.sh report") | crontab -
    
    log_message "SUCCESS" "Monitoramento automático configurado:"
    log_message "INFO" "- Monitoramento rápido: a cada 5 minutos"
    log_message "INFO" "- Monitoramento completo: a cada hora"
    log_message "INFO" "- Relatório diário: às 6h"
}

# Função para mostrar ajuda
show_help() {
    echo "PowerChip E-commerce - Script de Monitoramento"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos:"
    echo "  full        Monitoramento completo (padrão)"
    echo "  quick       Monitoramento rápido"
    echo "  system      Verificar apenas recursos do sistema"
    echo "  services    Verificar apenas serviços Docker"
    echo "  endpoints   Verificar apenas endpoints HTTP"
    echo "  redis       Verificar apenas Redis"
    echo "  ssl         Verificar apenas certificados SSL"
    echo "  report      Gerar relatório de status"
    echo "  setup-cron  Configurar monitoramento automático"
    echo "  help        Mostrar esta ajuda"
    echo ""
}

# Função principal
main() {
    # Criar diretórios necessários
    mkdir -p logs reports
    
    case "$1" in
        full|"")
            full_monitoring
            ;;
        quick)
            quick_monitoring
            ;;
        system)
            check_system_resources
            ;;
        services)
            check_docker_containers
            ;;
        endpoints)
            check_http_endpoints
            ;;
        redis)
            check_redis
            ;;
        ssl)
            check_ssl_certificates
            ;;
        report)
            generate_status_report
            ;;
        setup-cron)
            setup_cron
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_message "ERROR" "Comando desconhecido: $1"
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"