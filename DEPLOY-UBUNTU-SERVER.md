# Deploy PowerChip E-commerce - Ubuntu Server

## 🖥️ Informações da VPS

- **IP**: 213.199.54.137
- **SO**: Ubuntu Server
- **Usuário**: cybercolll.ti@gmail.com
- **Senha**: S1sAdm1N
- **Domínio**: powerchip-agente-ia.com.br

## 🚀 Deploy Automático

### Pré-requisitos (Windows)

1. **Instalar WSL2 e Ubuntu** (se não tiver):
```powershell
wsl --install -d Ubuntu
```

2. **Instalar sshpass no Ubuntu/WSL**:
```bash
sudo apt update
sudo apt install sshpass
```

### Executar Deploy

1. **Deploy Completo** (primeira vez):
```bash
cd powerchip-ecommerce
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh full
```

2. **Deploy Rápido** (atualizações):
```bash
./scripts/deploy-vps.sh quick
```

3. **Verificar Status**:
```bash
./scripts/deploy-vps.sh status
```

4. **Ver Logs**:
```bash
./scripts/deploy-vps.sh logs
./scripts/deploy-vps.sh logs powerchip-app
./scripts/deploy-vps.sh logs nginx
```

## 🔧 Deploy Manual (Ubuntu Server)

### 1. Conectar ao Servidor

```bash
ssh cybercolll.ti@gmail.com@213.199.54.137
# Senha: S1sAdm1N
```

### 2. Preparar o Servidor Ubuntu

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y curl wget git unzip nginx certbot python3-certbot-nginx ufw htop

# Configurar firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar para aplicar mudanças do Docker
sudo reboot
```

### 3. Clonar e Configurar Aplicação

```bash
# Reconectar após reboot
ssh cybercolll.ti@gmail.com@213.199.54.137

# Criar diretório
sudo mkdir -p /home/powerchip
sudo chown $USER:$USER /home/powerchip
cd /home/powerchip

# Clonar repositório (ou fazer upload manual)
git clone https://github.com/seu-usuario/powerchip-ecommerce.git .

# Ou fazer upload via SCP do Windows:
# scp -r ./powerchip-ecommerce/* cybercolll.ti@gmail.com@213.199.54.137:/home/powerchip/
```

### 4. Configurar Variáveis de Ambiente

```bash
cd /home/powerchip
cat > .env << 'EOF'
# PowerChip E-commerce - Produção Ubuntu Server
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://powerchip-agente-ia.com.br
NEXT_PUBLIC_API_URL=https://powerchip-agente-ia.com.br/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xrtwemlaecwktsyuphjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydHdlbWxhZWN3a3RzeXVwaGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODUzNjAsImV4cCI6MjA3MTk2MTM2MH0.-QubGuQ74P2W4XkH_qjoAAZI5hO2agv3xVepLlCAQeg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydHdlbWxhZWN3a3RzeXVwaGp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM4NTM2MCwiZXhwIjoyMDcxOTYxMzYwfQ.rl3-qx18P49lcMZ7iJBHXwbdN1RFZldE-2gZ_kGBOuE

# Autenticação
NEXTAUTH_URL=https://powerchip-agente-ia.com.br
NEXTAUTH_SECRET=powerchip-nextauth-secret-key-2024-production-ultra-secure

# Mercado Pago - CONFIGURE AS CREDENCIAIS REAIS DE PRODUÇÃO
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-your-production-public-key-here
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-your-production-access-token-here
MERCADO_PAGO_WEBHOOK_SECRET=your-production-webhook-secret-here

# Empresa
NEXT_PUBLIC_COMPANY_NAME=PowerChip
NEXT_PUBLIC_COMPANY_EMAIL=powerchip@powerchip-agente-ia.com.br
NEXT_PUBLIC_COMPANY_PHONE=61 98143-7533
NEXT_PUBLIC_COMPANY_DOMAIN=powerchip-agente-ia.com.br
NEXT_PUBLIC_COMPANY_IP=213.199.54.137

# N8N
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://powerchip-agente-ia.com.br/webhook
N8N_HOST=powerchip-agente-ia.com.br
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=PowerChip2024!

# Segurança
JWT_SECRET=powerchip-jwt-secret-2024-production-ultra-secure-key

