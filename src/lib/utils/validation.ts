/**
 * Utilitários de validação para o PowerChip E-commerce
 * Funções para validar dados de entrada
 */

/**
 * Valida um endereço de email
 * @param email - Email a ser validado
 * @returns true se válido, false caso contrário
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmedEmail = email.trim();
  
  // Verifica formato básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }
  
  // Verifica se não há pontos consecutivos
  if (trimmedEmail.includes('..')) {
    return false;
  }
  
  return true;
}

/**
 * Valida uma senha
 * @param password - Senha a ser validada
 * @param options - Opções de validação
 * @returns true se válida, false caso contrário
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false
  } = options;

  // Verifica comprimento mínimo
  if (password.length < minLength) {
    return false;
  }

  // Verifica letra maiúscula
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }

  // Verifica letra minúscula
  if (requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }

  // Verifica números
  if (requireNumbers && !/\d/.test(password)) {
    return false;
  }

  // Verifica caracteres especiais
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }

  return true;
}

/**
 * Valida um CPF brasileiro
 * @param cpf - CPF a ser validado (com ou sem formatação)
 * @returns true se válido, false caso contrário
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Remove formatação
  const digits = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (digits.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(digits[9]) !== digit1) {
    return false;
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(digits[10]) === digit2;
}

/**
 * Valida um CNPJ brasileiro
 * @param cnpj - CNPJ a ser validado (com ou sem formatação)
 * @returns true se válido, false caso contrário
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj || typeof cnpj !== 'string') {
    return false;
  }

  // Remove formatação
  const digits = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (digits.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(digits[12]) !== digit1) {
    return false;
  }

  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(digits[13]) === digit2;
}

/**
 * Valida um número de telefone brasileiro
 * @param phone - Telefone a ser validado
 * @returns true se válido, false caso contrário
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove formatação
  const digits = phone.replace(/\D/g, '');

  // Telefone fixo: 10 dígitos (11) 9999-9999
  // Celular: 11 dígitos (11) 99999-9999
  // Com código do país: 13 dígitos +55 (11) 99999-9999
  if (digits.length === 10 || digits.length === 11) {
    // Verifica se o DDD é válido (11-99)
    const ddd = parseInt(digits.slice(0, 2));
    if (ddd < 11 || ddd > 99) {
      return false;
    }

    // Para celular, o primeiro dígito após o DDD deve ser 9
    if (digits.length === 11 && digits[2] !== '9') {
      return false;
    }

    return true;
  }

  // Com código do país (+55)
  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = parseInt(digits.slice(2, 4));
    if (ddd < 11 || ddd > 99) {
      return false;
    }

    // Deve ser celular (9 dígitos após DDD)
    if (digits[4] !== '9') {
      return false;
    }

    return true;
  }

  return false;
}

/**
 * Valida um CEP brasileiro
 * @param cep - CEP a ser validado
 * @returns true se válido, false caso contrário
 */
export function validateCEP(cep: string): boolean {
  if (!cep || typeof cep !== 'string') {
    return false;
  }

  // Remove formatação
  const digits = cep.replace(/\D/g, '');

  // Verifica se tem 8 dígitos
  if (digits.length !== 8) {
    return false;
  }

  // Verifica se não são todos zeros
  if (digits === '00000000') {
    return false;
  }

  return true;
}

/**
 * Valida um número de cartão de crédito usando algoritmo de Luhn
 * @param cardNumber - Número do cartão
 * @returns true se válido, false caso contrário
 */
export function validateCardNumber(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }

  // Remove formatação
  const digits = cardNumber.replace(/\D/g, '');

  // Verifica comprimento (13-19 dígitos)
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Valida a data de expiração do cartão
 * @param expiry - Data de expiração (MM/AA)
 * @returns true se válida, false caso contrário
 */
export function validateExpiryDate(expiry: string): boolean {
  if (!expiry || typeof expiry !== 'string') {
    return false;
  }

  // Verifica se tem o formato MM/YY
  const formatRegex = /^\d{2}\/\d{2}$/;
  if (!formatRegex.test(expiry)) {
    return false;
  }

  const [monthStr, yearStr] = expiry.split('/');
  const month = parseInt(monthStr);
  const year = parseInt(yearStr);

  // Verifica se o mês é válido
  if (month < 1 || month > 12) {
    return false;
  }

  // Verifica se a data não está no passado
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Últimos 2 dígitos
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
}

