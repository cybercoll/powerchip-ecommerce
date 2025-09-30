import {
  formatCurrency,
  formatDate,
  formatPhone,
  formatCPF,
  formatCEP,
  formatCardNumber,
  formatExpiryDate,
  slugify,
  truncateText,
  formatFileSize,
  formatPercentage
} from '@/lib/utils/format';

describe('Utilitários de Formatação', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores monetários corretamente', () => {
      expect(formatCurrency(1000)).toBe('R$ 1.000,00');
      expect(formatCurrency(1000.50)).toBe('R$ 1.000,50');
      expect(formatCurrency(0)).toBe('R$ 0,00');
      expect(formatCurrency(0.99)).toBe('R$ 0,99');
    });

    it('deve lidar com valores negativos', () => {
      expect(formatCurrency(-100)).toBe('-R$ 100,00');
      expect(formatCurrency(-1000.50)).toBe('-R$ 1.000,50');
    });

    it('deve lidar com valores muito grandes', () => {
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00');
      expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89');
    });

    it('deve lidar com valores inválidos', () => {
      expect(formatCurrency(NaN)).toBe('R$ 0,00');
      expect(formatCurrency(Infinity)).toBe('R$ 0,00');
      expect(formatCurrency(-Infinity)).toBe('R$ 0,00');
    });
  });

  describe('formatDate', () => {
    it('deve formatar datas corretamente', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toBe('15/01/2024');
    });

    it('deve formatar strings de data', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
      expect(formatDate('2024-12-31T23:59:59')).toBe('31/12/2024');
    });

    it('deve formatar com diferentes formatos', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date, 'dd/MM/yyyy HH:mm')).toBe('15/01/2024 10:30');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
      expect(formatDate(date, 'dd de MMMM de yyyy')).toBe('15 de janeiro de 2024');
    });

    it('deve lidar com datas inválidas', () => {
      expect(formatDate('data-inválida')).toBe('Data inválida');
      expect(formatDate(null)).toBe('Data inválida');
      expect(formatDate(undefined)).toBe('Data inválida');
    });
  });

  describe('formatPhone', () => {
    it('deve formatar telefones celulares', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
      expect(formatPhone('21999887766')).toBe('(21) 99988-7766');
    });

    it('deve formatar telefones fixos', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
      expect(formatPhone('2155556666')).toBe('(21) 5555-6666');
    });

    it('deve lidar com números já formatados', () => {
      expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
      expect(formatPhone('(21) 3333-4444')).toBe('(21) 3333-4444');
    });

    it('deve lidar com números inválidos', () => {
      expect(formatPhone('123')).toBe('123');
      expect(formatPhone('')).toBe('');
      expect(formatPhone('abc')).toBe('abc');
    });
  });

  describe('formatCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
      expect(formatCPF('00000000000')).toBe('000.000.000-00');
    });

    it('deve lidar com CPF já formatado', () => {
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
    });

    it('deve lidar com CPF inválido', () => {
      expect(formatCPF('123')).toBe('123');
      expect(formatCPF('')).toBe('');
      expect(formatCPF('abc')).toBe('abc');
    });
  });

  describe('formatCEP', () => {
    it('deve formatar CEP corretamente', () => {
      expect(formatCEP('01234567')).toBe('01234-567');
      expect(formatCEP('12345678')).toBe('12345-678');
    });

    it('deve lidar com CEP já formatado', () => {
      expect(formatCEP('01234-567')).toBe('01234-567');
    });

    it('deve lidar com CEP inválido', () => {
      expect(formatCEP('123')).toBe('123');
      expect(formatCEP('')).toBe('');
      expect(formatCEP('abc')).toBe('abc');
    });
  });

  describe('formatCardNumber', () => {
    it('deve formatar número do cartão', () => {
      expect(formatCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    });

    it('deve lidar com números parciais', () => {
      expect(formatCardNumber('1234')).toBe('1234');
      expect(formatCardNumber('12345678')).toBe('1234 5678');
      expect(formatCardNumber('123456789012')).toBe('1234 5678 9012');
    });

    it('deve lidar com entrada inválida', () => {
      expect(formatCardNumber('')).toBe('');
      expect(formatCardNumber('abc')).toBe('');
    });
  });

  describe('formatExpiryDate', () => {
    it('deve formatar data de expiração', () => {
      expect(formatExpiryDate('1225')).toBe('12/25');
      expect(formatExpiryDate('0124')).toBe('01/24');
    });

    it('deve lidar com entrada parcial', () => {
      expect(formatExpiryDate('1')).toBe('1');
      expect(formatExpiryDate('12')).toBe('12/');
      expect(formatExpiryDate('123')).toBe('12/3');
    });

    it('deve lidar com entrada inválida', () => {
      expect(formatExpiryDate('')).toBe('');
      expect(formatExpiryDate('abc')).toBe('');
    });
  });

  describe('slugify', () => {
    it('deve criar slugs corretamente', () => {
      expect(slugify('iPhone 15 Pro Max')).toBe('iphone-15-pro-max');
      expect(slugify('Samsung Galaxy S24 Ultra')).toBe('samsung-galaxy-s24-ultra');
    });

    it('deve lidar com caracteres especiais', () => {
      expect(slugify('Produto com Acentos: ção, ã, é')).toBe('produto-com-acentos-cao-a-e');
      expect(slugify('Produto & Serviço @ 100%')).toBe('produto-servico-100');
    });

    it('deve remover espaços extras', () => {
      expect(slugify('  Produto   com   espaços  ')).toBe('produto-com-espacos');
    });

    it('deve lidar com strings vazias', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('deve truncar texto longo', () => {
      const longText = 'Este é um texto muito longo que precisa ser truncado';
      expect(truncateText(longText, 20)).toBe('Este é um texto mui...');
    });

    it('deve manter texto curto inalterado', () => {
      const shortText = 'Texto curto';
      expect(truncateText(shortText, 20)).toBe('Texto curto');
    });

    it('deve usar sufixo customizado', () => {
      const text = 'Texto para truncar';
      expect(truncateText(text, 10, ' [...]')).toBe('Texto para [...]');
    });

    it('deve lidar com casos extremos', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText('Texto', 0)).toBe('...');
      expect(truncateText('Texto', -1)).toBe('...');
    });
  });

  describe('formatFileSize', () => {
    it('deve formatar tamanhos de arquivo', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
    });

    it('deve formatar bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('deve usar precisão customizada', () => {
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(formatFileSize(1536, 0)).toBe('2 KB');
    });
  });

  describe('formatPercentage', () => {
    it('deve formatar porcentagens', () => {
      expect(formatPercentage(0.5)).toBe('50%');
      expect(formatPercentage(0.1234)).toBe('12.34%');
      expect(formatPercentage(1)).toBe('100%');
    });

    it('deve usar precisão customizada', () => {
      expect(formatPercentage(0.1234, 1)).toBe('12.3%');
      expect(formatPercentage(0.1234, 0)).toBe('12%');
    });

    it('deve lidar com valores extremos', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(2)).toBe('200%');
      expect(formatPercentage(-0.1)).toBe('-10%');
    });
  });
});