# PowerChip E-commerce - Automações N8N

Este diretório contém as configurações e workflows para automações do e-commerce PowerChip usando N8N.

## 📋 Visão Geral

O N8N é usado para automatizar processos do e-commerce, incluindo:

- ✉️ **Notificações por email** (novos pedidos, pagamentos aprovados)
- 📦 **Alertas de estoque baixo**
- ⭐ **Monitoramento de avaliações negativas**
- 📊 **Relatórios diários automatizados**
- 🔄 **Integração com APIs externas**

## 🚀 Configuração Inicial

### 1. Pré-requisitos

- Docker e Docker Compose instalados
- Arquivo `.env` configurado no diretório raiz
- E-commerce PowerChip rodando

### 2. Variáveis de Ambiente Necessárias

Configure estas variáveis no arquivo `.env`:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token

# E-commerce API
ECOMMERCE_ADMIN_TOKEN=your_admin_token

# Email (Gmail)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# N8N Auth
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=powerchip2024
```

### 3. Iniciar N8N

```bash
# Usando Docker Compose
docker-compose -f docker-compose.n8n.yml up -d

# Ou usando o script de gerenciamento
./scripts/n8n-manager.sh start
```

### 4. Acessar Interface

- **URL:** http://localhost:5678
- **Usuário:** admin
- **Senha:** powerchip2024

## 📁 Estrutura de Arquivos

```
n8n/
├── workflows/                 # Workflows do N8N
│   ├── ecommerce-automation.json    # Automações principais
│   └── inventory-automation.json    # Automações de estoque
├── credentials/               # Configurações de credenciais
│   └── credentials.json            # Credenciais e webhooks
└── README.md                 # Este arquivo
```

## 🔄 Workflows Disponíveis

### 1. E-commerce Automation

**Arquivo:** `workflows/ecommerce-automation.json`

**Funcionalidades:**
- Notificação de novos pedidos para admin
- Email de confirmação para clientes
- Notificação de pagamentos aprovados

**Webhooks:**
- `POST /webhook/order-created` - Novo pedido criado
- `POST /webhook/payment-status` - Status de pagamento alterado

### 2. Inventory Automation

**Arquivo:** `workflows/inventory-automation.json`

**Funcionalidades:**
- Alertas de estoque baixo
- Monitoramento de avaliações negativas
- Relatórios diários automatizados

**Webhooks:**
- `POST /webhook/low-stock` - Estoque baixo
- `POST /webhook/product-review` - Nova avaliação
- `POST /webhook/daily-report` - Relatório diário

## 🔗 Integração com E-commerce

### Chamadas de Webhook no Código

Para integrar os workflows com o e-commerce, adicione estas chamadas nos pontos apropriados:

```typescript
// Após criar um pedido
fetch('http://localhost:5678/webhook/order-created', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'order.created',
    order: orderData
  })
})

// Após mudança de status de pagamento
fetch('http://localhost:5678/webhook/payment-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'approved',
    paymentId: paymentId,
    order: orderData
  })
})

// Para alertas de estoque baixo
fetch('http://localhost:5678/webhook/low-stock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product: productData,
    stock: currentStock,
    minStock: minimumStock
  })
})
```

## 📧 Configuração de Email

### Gmail (Recomendado para desenvolvimento)

1. Ative a autenticação de 2 fatores na sua conta Google
2. Gere uma senha de app específica
3. Configure as variáveis:
   ```bash
   GMAIL_USER=seu_email@gmail.com
   GMAIL_APP_PASSWORD=sua_senha_de_app
   ```

### SMTP Customizado (Produção)

```bash
SMTP_USER=seu_usuario_smtp
SMTP_PASSWORD=sua_senha_smtp
SMTP_HOST=seu_servidor_smtp
SMTP_PORT=587
SMTP_SECURE=false
SMTP_TLS=true
```

## 🛠️ Comandos Úteis

### Gerenciamento com Script

```bash
# Iniciar N8N
./scripts/n8n-manager.sh start

# Parar N8N
./scripts/n8n-manager.sh stop

