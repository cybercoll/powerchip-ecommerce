# 🚀 Guia de Configuração para Produção - PowerChip E-commerce

## 📋 Pré-requisitos

- [ ] Conta no Mercado Pago verificada
- [ ] Domínio configurado (powerchip-agente-ia.com.br)
- [ ] Certificado SSL ativo
- [ ] Banco de dados Supabase configurado

## 🔐 Configuração do Mercado Pago

### 1. Obter Credenciais de Produção

1. **Acesse o Painel de Desenvolvedores**
   - Vá para: https://www.mercadopago.com.br/developers/panel/app
   - Faça login com sua conta Mercado Pago

2. **Criar/Acessar Aplicação**
   - Clique em "Criar aplicação" ou acesse uma existente
   - Nome sugerido: "PowerChip E-commerce"
   - Selecione "Pagamentos online e presenciais"

3. **Obter Credenciais de Produção**
   - No menu lateral, clique em "Produção"
   - Acesse "Credenciais de produção"
   - Copie:
     - **Public Key**: Começa com `APP_USR-`
     - **Access Token**: Começa com `APP_USR-`

### 2. Configurar Webhooks

1. **URL do Webhook**
   ```
   https://powerchip-agente-ia.com.br/api/payments/webhook
   ```

2. **Eventos a Configurar**
   - ✅ `payment` (Pagamentos)
   - ✅ `merchant_order` (Pedidos)

3. **Configurar no Painel**
   - Vá para "Webhooks" na aplicação
   - Adicione a URL acima
   - Selecione os eventos necessários
   - Salve a configuração

## 🔧 Configuração das Variáveis de Ambiente

### 1. Editar arquivo .env

```bash
# Abra o arquivo .env criado
nano .env
```

### 2. Substituir Credenciais do Mercado Pago

```env
# ANTES (credenciais de teste)
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-your-production-public-key-here
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-your-production-access-token-here

# DEPOIS (suas credenciais reais)
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-1234567890-abcdef
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1234567890-abcdef-ghijkl
```

### 3. Configurar Webhook Secret

```env
# Gere um secret seguro para validar webhooks
MERCADO_PAGO_WEBHOOK_SECRET=sua-chave-secreta-ultra-segura-aqui
```

## 🌐 Configuração de Domínio

### 1. URLs de Produção

Verifique se estas URLs estão corretas no `.env`:

```env
NEXT_PUBLIC_APP_URL=https://powerchip-agente-ia.com.br
NEXT_PUBLIC_API_URL=https://powerchip-agente-ia.com.br/api
NEXTAUTH_URL=https://powerchip-agente-ia.com.br
```

### 2. Configurar DNS

Configure os registros DNS para apontar para seu servidor:

```
A     powerchip-agente-ia.com.br     189.6.22.246
CNAME www.powerchip-agente-ia.com.br powerchip-agente-ia.com.br
```

## 🔒 Segurança

### 1. Chaves Secretas

Gere chaves seguras para:

```bash
# NextAuth Secret
openssl rand -base64 32

# JWT Secret
openssl rand -base64 64

# Webhook Secret
openssl rand -base64 32
```

### 2. Configurar HTTPS

- ✅ Certificado SSL ativo
- ✅ Redirecionamento HTTP → HTTPS
- ✅ Headers de segurança configurados

## 🚀 Deploy

### 1. Build da Aplicação

```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Iniciar em produção
npm start
```

### 2. Verificar Funcionamento

1. **Teste de Pagamento PIX**
   - Faça um pedido de teste
   - Verifique se o QR Code é gerado
   - Confirme se o webhook é recebido

2. **Teste de Pagamento Cartão**
   - Use dados de cartão reais (pequeno valor)
   - Verifique processamento
   - Confirme atualização de status

3. **Teste de Webhook**
   - Monitore logs do servidor
   - Verifique se webhooks são processados
   - Confirme atualização de pedidos

## 📊 Monitoramento

### 1. Logs Importantes

```bash
# Logs da aplicação
tail -f logs/app.log

# Logs de pagamento
tail -f logs/payments.log

# Logs de webhook
tail -f logs/webhooks.log
```

### 2. Métricas a Monitorar

- ✅ Taxa de conversão de pagamentos
- ✅ Tempo de resposta da API
- ✅ Erros de webhook
- ✅ Falhas de pagamento

## 🆘 Troubleshooting

### Problemas Comuns

1. **Webhook não recebido**
   - Verifique URL do webhook no Mercado Pago
   - Confirme se HTTPS está funcionando
   - Verifique logs do servidor

2. **Pagamento não processado**
   - Verifique credenciais do Mercado Pago
   - Confirme se são credenciais de PRODUÇÃO
   - Verifique logs de erro

3. **Erro de CORS**
   - Verifique configuração de domínios
   - Confirme URLs no arquivo .env

## 📞 Suporte

- **Mercado Pago**: https://www.mercadopago.com.br/developers/pt/support
- **Documentação**: https://www.mercadopago.com.br/developers/pt/docs
- **Status**: https://status.mercadopago.com/

---

## ⚠️ IMPORTANTE

- **NUNCA** commite o arquivo `.env` com credenciais reais
- **SEMPRE** use HTTPS em produção
- **TESTE** todos os fluxos antes de ir ao ar
- **MONITORE** logs e métricas constantemente
- **MANTENHA** backups das configurações

---

✅ **Checklist Final**

- [ ] Credenciais do Mercado Pago configuradas
- [ ] Webhooks configurados e testados
- [ ] Domínio e SSL funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção realizado
- [ ] Testes de pagamento realizados
- [ ] Monitoramento ativo
- [ ] Backup das configurações

🎉 **Parabéns! Seu e-commerce está pronto para produção!**