# Redis
REDIS_PASSWORD=PowerChipRedis2024!
EOF
```

### 5. Configurar Nginx

```bash
# Criar configuração do site
sudo tee /etc/nginx/sites-available/powerchip-agente-ia.com.br > /dev/null << 'EOF'
server {
    listen 80;
    server_name powerchip-agente-ia.com.br www.powerchip-agente-ia.com.br;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name powerchip-agente-ia.com.br www.powerchip-agente-ia.com.br;
    
    # SSL Configuration (será configurado pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/powerchip-agente-ia.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/powerchip-agente-ia.com.br/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # N8N automation
    location /n8n/ {
        proxy_pass http://localhost:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Webhook endpoints
    location /webhook {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/powerchip-agente-ia.com.br /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t
```

### 6. Configurar SSL com Let's Encrypt

```bash
# Parar Nginx temporariamente
sudo systemctl stop nginx

# Obter certificado SSL
sudo certbot certonly --standalone \
  -d powerchip-agente-ia.com.br \
  -d www.powerchip-agente-ia.com.br \
  --email cybercolll.ti@gmail.com \
  --agree-tos \
  --non-interactive

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configurar renovação automática
echo '0 12 * * * /usr/bin/certbot renew --quiet' | sudo crontab -
```

### 7. Deploy da Aplicação

```bash
cd /home/powerchip

# Construir e iniciar aplicação
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f powerchip-app
```

## 🔍 Verificação e Monitoramento

### Comandos Úteis Ubuntu Server

```bash
# Status dos serviços
sudo systemctl status nginx
sudo systemctl status docker
docker-compose -f docker-compose.prod.yml ps

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
docker-compose -f docker-compose.prod.yml logs -f

# Recursos do sistema
htop
df -h
free -h

# Portas em uso
sudo netstat -tulpn | grep LISTEN

# Firewall status
sudo ufw status

# Certificados SSL
sudo certbot certificates
```

### Health Check

```bash
# Testar aplicação
curl -I http://localhost:3000
curl -I https://powerchip-agente-ia.com.br

# Testar N8N
curl -I http://localhost:5678

# Testar Redis (se usando)
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## 🛠️ Manutenção

### Atualizações

```bash
# Atualizar código
cd /home/powerchip
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Backup

```bash
# Backup da aplicação
tar -czf powerchip-backup-$(date +%Y%m%d).tar.gz /home/powerchip

# Backup do banco (se local)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres powerchip > backup.sql
```

### Limpeza

```bash
# Limpar Docker
docker system prune -f
docker image prune -f
docker volume prune -f

# Limpar logs antigos
sudo find /var/log -name "*.log" -type f -mtime +30 -delete
```

## 🚨 Troubleshooting Ubuntu Server

### Problemas Comuns

1. **Aplicação não inicia**:
```bash
docker-compose -f docker-compose.prod.yml logs powerchip-app
docker-compose -f docker-compose.prod.yml restart powerchip-app
```

2. **Nginx não funciona**:
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

3. **SSL não funciona**:
```bash
sudo certbot certificates
sudo certbot renew --dry-run
sudo systemctl reload nginx
```

4. **Firewall bloqueando**:
```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

5. **Docker não funciona**:
```bash
sudo systemctl status docker
sudo systemctl restart docker
sudo usermod -aG docker $USER
# Logout e login novamente
```

## 📋 Checklist de Deploy Ubuntu Server

- [ ] Servidor Ubuntu atualizado
- [ ] Docker e Docker Compose instalados
- [ ] Firewall configurado (UFW)
- [ ] Aplicação clonada/enviada
- [ ] Arquivo .env configurado
- [ ] Nginx configurado
- [ ] SSL configurado (Let's Encrypt)
- [ ] Aplicação rodando (Docker)
- [ ] DNS apontando para o IP
- [ ] Testes de funcionalidade
- [ ] Monitoramento ativo
- [ ] Backup configurado

## 🔐 Configurações de Segurança Ubuntu

```bash
# Configurar fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Configurar atualizações automáticas
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configurar swap (se necessário)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

**Última atualização**: $(date +"%d/%m/%Y")
**Sistema**: Ubuntu Server
**VPS**: 213.199.54.137