# Testes - PowerChip E-commerce

Este diretório contém todos os testes automatizados do projeto PowerChip E-commerce, incluindo testes unitários, de integração e end-to-end.

## 📁 Estrutura dos Testes

```
tests/
├── e2e/                    # Testes end-to-end (Playwright)
│   └── ecommerce.spec.ts   # Testes principais do e-commerce
├── unit/                   # Testes unitários (Jest)
│   ├── components/         # Testes de componentes React
│   ├── contexts/          # Testes de contextos React
│   ├── utils/             # Testes de utilitários
│   └── services/          # Testes de serviços
├── mocks/                 # Mocks para testes
│   └── server.ts          # Servidor MSW para mocks de API
├── global-setup.ts        # Setup global do Playwright
├── global-teardown.ts     # Teardown global do Playwright
├── jest.setup.js          # Setup do Jest
├── jest.global-setup.js   # Setup global do Jest
└── jest.global-teardown.js # Teardown global do Jest
```

## 🚀 Como Executar os Testes

### Testes Unitários (Jest)

```bash
# Executar todos os testes unitários
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar apenas testes unitários
npm run test:unit

# Executar testes para CI/CD
npm run test:ci
```

### Testes End-to-End (Playwright)

```bash
# Instalar navegadores do Playwright (primeira vez)
npm run playwright:install

# Executar testes e2e
npm run test:e2e

# Executar testes e2e com interface gráfica
npm run test:e2e:ui

# Executar testes e2e com navegador visível
npm run test:e2e:headed
```

### Executar Todos os Testes

```bash
# Executar testes unitários e e2e
npm run test:all
```

## 🧪 Tipos de Testes

### 1. Testes Unitários

- **Componentes React**: Testam renderização, props, eventos e estados
- **Contextos**: Testam providers, hooks e gerenciamento de estado
- **Utilitários**: Testam funções de formatação, validação e helpers
- **Serviços**: Testam APIs, integrações e lógica de negócio

### 2. Testes End-to-End

- **Fluxos de usuário**: Navegação, autenticação, compras
- **Funcionalidades**: Carrinho, checkout, pagamentos
- **Responsividade**: Desktop, tablet, mobile
- **Performance**: Carregamento, SEO, acessibilidade

## 🛠️ Configuração dos Testes

### Jest (Testes Unitários)

- **Configuração**: `jest.config.js`
- **Setup**: `tests/jest.setup.js`
- **Ambiente**: jsdom para simular DOM
- **Mocks**: MSW para interceptar requisições HTTP
- **Cobertura**: Relatórios em HTML e LCOV

### Playwright (Testes E2E)

- **Configuração**: `playwright.config.ts`
- **Navegadores**: Chromium, Firefox, WebKit
- **Dispositivos**: Desktop e mobile
- **Relatórios**: HTML com screenshots e vídeos
- **Paralelização**: Testes executados em paralelo

## 📊 Cobertura de Testes

### Metas de Cobertura

- **Linhas**: ≥ 70%
- **Funções**: ≥ 70%
- **Branches**: ≥ 70%
- **Statements**: ≥ 70%

### Relatórios

- **HTML**: `coverage/lcov-report/index.html`
- **JSON**: `coverage/coverage-summary.json`
- **LCOV**: `coverage/lcov.info`

## 🔧 Mocks e Fixtures

### MSW (Mock Service Worker)

- Intercepta requisições HTTP durante os testes
- Simula APIs do Supabase, Mercado Pago e N8N
- Configurado em `tests/mocks/server.ts`

### Dados de Teste

- Usuários: `testUtils.mockUser`, `testUtils.mockAdmin`
- Produtos: `testUtils.mockProduct`
- Pedidos: `testUtils.mockOrder`
- Definidos em `tests/jest.setup.js`

## 🐛 Debugging

### Jest

```bash
# Debug com Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug teste específico
npm test -- --testNamePattern="nome do teste"
```

### Playwright

```bash
# Debug com interface gráfica
npm run test:e2e:ui

# Debug com navegador visível
npm run test:e2e:headed

# Debug teste específico
npx playwright test --debug tests/e2e/ecommerce.spec.ts
```

## 📝 Escrevendo Testes

### Boas Práticas

1. **Nomes descritivos**: Use nomes que expliquem o que está sendo testado
2. **Arrange-Act-Assert**: Organize os testes em seções claras
3. **Isolamento**: Cada teste deve ser independente
4. **Mocks**: Use mocks para dependências externas
5. **Cleanup**: Limpe estado entre testes

### Exemplo de Teste Unitário

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'iPhone 15',
    price: 8999.00,
    // ... outras propriedades
  };

  it('deve renderizar as informações do produto', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('R$ 8.999,00')).toBeInTheDocument();
  });
});
```

### Exemplo de Teste E2E

```typescript
import { test, expect } from '@playwright/test';

test('deve adicionar produto ao carrinho', async ({ page }) => {
  await page.goto('/');
  
  // Navegar para produto
  await page.click('[data-testid="product-card"]');
  
  // Adicionar ao carrinho
  await page.click('button:has-text("Adicionar ao Carrinho")');
  
  // Verificar se foi adicionado
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
});
```

## 🔄 CI/CD

### GitHub Actions

- Testes executados automaticamente em PRs
- Cobertura reportada como comentário
- Artefatos salvos (relatórios, screenshots)
- Deploy apenas se testes passarem

### Comandos CI

```bash
# Instalar dependências
npm ci

# Executar testes unitários
npm run test:ci

# Instalar navegadores
npm run playwright:install

# Executar testes e2e
npm run test:e2e
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](https://mswjs.io/docs/)

## 🆘 Solução de Problemas

### Problemas Comuns

1. **Testes falhando localmente**: Verifique se a aplicação está rodando
2. **Timeout nos testes e2e**: Aumente o timeout no `playwright.config.ts`
3. **Mocks não funcionando**: Verifique se o MSW está configurado corretamente
4. **Cobertura baixa**: Adicione mais testes para componentes não cobertos

### Logs e Debug

- Logs do Jest: `npm test -- --verbose`
- Logs do Playwright: `DEBUG=pw:api npm run test:e2e`
- Screenshots: Salvos automaticamente em falhas
- Vídeos: Disponíveis no diretório `test-results/`

---

**Nota**: Certifique-se de que a aplicação esteja rodando (`npm run dev`) antes de executar os testes e2e.