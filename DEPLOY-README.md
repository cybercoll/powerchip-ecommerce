# 🚀 Deploy PowerChip E-commerce - Guia Completo

## 📋 Informações da VPS

- **IP**: 213.199.54.137
- **Sistema**: Ubuntu Server
- **Usuário**: cybercolll.ti@gmail.com
- **Senha**: S1sAdm1N
- **Domínio**: powerchip-agente-ia.com.br

## 🎯 Opções de Deploy

### 1. Deploy Automático via Windows (Recomendado)

**Pré-requisitos:**
- Windows 10/11 com OpenSSH ou PuTTY
- PowerShell 5.1+

**Comandos:**
```powershell
# Deploy completo (primeira vez)
.\scripts\deploy-windows.ps1 -Action full

# Deploy rápido (atualizações)
.\scripts\deploy-windows.ps1 -Action quick

# Verificar status
.\scripts\deploy-windows.ps1 -Action status

# Ver logs
.\scripts\deploy-windows.ps1 -Action logs
.\scripts\deploy-windows.ps1 -Action logs -Service nginx

# Configurar SSL
.\scripts\deploy-windows.ps1 -Action ssl
```

### 2. Deploy via WSL/Linux

**Pré-requisitos:**
- WSL2 com Ubuntu ou Linux nativo
- sshpass instalado

**Comandos:**
```bash
# Instalar sshpass (se necessário)
sudo apt update && sudo apt install sshpass

# Deploy completo
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh full

# Deploy rápido
./scripts/deploy-vps.sh quick

# Status e logs
./scripts/deploy-vps.sh status
./scripts/deploy-vps.sh logs powerchip-app
```

### 3. Deploy Manual

Siga o guia detalhado em: `DEPLOY-UBUNTU-SERVER.md`

## 🔧 Configuração Inicial

### 1. Instalar OpenSSH no Windows (se necessário)

```powershell
# Como Administrador
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### 2. Verificar Conectividade

```powershell
# Testar conexão SSH
ssh cybercolll.ti@gmail.com@213.199.54.137
# Senha: S1sAdm1N
```

### 3. Configurar DNS

Aponte o domínio `powerchip-agente-ia.com.br` para o IP `213.199.54.137`:

```
Tipo: A
Nome: @
Valor: 213.199.54.137
TTL: 3600

Tipo: A
Nome: www
Valor: 213.199.54.137
TTL: 3600
```

## 🚀 Processo de Deploy Completo

### Primeira Vez (Deploy Full)

1. **Preparar ambiente local:**
   ```powershell
   cd powerchip-ecommerce
   # Verificar se .env está configurado
   ```

2. **Executar deploy:**
   ```powershell
   .\scripts\deploy-windows.ps1 -Action full
   ```

3. **O script irá:**
   - ✅ Verificar pré-requisitos
   - ✅ Preparar servidor Ubuntu
   - ✅ Instalar Docker e dependências
   - ✅ Configurar firewall
   - ✅ Fazer upload dos arquivos
   - ✅ Configurar variáveis de ambiente
   - ✅ Configurar Nginx
   - ✅ Configurar SSL (Let's Encrypt)
   - ✅ Fazer deploy da aplicação
   - ✅ Verificar saúde dos serviços

### Atualizações (Deploy Quick)

```powershell
.\scripts\deploy-windows.ps1 -Action quick
```

## 🔍 Monitoramento e Logs

### Verificar Status

```powershell
# Status geral
.\scripts\deploy-windows.ps1 -Action status

# Logs da aplicação
.\scripts\deploy-windows.ps1 -Action logs -Service powerchip-app

# Logs do Nginx
.\scripts\deploy-windows.ps1 -Action logs -Service nginx

# Logs do N8N
.\scripts\deploy-windows.ps1 -Action logs -Service n8n
```

### Acesso Direto ao Servidor

```bash
# Conectar via SSH
ssh cybercolll.ti@gmail.com@213.199.54.137

# Verificar containers
cd /home/powerchip
docker-compose -f docker-compose.prod.yml ps

# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f powerchip-app