/**
 * Valida o CVV do cartão
 * @param cvv - Código de segurança
 * @param cardType - Tipo do cartão ('amex' para American Express, outros para demais)
 * @returns true se válido, false caso contrário
 */
export function validateCVV(cvv: string, cardType: string = 'other'): boolean {
  if (!cvv || typeof cvv !== 'string') {
    return false;
  }

  const digits = cvv.replace(/\D/g, '');

  // Aceita 3 ou 4 dígitos (3 para cartões normais, 4 para Amex)
  if (cardType.toLowerCase() === 'amex') {
    return digits.length === 4;
  } else {
    return digits.length === 3 || digits.length === 4;
  }
}

/**
 * Valida se um campo obrigatório foi preenchido
 * @param value - Valor a ser validado
 * @returns true se preenchido, false caso contrário
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

/**
 * Valida comprimento mínimo de string
 * @param value - Valor a ser validado
 * @param minLength - Comprimento mínimo
 * @returns true se válido, false caso contrário
 */
export function validateMinLength(value: string, minLength: number): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  return value.trim().length >= minLength;
}

/**
 * Valida comprimento máximo de string
 * @param value - Valor a ser validado
 * @param maxLength - Comprimento máximo
 * @returns true se válido, false caso contrário
 */
export function validateMaxLength(value: string, maxLength: number): boolean {
  if (!value || typeof value !== 'string') {
    return true; // Campo vazio é válido para max length
  }

  return value.trim().length <= maxLength;
}

/**
 * Valida se o valor é numérico
 * @param value - Valor a ser validado
 * @returns true se numérico, false caso contrário
 */
export function validateNumeric(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  return !isNaN(Number(trimmed)) && trimmed !== '';
}

/**
 * Valida uma URL
 * @param url - URL a ser validada
 * @returns true se válida, false caso contrário
 */
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida dados de produto
 * @param product - Dados do produto
 * @returns Objeto com resultado da validação
 */
export function validateProductData(product: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!validateRequired(product?.name)) {
    errors.push('Nome é obrigatório');
  }

  if (!validateRequired(product?.price) || isNaN(Number(product.price)) || Number(product.price) <= 0) {
    errors.push('Preço deve ser maior que zero');
  }

  if (!validateRequired(product?.category)) {
    errors.push('Categoria é obrigatória');
  }

  if (!validateRequired(product?.description)) {
    errors.push('Descrição é obrigatória');
  }

  if (product?.stock !== undefined && (isNaN(Number(product.stock)) || Number(product.stock) < 0)) {
    errors.push('Estoque não pode ser negativo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida dados de pedido
 * @param order - Dados do pedido
 * @returns Objeto com resultado da validação
 */
export function validateOrderData(order: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!validateRequired(order?.items) || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Pedido deve ter pelo menos um item');
  }

  if (!validateRequired(order?.total) || isNaN(Number(order.total)) || Number(order.total) <= 0) {
    errors.push('Total deve ser maior que zero');
  }

  if (!validateRequired(order?.customer_id)) {
    errors.push('ID do cliente é obrigatório');
  }

  if (!validateRequired(order?.payment_method)) {
    errors.push('Método de pagamento é obrigatório');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida dados de usuário
 * @param user - Dados do usuário
 * @returns Objeto com resultado da validação
 */
export function validateUserData(user: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!validateRequired(user?.name)) {
    errors.push('Nome é obrigatório');
  }

  if (!validateRequired(user?.email)) {
    errors.push('Email é obrigatório');
  } else if (!validateEmail(user.email)) {
    errors.push('Email inválido');
  }

  if (!validateRequired(user?.password) || !validatePassword(user.password)) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }

  if (user?.phone && !validatePhone(user.phone)) {
    errors.push('Telefone inválido');
  }

  if (user?.cpf && !validateCPF(user.cpf)) {
    errors.push('CPF inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}