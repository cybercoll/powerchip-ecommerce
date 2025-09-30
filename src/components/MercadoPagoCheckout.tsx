'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { CreditCard, QrCode, FileText, Loader2 } from 'lucide-react'

// Declaração de tipos para o SDK do Mercado Pago
declare global {
  interface Window {
    MercadoPago: any
  }
}

interface MercadoPagoCheckoutProps {
  orderData: {
    id: string
    total_amount: number
  }
  onPaymentSuccess: (paymentData: any) => void
  onPaymentError: (error: string) => void
}

export default function MercadoPagoCheckout({ 
  orderData, 
  onPaymentSuccess, 
  onPaymentError 
}: MercadoPagoCheckoutProps) {
  const [mp, setMp] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [cardForm, setCardForm] = useState<any>(null)
  const [cardData, setCardData] = useState({
    cardholderName: '',
    identificationType: 'CPF',
    identificationNumber: '',
    installments: 1
  })

  useEffect(() => {
    // Carregar SDK do Mercado Pago
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.onload = initializeMercadoPago
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const initializeMercadoPago = () => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
    
    if (!publicKey) {
      console.error('Public Key do Mercado Pago não configurada')
      onPaymentError('Configuração de pagamento inválida')
      return
    }

    const mercadopago = new window.MercadoPago(publicKey, {
      locale: 'pt-BR'
    })
    
    setMp(mercadopago)
    
    // Inicializar formulário de cartão se necessário
    if (paymentMethod === 'credit_card') {
      initializeCardForm(mercadopago)
    }
  }

  const initializeCardForm = (mercadopago: any) => {
    const cardFormInstance = mercadopago.cardForm({
      amount: orderData.total_amount.toString(),
      iframe: true,
      form: {
        id: 'form-checkout',
        cardholderName: {
          id: 'form-checkout__cardholderName',
          placeholder: 'Titular do cartão'
        },
        cardholderEmail: {
          id: 'form-checkout__cardholderEmail',
          placeholder: 'E-mail'
        },
        cardNumber: {
          id: 'form-checkout__cardNumber',
          placeholder: 'Número do cartão'
        },
        expirationDate: {
          id: 'form-checkout__expirationDate',
          placeholder: 'MM/YY'
        },
        securityCode: {
          id: 'form-checkout__securityCode',
          placeholder: 'Código de segurança'
        },
        installments: {
          id: 'form-checkout__installments',
          placeholder: 'Parcelas'
        },
        identificationType: {
          id: 'form-checkout__identificationType',
          placeholder: 'Tipo de documento'
        },
        identificationNumber: {
          id: 'form-checkout__identificationNumber',
          placeholder: 'Número do documento'
        },
        issuer: {
          id: 'form-checkout__issuer',
          placeholder: 'Banco emissor'
        }
      },
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) {
            console.error('Erro ao montar formulário:', error)
            onPaymentError('Erro ao carregar formulário de pagamento')
          }
        },
        onSubmit: (event: any) => {
          event.preventDefault()
          processCardPayment(cardFormInstance)
        },
        onFetching: (resource: string) => {
          console.log('Buscando recurso:', resource)
        }
      }
    })
    
    setCardForm(cardFormInstance)
  }

  const processCardPayment = async (cardFormInstance: any) => {
    setLoading(true)
    
    try {
      const { token, ...formData } = await cardFormInstance.getCardFormData()
      
      if (!token) {
        throw new Error('Erro ao gerar token do cartão')
      }

      // Enviar dados para o backend
      const paymentData = {
        orderId: orderData.id,
        paymentMethod: 'credit_card',
        cardToken: token,
        installments: formData.installments,
        cardholderName: formData.cardholderName,
        cardholderEmail: formData.cardholderEmail,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      if (response.ok) {
        const result = await response.json()
        onPaymentSuccess(result)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      console.error('Erro no pagamento:', error)
      onPaymentError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const processPixPayment = async () => {
    setLoading(true)
    
    try {
      const paymentData = {
        orderId: orderData.id,
        paymentMethod: 'pix'
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      if (response.ok) {
        const result = await response.json()
        onPaymentSuccess(result)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      console.error('Erro no pagamento PIX:', error)
      onPaymentError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const processBoletoPayment = async () => {
    setLoading(true)
    
    try {
      const paymentData = {
        orderId: orderData.id,
        paymentMethod: 'boleto'
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      if (response.ok) {
        const result = await response.json()
        onPaymentSuccess(result)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao processar pagamento')
      }
    } catch (error) {
      console.error('Erro no pagamento boleto:', error)
      onPaymentError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentMethod) {
      toast.error('Por favor, selecione um método de pagamento')
      return
    }
    
    if (paymentMethod === 'pix') {
      processPixPayment()
    } else if (paymentMethod === 'boleto') {
      processBoletoPayment()
    }
    // Para cartão, o submit é tratado pelo SDK
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="form-checkout" onSubmit={handleSubmit}>
          {/* Seleção do método de pagamento */}
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Escolha o método de pagamento</h3>
              {!paymentMethod && (
                <p className="text-sm text-gray-600 mb-4">
                  Selecione uma das opções abaixo para continuar
                </p>
              )}
            </div>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value) => {
                setPaymentMethod(value)
                if (value === 'credit_card' && mp) {
                  setTimeout(() => initializeCardForm(mp), 100)
                }
              }}
            >
              <div className={`flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                paymentMethod === 'pix' ? 'border-blue-500 bg-blue-50' : ''
              }`}>
                <RadioGroupItem value="pix" id="pix" />
                <QrCode className="h-5 w-5 text-blue-600" />
                <Label htmlFor="pix" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                  </div>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                paymentMethod === 'credit_card' ? 'border-green-500 bg-green-50' : ''
              }`}>
                <RadioGroupItem value="credit_card" id="credit_card" />
                <CreditCard className="h-5 w-5 text-green-600" />
                <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-sm text-gray-600">Parcelamento disponível</p>
                  </div>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                paymentMethod === 'boleto' ? 'border-orange-500 bg-orange-50' : ''
              }`}>
                <RadioGroupItem value="boleto" id="boleto" />
                <FileText className="h-5 w-5 text-orange-600" />
                <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Boleto Bancário</p>
                    <p className="text-sm text-gray-600">Vencimento em 3 dias úteis</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {/* Opção para desselecionar */}
            {paymentMethod && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('')}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Alterar método de pagamento
                </button>
              </div>
            )}
          </div>

          {/* Formulário de cartão de crédito */}
          {paymentMethod === 'credit_card' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="form-checkout__cardholderName">Nome do titular</Label>
                  <Input 
                    id="form-checkout__cardholderName" 
                    placeholder="Nome como está no cartão"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="form-checkout__cardholderEmail">E-mail</Label>
                  <Input 
                    id="form-checkout__cardholderEmail" 
                    type="email"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="form-checkout__cardNumber">Número do cartão</Label>
                <Input 
                  id="form-checkout__cardNumber" 
                  placeholder="0000 0000 0000 0000"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="form-checkout__expirationDate">Vencimento</Label>
                  <Input 
                    id="form-checkout__expirationDate" 
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="form-checkout__securityCode">CVV</Label>
                  <Input 
                    id="form-checkout__securityCode" 
                    placeholder="123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="form-checkout__installments">Parcelas</Label>
                  <select 
                    id="form-checkout__installments" 
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Escolha...</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="form-checkout__identificationType">Tipo de documento</Label>
                  <select 
                    id="form-checkout__identificationType" 
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Escolha...</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="form-checkout__identificationNumber">Número do documento</Label>
                  <Input 
                    id="form-checkout__identificationNumber" 
                    placeholder="12345678901"
                    required
                  />
                </div>
              </div>
              
              <input type="hidden" id="form-checkout__issuer" />
            </div>
          )}

          {/* Resumo do pagamento */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total a pagar:</span>
              <span className="text-xl font-bold text-green-600">
                R$ {orderData.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botão de pagamento */}
          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={loading || !paymentMethod}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : !paymentMethod ? (
              'Selecione um método de pagamento'
            ) : (
              `Pagar R$ ${orderData.total_amount.toFixed(2)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}