# Status do sistema
htop
df -h
free -h
```

## 🔒 Configurações de Segurança

### Credenciais do Mercado Pago

**⚠️ IMPORTANTE:** Após o deploy, configure as credenciais reais:

1. **Conectar ao servidor:**
   ```bash
   ssh cybercolll.ti@gmail.com@213.199.54.137
   ```

2. **Editar arquivo .env:**
   ```bash
   cd /home/powerchip
   nano .env
   ```

3. **Substituir as linhas:**
   ```env
   NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=SUA_PUBLIC_KEY_REAL
   MERCADO_PAGO_ACCESS_TOKEN=SEU_ACCESS_TOKEN_REAL
   MERCADO_PAGO_WEBHOOK_SECRET=SEU_WEBHOOK_SECRET_REAL
   ```

4. **Reiniciar aplicação:**
   ```bash
   docker-compose -f docker-compose.prod.yml restart powerchip-app
   ```

### Configurar Webhooks do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Configure a URL do webhook: `https://powerchip-agente-ia.com.br/api/payments/webhook`
3. Eventos: `payment`, `merchant_order`

## 🌐 URLs da Aplicação

Após o deploy bem-sucedido:

- **Site Principal**: https://powerchip-agente-ia.com.br
- **Admin**: https://powerchip-agente-ia.com.br/admin
- **N8N**: https://powerchip-agente-ia.com.br/n8n
- **API**: https://powerchip-agente-ia.com.br/api
- **Webhooks**: https://powerchip-agente-ia.com.br/webhook

## 🛠️ Comandos Úteis

### Reiniciar Serviços

```bash
# Reiniciar aplicação
docker-compose -f docker-compose.prod.yml restart powerchip-app

# Reiniciar todos os serviços
docker-compose -f docker-compose.prod.yml restart

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Backup

```bash
# Backup da aplicação
tar -czf powerchip-backup-$(date +%Y%m%d).tar.gz /home/powerchip

# Backup do banco (Supabase é externo, não precisa)
```

### Limpeza

```bash
# Limpar Docker
docker system prune -f
docker image prune -f

# Limpar logs antigos
sudo find /var/log -name "*.log" -type f -mtime +30 -delete
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão SSH:**
   ```powershell
   # Verificar se OpenSSH está instalado
   ssh -V
   
   # Testar conexão
   ssh -v cybercolll.ti@gmail.com@213.199.54.137
   ```

2. **Aplicação não inicia:**
   ```bash
   # Ver logs detalhados
   docker-compose -f docker-compose.prod.yml logs powerchip-app
   
   # Verificar variáveis de ambiente
   docker-compose -f docker-compose.prod.yml exec powerchip-app env
   ```

3. **SSL não funciona:**
   ```bash
   # Verificar certificados
   sudo certbot certificates
   
   # Renovar certificados
   sudo certbot renew --dry-run
   
   # Recarregar Nginx
   sudo systemctl reload nginx
   ```

4. **Firewall bloqueando:**
   ```bash
   # Verificar status do firewall
   sudo ufw status
   
   # Permitir portas necessárias
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Logs Importantes

```bash
# Logs da aplicação
docker-compose -f docker-compose.prod.yml logs -f powerchip-app

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs do sistema
sudo journalctl -f -u nginx
sudo journalctl -f -u docker
```

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] DNS configurado apontando para 213.199.54.137
- [ ] Arquivo .env configurado
- [ ] OpenSSH ou PuTTY instalado
- [ ] Conectividade SSH testada
- [ ] Credenciais do Mercado Pago prontas

### Durante o Deploy
- [ ] Script executado sem erros
- [ ] Servidor preparado (Docker, Nginx, etc.)
- [ ] Arquivos enviados com sucesso
- [ ] SSL configurado
- [ ] Aplicação iniciada
- [ ] Health check passou

### Após o Deploy
- [ ] Site acessível via HTTPS
- [ ] Admin funcionando
- [ ] Credenciais do Mercado Pago configuradas
- [ ] Webhooks configurados
- [ ] Testes de pagamento realizados
- [ ] Monitoramento ativo

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs: `.\scripts\deploy-windows.ps1 -Action logs`
2. Verifique o status: `.\scripts\deploy-windows.ps1 -Action status`
3. Consulte este guia de troubleshooting
4. Acesse o servidor diretamente via SSH para debug

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0
**Sistema**: Ubuntu Server
**VPS**: 213.199.54.137