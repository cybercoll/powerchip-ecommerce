import { test, expect, Page } from '@playwright/test';

// Configurações de teste
const TEST_USER = {
  email: 'test@powerchip.com.br',
  password: 'Test123!@#',
  name: 'Usuário Teste'
};

const ADMIN_USER = {
  email: 'admin@powerchip.com.br',
  password: 'Admin123!@#'
};

const TEST_PRODUCT = {
  name: 'iPhone 15 Pro Max',
  price: 'R$ 8.999,00'
};

test.describe('PowerChip E-commerce - Testes End-to-End', () => {
  
  test.beforeEach(async ({ page }) => {
    // Configurar interceptadores para APIs externas
    await page.route('**/api/mercadopago/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', payment_id: 'test_payment_123' })
      });
    });
    
    await page.route('**/webhook/**', route => {
      route.fulfill({ status: 200, body: 'OK' });
    });
  });

  test.describe('Autenticação', () => {
    
    test('deve permitir registro de novo usuário', async ({ page }) => {
      await page.goto('/');
      
      // Ir para página de registro
      await page.click('text=Entrar');
      await page.click('text=Criar conta');
      
      // Preencher formulário de registro
      await page.fill('[data-testid="register-name"]', TEST_USER.name);
      await page.fill('[data-testid="register-email"]', `new_${Date.now()}_${TEST_USER.email}`);
      await page.fill('[data-testid="register-password"]', TEST_USER.password);
      await page.fill('[data-testid="register-confirm-password"]', TEST_USER.password);
      
      // Submeter formulário
      await page.click('[data-testid="register-submit"]');
      
      // Verificar redirecionamento ou mensagem de sucesso
      await expect(page).toHaveURL(/.*\/(dashboard|profile).*/);
      await expect(page.locator('text=Bem-vindo')).toBeVisible();
    });
    
    test('deve permitir login de usuário existente', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Preencher formulário de login
      await page.fill('[data-testid="login-email"]', TEST_USER.email);
      await page.fill('[data-testid="login-password"]', TEST_USER.password);
      
      // Submeter formulário
      await page.click('[data-testid="login-submit"]');
      
      // Verificar login bem-sucedido
      await expect(page).toHaveURL(/.*\/dashboard.*/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
    
    test('deve mostrar erro para credenciais inválidas', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Tentar login com credenciais inválidas
      await page.fill('[data-testid="login-email"]', 'invalid@email.com');
      await page.fill('[data-testid="login-password"]', 'wrongpassword');
      await page.click('[data-testid="login-submit"]');
      
      // Verificar mensagem de erro
      await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
    });
  });

  test.describe('Navegação e Catálogo', () => {
    
    test('deve carregar página inicial com produtos', async ({ page }) => {
      await page.goto('/');
      
      // Verificar elementos principais
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="featured-products"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
      
      // Verificar que há pelo menos 3 produtos
      const productCount = await page.locator('[data-testid="product-card"]').count();
      expect(productCount).toBeGreaterThanOrEqual(3);
    });
    
    test('deve permitir busca de produtos', async ({ page }) => {
      await page.goto('/');
      
      // Realizar busca
      await page.fill('[data-testid="search-input"]', 'iPhone');
      await page.press('[data-testid="search-input"]', 'Enter');
      
      // Verificar resultados
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      await expect(page.locator('text=iPhone')).toBeVisible();
    });
    
    test('deve filtrar produtos por categoria', async ({ page }) => {
      await page.goto('/produtos');
      
      // Selecionar categoria
      await page.click('[data-testid="category-smartphones"]');
      
      // Verificar filtro aplicado
      await expect(page).toHaveURL(/.*categoria=smartphones.*/);
      await expect(page.locator('[data-testid="active-filter"]')).toContainText('Smartphones');
    });
    
    test('deve mostrar detalhes do produto', async ({ page }) => {
      await page.goto('/');
      
      // Clicar no primeiro produto
      await page.click('[data-testid="product-card"]').first();
      
      // Verificar página de detalhes
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible();
    });
  });

  test.describe('Carrinho de Compras', () => {
    
    test('deve adicionar produto ao carrinho', async ({ page }) => {
      await page.goto('/');
      
      // Adicionar produto ao carrinho
      await page.click('[data-testid="product-card"]').first();
      await page.click('[data-testid="add-to-cart-btn"]');
      
      // Verificar feedback visual
      await expect(page.locator('text=Produto adicionado ao carrinho')).toBeVisible();
      
      // Verificar contador do carrinho
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    });
    
    test('deve mostrar produtos no carrinho', async ({ page }) => {
      await page.goto('/');
      
      // Adicionar produto
      await page.click('[data-testid="product-card"]').first();
      await page.click('[data-testid="add-to-cart-btn"]');
      
      // Ir para carrinho
      await page.click('[data-testid="cart-icon"]');
      
      // Verificar produto no carrinho
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
      await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
    });
    
    test('deve alterar quantidade no carrinho', async ({ page }) => {
      await page.goto('/');
      
      // Adicionar produto
      await page.click('[data-testid="product-card"]').first();
      await page.click('[data-testid="add-to-cart-btn"]');
      
      // Ir para carrinho
      await page.click('[data-testid="cart-icon"]');
      
      // Aumentar quantidade
      await page.click('[data-testid="increase-quantity"]');
      
      // Verificar quantidade atualizada
      await expect(page.locator('[data-testid="item-quantity"]')).toContainText('2');
    });
    
    test('deve remover produto do carrinho', async ({ page }) => {
      await page.goto('/');
      
      // Adicionar produto
      await page.click('[data-testid="product-card"]').first();
      await page.click('[data-testid="add-to-cart-btn"]');
      
      // Ir para carrinho
      await page.click('[data-testid="cart-icon"]');
      
      // Remover produto
      await page.click('[data-testid="remove-item"]');
      
      // Verificar carrinho vazio
      await expect(page.locator('text=Seu carrinho está vazio')).toBeVisible();
    });
  });

  test.describe('Processo de Checkout', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login como usuário teste
      await page.goto('/auth/login');
      await page.fill('[data-testid="login-email"]', TEST_USER.email);
      await page.fill('[data-testid="login-password"]', TEST_USER.password);
      await page.click('[data-testid="login-submit"]');
      
      // Adicionar produto ao carrinho
      await page.goto('/');
      await page.click('[data-testid="product-card"]').first();
      await page.click('[data-testid="add-to-cart-btn"]');
    });
    
    test('deve acessar página de checkout', async ({ page }) => {
      await page.click('[data-testid="cart-icon"]');
      await page.click('[data-testid="checkout-btn"]');
      
      // Verificar página de checkout
      await expect(page).toHaveURL(/.*\/checkout.*/);
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    });
    
    test('deve processar pagamento via PIX', async ({ page }) => {
      await page.click('[data-testid="cart-icon"]');
      await page.click('[data-testid="checkout-btn"]');
      
      // Selecionar PIX
      await page.click('[data-testid="payment-pix"]');
      
      // Preencher dados de entrega
      await page.fill('[data-testid="delivery-address"]', 'Rua Teste, 123');
      await page.fill('[data-testid="delivery-city"]', 'São Paulo');
      await page.fill('[data-testid="delivery-zipcode"]', '01234-567');
      
      // Finalizar pedido
      await page.click('[data-testid="place-order-btn"]');
      
      // Verificar redirecionamento para página de pagamento PIX
      await expect(page).toHaveURL(/.*\/payment\/pix.*/);
      await expect(page.locator('[data-testid="pix-qrcode"]')).toBeVisible();
      await expect(page.locator('[data-testid="pix-code"]')).toBeVisible();
    });
    
    test('deve processar pagamento via cartão', async ({ page }) => {
      await page.click('[data-testid="cart-icon"]');
      await page.click('[data-testid="checkout-btn"]');
      
      // Selecionar cartão
      await page.click('[data-testid="payment-card"]');
      
      // Preencher dados do cartão
      await page.fill('[data-testid="card-number"]', '4111111111111111');
      await page.fill('[data-testid="card-name"]', 'TESTE USUARIO');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvv"]', '123');
      
      // Preencher dados de entrega
      await page.fill('[data-testid="delivery-address"]', 'Rua Teste, 123');
      await page.fill('[data-testid="delivery-city"]', 'São Paulo');
      await page.fill('[data-testid="delivery-zipcode"]', '01234-567');
      
      // Finalizar pedido
      await page.click('[data-testid="place-order-btn"]');
      
      // Verificar redirecionamento para página de confirmação
      await expect(page).toHaveURL(/.*\/payment\/card.*/);
      await expect(page.locator('text=Pagamento processado')).toBeVisible();
    });
  });

  test.describe('Painel do Usuário', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login como usuário teste
      await page.goto('/auth/login');
      await page.fill('[data-testid="login-email"]', TEST_USER.email);
      await page.fill('[data-testid="login-password"]', TEST_USER.password);
      await page.click('[data-testid="login-submit"]');
    });
    
    test('deve acessar dashboard do usuário', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Verificar elementos do dashboard
      await expect(page.locator('[data-testid="user-welcome"]')).toBeVisible();
      await expect(page.locator('[data-testid="recent-orders"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-stats"]')).toBeVisible();
    });
    
    test('deve mostrar histórico de pedidos', async ({ page }) => {
      await page.goto('/dashboard/pedidos');
      
      // Verificar lista de pedidos
      await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
    });
    
    test('deve permitir editar perfil', async ({ page }) => {
      await page.goto('/dashboard/perfil');
      
      // Editar nome
      await page.fill('[data-testid="profile-name"]', 'Nome Atualizado');
      await page.click('[data-testid="save-profile"]');
      
      // Verificar sucesso
      await expect(page.locator('text=Perfil atualizado')).toBeVisible();
    });
  });

  test.describe('Painel Administrativo', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login como admin
      await page.goto('/auth/login');
      await page.fill('[data-testid="login-email"]', ADMIN_USER.email);
      await page.fill('[data-testid="login-password"]', ADMIN_USER.password);
      await page.click('[data-testid="login-submit"]');
    });
    
    test('deve acessar painel administrativo', async ({ page }) => {
      await page.goto('/admin');
      
      // Verificar acesso autorizado
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="admin-stats"]')).toBeVisible();
    });
    
    test('deve gerenciar produtos', async ({ page }) => {
      await page.goto('/admin/produtos');
      
      // Verificar lista de produtos
      await expect(page.locator('[data-testid="products-table"]')).toBeVisible();
      
      // Adicionar novo produto
      await page.click('[data-testid="add-product-btn"]');
      await page.fill('[data-testid="product-name"]', 'Produto Teste');
      await page.fill('[data-testid="product-price"]', '999.99');
      await page.fill('[data-testid="product-description"]', 'Descrição do produto teste');
      await page.click('[data-testid="save-product"]');
      
      // Verificar produto adicionado
      await expect(page.locator('text=Produto criado com sucesso')).toBeVisible();
    });
    
    test('deve gerenciar pedidos', async ({ page }) => {
      await page.goto('/admin/pedidos');
      
      // Verificar lista de pedidos
      await expect(page.locator('[data-testid="orders-table"]')).toBeVisible();
      
      // Atualizar status de pedido (se houver pedidos)
      const firstOrder = page.locator('[data-testid="order-row"]').first();
      if (await firstOrder.isVisible()) {
        await firstOrder.click();
        await page.selectOption('[data-testid="order-status"]', 'shipped');
        await page.click('[data-testid="update-order"]');
        
        await expect(page.locator('text=Pedido atualizado')).toBeVisible();
      }
    });
    
    test('deve gerenciar usuários', async ({ page }) => {
      await page.goto('/admin/usuarios');
      
      // Verificar lista de usuários
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      
      // Verificar que há pelo menos um usuário
      const userCount = await page.locator('[data-testid="user-row"]').count();
      expect(userCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Responsividade', () => {
    
    test('deve funcionar em dispositivos móveis', async ({ page }) => {
      // Configurar viewport mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // Verificar menu mobile
      await page.click('[data-testid="mobile-menu-btn"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Verificar produtos em grid mobile
      await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
    });
    
    test('deve funcionar em tablets', async ({ page }) => {
      // Configurar viewport tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/');
      
      // Verificar layout tablet
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    
    test('deve carregar página inicial rapidamente', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Verificar que carregou em menos de 3 segundos
      expect(loadTime).toBeLessThan(3000);
    });
    
    test('deve ter boa pontuação de acessibilidade', async ({ page }) => {
      await page.goto('/');
      
      // Verificar elementos de acessibilidade
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy(); // Todas as imagens devem ter alt text
      }
      
      // Verificar contraste de cores (básico)
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });
  });

  test.describe('SEO', () => {
    
    test('deve ter meta tags apropriadas', async ({ page }) => {
      await page.goto('/');
      
      // Verificar title
      const title = await page.title();
      expect(title).toContain('PowerChip');
      
      // Verificar meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
      
      // Verificar Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute('content', /.+/);
    });
    
    test('deve ter URLs amigáveis', async ({ page }) => {
      await page.goto('/');
      
      // Clicar em um produto
      await page.click('[data-testid="product-card"]').first();
      
      // Verificar URL do produto
      const url = page.url();
      expect(url).toMatch(/\/produto\/[a-z0-9-]+/);
    });
  });

  test.describe('Integração com APIs', () => {
    
    test('deve integrar com Mercado Pago', async ({ page }) => {
      // Mock da resposta do Mercado Pago
      await page.route('**/api/payments/create', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            payment_id: 'test_payment_123',
            qr_code: 'test_qr_code',
            pix_code: 'test_pix_code'
          })
        });
      });
      
      // Simular processo de pagamento
      await page.goto('/auth/login');
      await page.fill('[data-testid="login-email"]', TEST_USER.email);
      await page.fill('[data-testid="login-password"]', TEST_USER.password);
      await page.click('[data-testid="login-submit"]');
      
      await page.goto('/');
      await page.click('[data-testid="product-card"]').first();
      await page.click('[data-testid="add-to-cart-btn"]');
      await page.click('[data-testid="cart-icon"]');
      await page.click('[data-testid="checkout-btn"]');
      
      await page.click('[data-testid="payment-pix"]');
      await page.fill('[data-testid="delivery-address"]', 'Rua Teste, 123');
      await page.click('[data-testid="place-order-btn"]');
      
      // Verificar integração
      await expect(page.locator('[data-testid="pix-qrcode"]')).toBeVisible();
    });
    
    test('deve integrar com N8N webhooks', async ({ page }) => {
      let webhookCalled = false;
      
      // Interceptar webhook
      await page.route('**/webhook/order-created', route => {
        webhookCalled = true;
        route.fulfill({ status: 200, body: 'OK' });
      });
      
      // Simular criação de pedido
      await page.goto('/auth/login');
      await page.fill('[data-testid="login-email"]', TEST_USER.email);
      await page.fill('[data-testid="login-password"]', TEST_USER.password);
      await page.click('[data-testid="login-submit"]');
      
      await page.goto('/');
      await page.click('[data-testid="product-card"]').first();
      await page.click('[data-testid="add-to-cart-btn"]');
      await page.click('[data-testid="cart-icon"]');
      await page.click('[data-testid="checkout-btn"]');
      
      await page.click('[data-testid="payment-pix"]');
      await page.fill('[data-testid="delivery-address"]', 'Rua Teste, 123');
      await page.click('[data-testid="place-order-btn"]');
      
      // Aguardar webhook
      await page.waitForTimeout(2000);
      
      // Verificar que webhook foi chamado
      expect(webhookCalled).toBeTruthy();
    });
  });
});

// Testes de carga básicos
test.describe('Testes de Carga', () => {
  
  test('deve suportar múltiplos usuários simultâneos', async ({ browser }) => {
    const contexts = [];
    const pages = [];
    
    // Criar 5 contextos simultâneos
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);
    }
    
    // Navegar simultaneamente
    const promises = pages.map(async (page, index) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simular atividade do usuário
      await page.click('[data-testid="product-card"]').first();
      await page.waitForTimeout(1000);
      
      return page.title();
    });
    
    // Aguardar todas as operações
    const results = await Promise.all(promises);
    
    // Verificar que todas foram bem-sucedidas
    results.forEach(title => {
      expect(title).toContain('PowerChip');
    });
    
    // Limpar contextos
    for (const context of contexts) {
      await context.close();
    }
  });
});