import {
  validateEmail,
  validatePassword,
  validateCPF,
  validatePhone,
  validateCEP,
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumeric,
  validateURL,
  validateProductData,
  validateOrderData,
  validateUserData
} from '@/lib/utils/validation';

describe('Utilitários de Validação', () => {
  describe('validateEmail', () => {
    it('deve validar emails corretos', () => {
      expect(validateEmail('test@powerchip.com.br')).toBe(true);
      expect(validateEmail('user@gmail.com')).toBe(true);
      expect(validateEmail('admin@empresa.com.br')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('deve rejeitar emails inválidos', () => {
      expect(validateEmail('email-invalido')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test..test@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('deve validar senhas fortes', () => {
      expect(validatePassword('MinhaSenh@123')).toBe(true);
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('Abc123@#$')).toBe(true);
    });

    it('deve rejeitar senhas fracas', () => {
      expect(validatePassword('123456')).toBe(false); // Muito simples
      expect(validatePassword('password')).toBe(false); // Sem maiúscula/número
      expect(validatePassword('PASSWORD')).toBe(false); // Sem minúscula/número
      expect(validatePassword('Pass123')).toBe(false); // Muito curta
      expect(validatePassword('')).toBe(false); // Vazia
    });

    it('deve validar com critérios customizados', () => {
      const options = {
        minLength: 6,
        requireUppercase: false,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      };

      expect(validatePassword('abc123', options)).toBe(true);
      expect(validatePassword('ABC123', options)).toBe(false); // Sem minúscula
      expect(validatePassword('abcdef', options)).toBe(false); // Sem número
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPFs corretos', () => {
      expect(validateCPF('11144477735')).toBe(true);
      expect(validateCPF('111.444.777-35')).toBe(true);
      expect(validateCPF('12345678909')).toBe(true);
    });

    it('deve rejeitar CPFs inválidos', () => {
      expect(validateCPF('11111111111')).toBe(false); // Todos iguais
      expect(validateCPF('12345678901')).toBe(false); // Dígitos incorretos
      expect(validateCPF('123456789')).toBe(false); // Muito curto
      expect(validateCPF('abc.def.ghi-jk')).toBe(false); // Não numérico
      expect(validateCPF('')).toBe(false); // Vazio
    });
  });

  describe('validatePhone', () => {
    it('deve validar telefones corretos', () => {
      expect(validatePhone('11987654321')).toBe(true); // Celular
      expect(validatePhone('1133334444')).toBe(true); // Fixo
      expect(validatePhone('(11) 98765-4321')).toBe(true); // Formatado
      expect(validatePhone('(11) 3333-4444')).toBe(true); // Fixo formatado
    });

    it('deve rejeitar telefones inválidos', () => {
      expect(validatePhone('123456789')).toBe(false); // Muito curto
      expect(validatePhone('123456789012')).toBe(false); // Muito longo
      expect(validatePhone('abc')).toBe(false); // Não numérico
      expect(validatePhone('')).toBe(false); // Vazio
    });
  });

  describe('validateCEP', () => {
    it('deve validar CEPs corretos', () => {
      expect(validateCEP('01234567')).toBe(true);
      expect(validateCEP('01234-567')).toBe(true);
      expect(validateCEP('12345678')).toBe(true);
    });

    it('deve rejeitar CEPs inválidos', () => {
      expect(validateCEP('1234567')).toBe(false); // Muito curto
      expect(validateCEP('123456789')).toBe(false); // Muito longo
      expect(validateCEP('abcd-efg')).toBe(false); // Não numérico
      expect(validateCEP('')).toBe(false); // Vazio
    });
  });

  describe('validateCardNumber', () => {
    it('deve validar números de cartão corretos', () => {
      expect(validateCardNumber('4111111111111111')).toBe(true); // Visa
      expect(validateCardNumber('5555555555554444')).toBe(true); // Mastercard
      expect(validateCardNumber('378282246310005')).toBe(true); // Amex
    });

    it('deve rejeitar números de cartão inválidos', () => {
      expect(validateCardNumber('4111111111111112')).toBe(false); // Luhn inválido
      expect(validateCardNumber('123456789')).toBe(false); // Muito curto
      expect(validateCardNumber('abcd1234efgh5678')).toBe(false); // Não numérico
      expect(validateCardNumber('')).toBe(false); // Vazio
    });
  });

  describe('validateExpiryDate', () => {
    it('deve validar datas de expiração futuras', () => {
      const futureYear = new Date().getFullYear() + 1;
      const futureMonth = '12';
      expect(validateExpiryDate(`${futureMonth}/${futureYear.toString().slice(-2)}`)).toBe(true);
    });

    it('deve rejeitar datas de expiração passadas', () => {
      expect(validateExpiryDate('01/20')).toBe(false); // Ano passado
      expect(validateExpiryDate('13/25')).toBe(false); // Mês inválido
      expect(validateExpiryDate('00/25')).toBe(false); // Mês inválido
    });

    it('deve rejeitar formatos inválidos', () => {
      expect(validateExpiryDate('1225')).toBe(false); // Sem barra
      expect(validateExpiryDate('12/2025')).toBe(false); // Ano com 4 dígitos
      expect(validateExpiryDate('ab/cd')).toBe(false); // Não numérico
      expect(validateExpiryDate('')).toBe(false); // Vazio
    });
  });

  describe('validateCVV', () => {
    it('deve validar CVVs corretos', () => {
      expect(validateCVV('123')).toBe(true); // 3 dígitos
      expect(validateCVV('1234')).toBe(true); // 4 dígitos (Amex)
    });

    it('deve rejeitar CVVs inválidos', () => {
      expect(validateCVV('12')).toBe(false); // Muito curto
      expect(validateCVV('12345')).toBe(false); // Muito longo
      expect(validateCVV('abc')).toBe(false); // Não numérico
      expect(validateCVV('')).toBe(false); // Vazio
    });
  });

  describe('validateRequired', () => {
    it('deve validar campos obrigatórios', () => {
      expect(validateRequired('valor')).toBe(true);
      expect(validateRequired('0')).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
    });

    it('deve rejeitar campos vazios', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    it('deve validar comprimento mínimo', () => {
      expect(validateMinLength('12345', 5)).toBe(true);
      expect(validateMinLength('123456', 5)).toBe(true);
    });

    it('deve rejeitar strings muito curtas', () => {
      expect(validateMinLength('1234', 5)).toBe(false);
      expect(validateMinLength('', 1)).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('deve validar comprimento máximo', () => {
      expect(validateMaxLength('12345', 5)).toBe(true);
      expect(validateMaxLength('1234', 5)).toBe(true);
    });

    it('deve rejeitar strings muito longas', () => {
      expect(validateMaxLength('123456', 5)).toBe(false);
    });
  });

  describe('validateNumeric', () => {
    it('deve validar valores numéricos', () => {
      expect(validateNumeric('123')).toBe(true);
      expect(validateNumeric('123.45')).toBe(true);
      expect(validateNumeric('-123')).toBe(true);
      expect(validateNumeric('0')).toBe(true);
    });

    it('deve rejeitar valores não numéricos', () => {
      expect(validateNumeric('abc')).toBe(false);
      expect(validateNumeric('12a3')).toBe(false);
      expect(validateNumeric('')).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('deve validar URLs corretas', () => {
      expect(validateURL('https://www.powerchip.com.br')).toBe(true);
      expect(validateURL('http://localhost:3000')).toBe(true);
      expect(validateURL('https://api.mercadopago.com/v1/payments')).toBe(true);
    });

    it('deve rejeitar URLs inválidas', () => {
      expect(validateURL('powerchip.com.br')).toBe(false); // Sem protocolo
      expect(validateURL('http://')).toBe(false); // Incompleta
      expect(validateURL('not-a-url')).toBe(false); // Não é URL
      expect(validateURL('')).toBe(false); // Vazia
    });
  });

  describe('validateProductData', () => {
    const validProduct = {
      name: 'iPhone 15 Pro Max',
      description: 'iPhone 15 Pro Max 256GB',
      price: 8999.00,
      category: 'smartphones',
      brand: 'Apple',
      stock: 100
    };

    it('deve validar dados de produto corretos', () => {
      expect(validateProductData(validProduct)).toEqual({ isValid: true, errors: [] });
    });

    it('deve rejeitar produtos com dados inválidos', () => {
      const invalidProduct = {
        name: '',
        description: '',
        price: -100,
        category: '',
        brand: '',
        stock: -1
      };

      const result = validateProductData(invalidProduct);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome é obrigatório');
      expect(result.errors).toContain('Preço deve ser maior que zero');
      expect(result.errors).toContain('Estoque não pode ser negativo');
    });
  });

  describe('validateOrderData', () => {
    const validOrder = {
      items: [
        { product_id: '1', quantity: 2, price: 8999.00 }
      ],
      total: 17998.00,
      customer_id: 'customer-123',
      payment_method: 'pix',
      shipping_address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567'
      }
    };

    it('deve validar dados de pedido corretos', () => {
      expect(validateOrderData(validOrder)).toEqual({ isValid: true, errors: [] });
    });

    it('deve rejeitar pedidos com dados inválidos', () => {
      const invalidOrder = {
        items: [],
        total: -100,
        payment_method: '',
        shipping_address: {
          street: '',
          city: '',
          state: '',
          zip_code: ''
        }
      };

      const result = validateOrderData(invalidOrder);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pedido deve ter pelo menos um item');
      expect(result.errors).toContain('Total deve ser maior que zero');
      expect(result.errors).toContain('Método de pagamento é obrigatório');
    });
  });

  describe('validateUserData', () => {
    const validUser = {
      name: 'João Silva',
      email: 'joao@powerchip.com.br',
      password: 'MinhaSenh@123',
      phone: '11987654321'
    };

    it('deve validar dados de usuário corretos', () => {
      expect(validateUserData(validUser)).toEqual({ isValid: true, errors: [] });
    });

    it('deve rejeitar usuários com dados inválidos', () => {
      const invalidUser = {
        name: '',
        email: 'email-invalido',
        password: '123',
        phone: '123'
      };

      const result = validateUserData(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome é obrigatório');
      expect(result.errors).toContain('Email inválido');
      expect(result.errors).toContain('Senha deve ter pelo menos 8 caracteres');
      expect(result.errors).toContain('Telefone inválido');
    });
  });
});