# Ver logs
./scripts/n8n-manager.sh logs

# Status dos containers
./scripts/n8n-manager.sh status

# Backup dos workflows
./scripts/n8n-manager.sh backup

# Testar webhooks
./scripts/n8n-manager.sh test
```

### Docker Compose Direto

```bash
# Iniciar
docker-compose -f docker-compose.n8n.yml up -d

# Parar
docker-compose -f docker-compose.n8n.yml down

# Logs
docker-compose -f docker-compose.n8n.yml logs -f n8n

# Status
docker-compose -f docker-compose.n8n.yml ps
```

## 🔧 Personalização

### Adicionando Novos Workflows

1. Crie o workflow na interface do N8N
2. Exporte o workflow como JSON
3. Salve na pasta `workflows/`
4. Faça backup regularmente

### Modificando Templates de Email

Os templates de email estão nos workflows. Para modificar:

1. Acesse a interface do N8N
2. Edite o nó "Email Send"
3. Modifique o campo "Message" com HTML
4. Salve o workflow

### Adicionando Novas Integrações

1. Configure credenciais em `credentials/credentials.json`
2. Adicione variáveis de ambiente necessárias
3. Crie novos nós nos workflows
4. Teste as integrações

## 📊 Monitoramento

### Logs do N8N

```bash
# Ver logs em tempo real
docker-compose -f docker-compose.n8n.yml logs -f n8n

# Ver logs específicos
docker logs powerchip-n8n
```

### Métricas

O N8N está configurado com métricas habilitadas. Acesse:
- Interface: http://localhost:5678
- Execuções: Menu "Executions"
- Workflows: Menu "Workflows"

## 🚨 Troubleshooting

### Problemas Comuns

1. **N8N não inicia:**
   - Verifique se as portas 5678 e 6379 estão livres
   - Confirme se o Docker está rodando
   - Verifique o arquivo `.env`

2. **Webhooks não funcionam:**
   - Confirme se o N8N está acessível
   - Verifique os logs do workflow
   - Teste manualmente com curl

3. **Emails não são enviados:**
   - Verifique as credenciais SMTP
   - Confirme as configurações de firewall
   - Teste com Gmail primeiro

### Comandos de Debug

```bash
# Verificar containers
docker ps | grep powerchip

# Logs detalhados
docker-compose -f docker-compose.n8n.yml logs --tail=100 n8n

# Entrar no container
docker exec -it powerchip-n8n /bin/sh

# Testar conectividade
curl -X GET http://localhost:5678/healthz
```

## 📝 Backup e Restauração

### Backup Automático

```bash
# Fazer backup
./scripts/n8n-manager.sh backup

# Backups são salvos em: backups/n8n/YYYYMMDD_HHMMSS/
```

### Restauração

```bash
# Restaurar de backup
./scripts/n8n-manager.sh restore backups/n8n/20240101_120000/
```

### Backup Manual

```bash
# Copiar workflows
cp -r n8n/workflows backups/

# Exportar banco de dados
docker-compose -f docker-compose.n8n.yml exec n8n cat /home/node/.n8n/database.sqlite > backup-db.sqlite
```

## 🔐 Segurança

### Recomendações

1. **Altere as credenciais padrão**
2. **Use HTTPS em produção**
3. **Configure firewall adequadamente**
4. **Mantenha backups regulares**
5. **Monitore logs de acesso**

### Configuração de Produção

```yaml
# docker-compose.n8n.yml (produção)
environment:
  - N8N_BASIC_AUTH_ACTIVE=true
  - N8N_BASIC_AUTH_USER=${N8N_USER}
  - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
  - N8N_PROTOCOL=https
  - N8N_HOST=n8n.seudominio.com
  - WEBHOOK_URL=https://n8n.seudominio.com/
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte os logs do N8N
2. Verifique a documentação oficial: https://docs.n8n.io
3. Teste os webhooks manualmente
4. Verifique as configurações de rede

---

**PowerChip E-commerce** - Sistema de automações com N8N