# 🚨 Troubleshooting - Problema de Conectividade SSH

## ❌ Problema Identificado

O servidor VPS **213.199.54.137** está respondendo ao ping, mas a **porta 22 (SSH) não está acessível**.

### Resultados dos Testes:
- ✅ **Ping**: Servidor responde (218ms de latência)
- ❌ **SSH (porta 22)**: Conexão falha com timeout
- ❌ **Test-NetConnection**: TcpTestSucceeded = False

## 🔍 Possíveis Causas

### 1. Firewall do Servidor
- O firewall (UFW) pode estar bloqueando a porta 22
- Regras de iptables restritivas

### 2. Serviço SSH Não Iniciado
- O serviço SSH (sshd) pode não estar rodando
- Configuração incorreta do SSH

### 3. Firewall do Provedor VPS
- Firewall externo bloqueando a porta 22
- Configurações de segurança do datacenter

### 4. Configuração de Rede
- Porta SSH alterada (não é a padrão 22)
- Problemas de roteamento

## 🛠️ Soluções

### Opção 1: Acesso via Painel do Provedor VPS

1. **Acesse o painel de controle da VPS**
   - Entre no painel do seu provedor (DigitalOcean, Vultr, AWS, etc.)
   - Procure por "Console" ou "VNC Access"

2. **Conecte via console web**
   - Use o console web para acessar o servidor
   - Faça login com: `cybercolll.ti@gmail.com` / `S1sAdm1N`

3. **Verificar e corrigir SSH**
   ```bash
   # Verificar status do SSH
   sudo systemctl status ssh
   
   # Iniciar SSH se não estiver rodando
   sudo systemctl start ssh
   sudo systemctl enable ssh
   
   # Verificar firewall
   sudo ufw status
   
   # Permitir SSH
   sudo ufw allow 22/tcp
   sudo ufw reload
   
   # Verificar se a porta está ouvindo
   sudo netstat -tlnp | grep :22
   ```

### Opção 2: Verificar Configurações do Provedor

1. **Firewall Externo**
   - Verifique se há firewall no painel do provedor
   - Certifique-se de que a porta 22 está liberada

2. **Security Groups (AWS/DigitalOcean)**
   - Verifique as regras de segurança
   - Adicione regra para porta 22 (SSH)

3. **Configurações de Rede**
   - Verifique se o IP público está correto
   - Confirme se não há NAT ou proxy bloqueando

### Opção 3: SSH em Porta Alternativa

Teste se o SSH está em outra porta:

```powershell
# Testar portas comuns do SSH
Test-NetConnection -ComputerName 213.199.54.137 -Port 2222
Test-NetConnection -ComputerName 213.199.54.137 -Port 2200
Test-NetConnection -ComputerName 213.199.54.137 -Port 22000
```

## 🔧 Comandos para Executar no Console da VPS

Quando conseguir acesso via console web:

```bash
# 1. Verificar e configurar SSH
sudo systemctl status ssh
sudo systemctl start ssh
sudo systemctl enable ssh

# 2. Configurar firewall
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# 3. Verificar configuração SSH
sudo nano /etc/ssh/sshd_config
# Certifique-se de que:
# Port 22
# PermitRootLogin yes (ou no, dependendo da configuração)
# PasswordAuthentication yes

# 4. Reiniciar SSH
sudo systemctl restart ssh

# 5. Verificar se está ouvindo
sudo netstat -tlnp | grep :22
sudo ss -tlnp | grep :22

# 6. Testar conectividade local
ssh localhost
```

## 📞 Próximos Passos

### Imediatos:
1. **Acesse o painel do provedor VPS**
2. **Use o console web para conectar**
3. **Execute os comandos de correção acima**
4. **Teste a conectividade SSH novamente**

### Após Corrigir SSH:
```powershell
# Testar conexão
ssh cybercolll.ti@gmail.com@213.199.54.137

# Se funcionar, executar deploy
.\scripts\deploy-windows.ps1 -Action full
```

## 🆘 Alternativas de Deploy

### Se SSH Continuar Indisponível:

1. **Upload Manual via SFTP/FTP**
   - Use FileZilla ou WinSCP
   - Faça upload dos arquivos manualmente

2. **Deploy via Git**
   ```bash
   # No console da VPS
   git clone https://github.com/seu-usuario/powerchip-ecommerce.git
   cd powerchip-ecommerce
   # Configurar manualmente
   ```

3. **Recriar VPS**
   - Como último recurso, recriar a VPS
   - Certificar-se de que SSH está habilitado

## 📋 Checklist de Verificação

- [ ] Acesso ao painel do provedor VPS
- [ ] Console web funcionando
- [ ] Serviço SSH iniciado
- [ ] Firewall configurado (porta 22 liberada)
- [ ] Configuração SSH correta
- [ ] Teste de conectividade SSH bem-sucedido
- [ ] Deploy executado com sucesso

---

**Status**: SSH inacessível na porta 22  
**Próxima ação**: Acessar console web da VPS  
**Data**: Janeiro 2025