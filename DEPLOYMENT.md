# PowerChip E-commerce - Guia de Deploy

Este guia fornece instruções completas para fazer o deploy do PowerChip E-commerce em um VPS usando Docker e nginx.

## 📋 Pré-requisitos

### Servidor VPS
- **OS**: Ubuntu 20.04+ ou CentOS 8+
- **RAM**: Mínimo 4GB (Recomendado 8GB+)
- **CPU**: Mínimo 2 cores (Recomendado 4+ cores)
- **Armazenamento**: Mínimo 50GB SSD
- **Rede**: IP público com portas 80, 443, 22 abertas

### Software Necessário
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Nginx (será instalado via Docker)
- Certbot (para SSL)

## 🚀 Instalação Inicial

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y curl wget git unzip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sessão para aplicar mudanças do Docker
logout
```

### 2. Clonar o Repositório

```bash
# Clonar projeto
git clone https://github.com/seu-usuario/powerchip-ecommerce.git
cd powerchip-ecommerce

# Dar permissão aos scripts
chmod +x scripts/*.sh
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.production .env

# Editar configurações
nano .env
```

**Variáveis Obrigatórias:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`
- `REDIS_PASSWORD`
- `N8N_BASIC_AUTH_PASSWORD`
- `SMTP_USER` e `SMTP_PASS`

## 🔧 Deploy

### Deploy Automático (Recomendado)

```bash
# Deploy completo
./scripts/deploy.sh deploy

# Ou deploy rápido (sem rebuild)
./scripts/deploy.sh quick
```

### Deploy Manual

```bash
# 1. Construir imagens
docker-compose -f docker-compose.prod.yml build

# 2. Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# 3. Verificar status
docker-compose -f docker-compose.prod.yml ps
```

## 🔒 Configurar SSL

### Usando Let's Encrypt (Automático)

```bash
# Configurar SSL automaticamente
./scripts/deploy.sh ssl powerchip.com.br admin@powerchip.com.br
```

### Configuração Manual

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d powerchip.com.br -d www.powerchip.com.br

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🌐 Configuração de DNS

Configure os seguintes registros DNS:

```
A     powerchip.com.br        -> SEU_IP_VPS
A     www.powerchip.com.br    -> SEU_IP_VPS
A     n8n.powerchip.com.br    -> SEU_IP_VPS
CNAME api.powerchip.com.br    -> powerchip.com.br
```

## 📊 Monitoramento

### Verificar Status dos Serviços

```bash
# Status geral
./scripts/deploy.sh status

# Logs específicos
./scripts/deploy.sh logs powerchip-app
./scripts/deploy.sh logs nginx
./scripts/deploy.sh logs n8n

# Health check
./scripts/deploy.sh health
```

### Métricas e Logs

- **Aplicação**: `http://seu-dominio.com.br`
- **N8N**: `http://n8n.seu-dominio.com.br`
- **Grafana**: `http://seu-dominio.com.br:3001` (se habilitado)
- **Prometheus**: `http://seu-dominio.com.br:9090` (se habilitado)

## 🔄 Backup e Restore

### Backup Automático

```bash
# Backup manual
./scripts/deploy.sh backup

# Configurar backup automático (já configurado no docker-compose)
# Backups são salvos em: ./backups/
```

### Restore

```bash
# Rollback para versão anterior
./scripts/deploy.sh rollback
```

## 🛠️ Manutenção

### Atualizações

```bash
# Atualizar código
git pull origin main

# Deploy da nova versão
./scripts/deploy.sh deploy
```

### Limpeza

```bash
# Limpar recursos Docker não utilizados
./scripts/deploy.sh cleanup

# Limpar logs antigos
sudo find /var/log -name "*.log" -type f -mtime +30 -delete
```

### Reiniciar Serviços

```bash
# Reiniciar todos os serviços
./scripts/deploy.sh restart

# Reiniciar serviço específico
docker-compose -f docker-compose.prod.yml restart powerchip-app
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Aplicação não inicia
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs powerchip-app

# Verificar variáveis de ambiente
docker-compose -f docker-compose.prod.yml exec powerchip-app env
```

#### 2. Erro de conexão com banco
```bash
# Verificar conectividade com Supabase
curl -I https://your-project.supabase.co

# Testar credenciais
docker-compose -f docker-compose.prod.yml exec powerchip-app npm run test:db
```

#### 3. SSL não funciona
```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew --dry-run
```

#### 4. N8N não acessível
```bash
# Verificar logs do N8N
docker-compose -f docker-compose.prod.yml logs n8n

# Verificar configuração de rede
docker network ls
docker network inspect powerchip-ecommerce_default
```

### Comandos de Debug

```bash
# Entrar no container da aplicação
docker-compose -f docker-compose.prod.yml exec powerchip-app bash

# Verificar recursos do sistema
htop
df -h
free -h

# Verificar portas em uso
sudo netstat -tulpn | grep LISTEN
```

## 📈 Otimização de Performance

### 1. Configuração do Nginx

```bash
# Editar configuração do Nginx
nano nginx/conf.d/powerchip.conf

# Aplicar mudanças
docker-compose -f docker-compose.prod.yml restart nginx
```

### 2. Configuração do Redis

```bash
# Monitorar Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli monitor

# Verificar uso de memória
docker-compose -f docker-compose.prod.yml exec redis redis-cli info memory
```

### 3. Otimização de Imagens Docker

```bash
# Analisar tamanho das imagens
docker images

# Limpar cache de build
docker builder prune
```

## 🔐 Segurança

### Configurações Recomendadas

1. **Firewall**:
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

2. **Fail2Ban**:
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

3. **Atualizações Automáticas**:
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Backup de Segurança

```bash
# Backup completo do sistema
sudo rsync -avz --exclude='/proc' --exclude='/sys' --exclude='/dev' --exclude='/tmp' / /backup/system/

# Backup específico da aplicação
tar -czf powerchip-backup-$(date +%Y%m%d).tar.gz .
```

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs: `./scripts/deploy.sh logs`
2. Execute health check: `./scripts/deploy.sh health`
3. Consulte este guia de troubleshooting
4. Entre em contato com a equipe de desenvolvimento

## 📝 Checklist de Deploy

- [ ] Servidor configurado com requisitos mínimos
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] Arquivo `.env` configurado
- [ ] DNS configurado
- [ ] SSL configurado
- [ ] Deploy executado com sucesso
- [ ] Health check passou
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Testes de funcionalidade realizados

---

**Última atualização**: $(date +"%d/%m/%Y")
**Versão**: 1.0.0