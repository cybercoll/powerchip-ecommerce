const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
  console.log('SUPABASE_KEY:', supabaseKey ? 'Configurada' : 'Não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// URL base da aplicação
const BASE_URL = 'http://localhost:3000';

// Cartões de teste do Mercado Pago
const TEST_CARDS = {
  // Pagamento aprovado
  APPROVED: {
    cardNumber: '4509953566233704', // Visa
    securityCode: '123',
    expirationMonth: '11',
    expirationYear: '2025',
    cardholderName: 'APRO',
    identificationType: 'CPF',
    identificationNumber: '12345678909'
  },
  // Pagamento rejeitado por erro geral
  REJECTED: {
    cardNumber: '5031433215406351', // Mastercard
    securityCode: '123',
    expirationMonth: '11',
    expirationYear: '2025',
    cardholderName: 'OTHE',
    identificationType: 'CPF',
    identificationNumber: '12345678909'
  },
  // Pagamento pendente
  PENDING: {
    cardNumber: '4235647728025682', // Visa
    securityCode: '123',
    expirationMonth: '11',
    expirationYear: '2025',
    cardholderName: 'CONT',
    identificationType: 'CPF',
    identificationNumber: '12345678909'
  }
};

// Função para criar um pedido de teste
async function createTestOrder() {
  try {
    // Buscar um produto para adicionar ao carrinho
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (!products || products.length === 0) {
      throw new Error('Nenhum produto encontrado para teste');
    }

    const product = products[0];
    console.log(`Produto selecionado: ${product.name} - R$ ${product.price}`);

    // Criar um pedido
    const orderData = {
      user_id: null, // Pedido como convidado
      order_number: `TEST-${Date.now()}`,
      subtotal: product.price,
      total_amount: product.price,
      status: 'pending',
      payment_method: 'credit_card',
      shipping_address: {
        street: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        country: 'Brasil'
      }
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    // Criar item do pedido
    const orderItemData = {
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price
    };

    const { error: itemError } = await supabase
      .from('order_items')
      .insert(orderItemData);

    if (itemError) throw itemError;

    console.log(`Pedido criado: ID ${order.id}`);
    return order;
  } catch (error) {
    console.error('Erro ao criar pedido de teste:', error);
    throw error;
  }
}

// Função para testar pagamento com cartão
async function testPayment(cardType, order) {
  try {
    console.log(`\n--- Testando pagamento ${cardType} ---`);
    
    const card = TEST_CARDS[cardType];
    
    // Dados do pagamento
    const paymentData = {
      orderId: order.id,
      amount: order.total_amount,
      paymentMethod: 'credit_card',
      cardData: {
        cardNumber: card.cardNumber,
        securityCode: card.securityCode,
        expirationMonth: card.expirationMonth,
        expirationYear: card.expirationYear,
        cardholderName: card.cardholderName,
        identificationType: card.identificationType,
        identificationNumber: card.identificationNumber
      },
      installments: 1
    };

    console.log('Dados do cartão:', {
      number: `****${card.cardNumber.slice(-4)}`,
      holder: card.cardholderName,
      expiry: `${card.expirationMonth}/${card.expirationYear}`
    });

    // Fazer requisição para a API de pagamento
    const response = await axios.post(`${BASE_URL}/api/payments/create`, paymentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta do pagamento:', {
      status: response.data.status,
      paymentId: response.data.paymentId,
      message: response.data.message
    });

    return response.data;
  } catch (error) {
    console.error(`Erro no pagamento ${cardType}:`, {
      message: error.message,
      response: error.response?.data
    });
    return null;
  }
}

// Função para verificar status do pagamento
async function checkPaymentStatus(paymentId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/payments/status/${paymentId}`);
    console.log('Status do pagamento:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar status:', error.message);
    return null;
  }
}

// Função principal de teste
async function runPaymentTests() {
  console.log('=== TESTE DE PAGAMENTOS MERCADO PAGO ===\n');
  
  try {
    // Criar pedido de teste
    const order = await createTestOrder();
    
    // Testar diferentes cenários de pagamento
    const testScenarios = ['APPROVED', 'REJECTED', 'PENDING'];
    
    for (const scenario of testScenarios) {
      const paymentResult = await testPayment(scenario, order);
      
      if (paymentResult && paymentResult.paymentId) {
        // Aguardar um pouco antes de verificar o status
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkPaymentStatus(paymentResult.paymentId);
      }
      
      // Pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n=== TESTES CONCLUÍDOS ===');
    
  } catch (error) {
    console.error('Erro nos testes:', error);
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runPaymentTests();
}

module.exports = {
  runPaymentTests,
  testPayment,
  createTestOrder,
  TEST_CARDS
};