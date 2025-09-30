import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

const payment = new Payment(client)
const preference = new Preference(client)

export interface PaymentData {
  orderId: string
  amount: number
  description: string
  payerEmail: string
  payerName: string
  payerDocument: string
  paymentMethod: 'pix' | 'credit_card' | 'boleto'
  installments?: number
  cardToken?: string
}

export interface PaymentResponse {
  id: string
  status: string
  paymentUrl?: string
  qrCode?: string
  qrCodeBase64?: string
  boletoUrl?: string
  expirationDate?: string
}

// Criar pagamento PIX
export async function createPixPayment(data: PaymentData): Promise<PaymentResponse> {
  try {
    const paymentData = {
      transaction_amount: data.amount,
      description: data.description,
      payment_method_id: 'pix',
      payer: {
        email: data.payerEmail,
        first_name: data.payerName,
        identification: {
          type: 'CPF',
          number: data.payerDocument
        }
      },
      external_reference: data.orderId
    }

    const response = await payment.create({ body: paymentData })
    
    return {
      id: response.id?.toString() || '',
      status: response.status || 'pending',
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
      expirationDate: response.date_of_expiration
    }
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error)
    throw new Error('Falha ao processar pagamento PIX')
  }
}

// Criar pagamento com cartão de crédito
export async function createCreditCardPayment(data: PaymentData): Promise<PaymentResponse> {
  try {
    const paymentData = {
      transaction_amount: data.amount,
      token: data.cardToken,
      description: data.description,
      installments: data.installments || 1,
      payment_method_id: 'visa', // Será determinado pelo token
      payer: {
        email: data.payerEmail,
        identification: {
          type: 'CPF',
          number: data.payerDocument
        }
      },
      external_reference: data.orderId
    }

    const response = await payment.create({ body: paymentData })
    
    return {
      id: response.id?.toString() || '',
      status: response.status || 'pending'
    }
  } catch (error) {
    console.error('Erro ao criar pagamento com cartão:', error)
    throw new Error('Falha ao processar pagamento com cartão')
  }
}

// Criar pagamento boleto
export async function createBoletoPayment(data: PaymentData): Promise<PaymentResponse> {
  try {
    const paymentData = {
      transaction_amount: data.amount,
      description: data.description,
      payment_method_id: 'bolbradesco',
      payer: {
        email: data.payerEmail,
        first_name: data.payerName,
        identification: {
          type: 'CPF',
          number: data.payerDocument
        },
        address: {
          zip_code: '01234567',
          street_name: 'Rua Exemplo',
          street_number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          federal_unit: 'SP'
        }
      },
      external_reference: data.orderId
    }

    const response = await payment.create({ body: paymentData })
    
    return {
      id: response.id?.toString() || '',
      status: response.status || 'pending',
      boletoUrl: response.transaction_details?.external_resource_url,
      expirationDate: response.date_of_expiration
    }
  } catch (error) {
    console.error('Erro ao criar pagamento boleto:', error)
    throw new Error('Falha ao processar pagamento boleto')
  }
}

// Verificar status do pagamento
export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await payment.get({ id: paymentId })
    return {
      id: response.id?.toString(),
      status: response.status,
      statusDetail: response.status_detail,
      amount: response.transaction_amount,
      netAmount: response.transaction_details?.net_received_amount
    }
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error)
    throw new Error('Falha ao verificar status do pagamento')
  }
}

// Criar preferência para checkout transparente
export async function createCheckoutPreference(data: PaymentData) {
  try {
    const preferenceData = {
      items: [
        {
          title: data.description,
          unit_price: data.amount,
          quantity: 1
        }
      ],
      payer: {
        email: data.payerEmail,
        name: data.payerName,
        identification: {
          type: 'CPF',
          number: data.payerDocument
        }
      },
      external_reference: data.orderId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
      },
      auto_return: 'approved' as const,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    }

    const response = await preference.create({ body: preferenceData })
    
    return {
      id: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point
    }
  } catch (error) {
    console.error('Erro ao criar preferência de checkout:', error)
    throw new Error('Falha ao criar preferência de checkout')
  }
}

// Processar webhook do Mercado Pago
export async function processWebhook(data: any) {
  try {
    if (data.type === 'payment') {
      const paymentInfo = await getPaymentStatus(data.data.id)
      
      // Aqui você pode atualizar o status do pedido no banco de dados
      // baseado no status do pagamento
      
      return paymentInfo
    }
    
    return null
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    throw new Error('Falha ao processar webhook')
  }
}

// Validar dados do cartão
export function validateCardData(cardNumber: string, expiryDate: string, cvv: string, holderName: string) {
  const errors: string[] = []
  
  // Validar número do cartão (Luhn algorithm)
  if (!isValidCardNumber(cardNumber)) {
    errors.push('Número do cartão inválido')
  }
  
  // Validar data de expiração
  if (!isValidExpiryDate(expiryDate)) {
    errors.push('Data de expiração inválida')
  }
  
  // Validar CVV
  if (!isValidCVV(cvv)) {
    errors.push('CVV inválido')
  }
  
  // Validar nome do portador
  if (!holderName || holderName.trim().length < 2) {
    errors.push('Nome do portador inválido')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

function isValidCardNumber(cardNumber: string): boolean {
  const num = cardNumber.replace(/\s/g, '')
  if (!/^\d+$/.test(num)) return false
  
  let sum = 0
  let isEven = false
  
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

function isValidExpiryDate(expiryDate: string): boolean {
  const [month, year] = expiryDate.split('/')
  if (!month || !year) return false
  
  const monthNum = parseInt(month)
  const yearNum = parseInt(`20${year}`)
  
  if (monthNum < 1 || monthNum > 12) return false
  
  const now = new Date()
  const expiry = new Date(yearNum, monthNum - 1)
  
  return expiry > now
}

function isValidCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv)
}