const { setupServer } = require('../../node_modules/msw/lib/node/index.js')
const { http, HttpResponse } = require('msw');

// Mock handlers for API routes
const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@powerchip.com.br',
        name: 'Usuário Teste',
        role: 'customer'
      },
      token: 'mock-jwt-token'
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      user: {
        id: '2',
        email: 'newuser@powerchip.com.br',
        name: 'Novo Usuário',
        role: 'customer'
      },
      token: 'mock-jwt-token'
    }, { status: 201 });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@powerchip.com.br',
        name: 'Usuário Teste',
        role: 'customer'
      }
    });
  }),

  // Products endpoints
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');

    let products = [
      {
        id: '1',
        name: 'iPhone 15 Pro Max',
        description: 'iPhone 15 Pro Max 256GB',
        price: 8999.00,
        category: 'smartphones',
        brand: 'Apple',
        stock: 100,
        images: ['/images/iphone-15-pro-max.jpg'],
        specifications: { 'Tela': '6.7 polegadas' },
        featured: true,
        active: true
      },
      {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Samsung Galaxy S24 Ultra 512GB',
        price: 7999.00,
        category: 'smartphones',
        brand: 'Samsung',
        stock: 50,
        images: ['/images/galaxy-s24-ultra.jpg'],
        specifications: { 'Tela': '6.8 polegadas' },
        featured: true,
        active: true
      },
      {
        id: '3',
        name: 'MacBook Pro M3',
        description: 'MacBook Pro M3 14 polegadas',
        price: 15999.00,
        category: 'notebooks',
        brand: 'Apple',
        stock: 25,
        images: ['/images/macbook-pro-m3.jpg'],
        specifications: { 'Processador': 'Apple M3' },
        featured: false,
        active: true
      }
    ];

    // Filter by category
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Filter by search
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const total = products.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return HttpResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  }),

  http.get('/api/products/:id', ({ params }) => {
    const { id } = params;
    
    const product = {
      id,
      name: 'iPhone 15 Pro Max',
      description: 'iPhone 15 Pro Max 256GB com tecnologia avançada',
      price: 8999.00,
      category: 'smartphones',
      brand: 'Apple',
      stock: 100,
      images: ['/images/iphone-15-pro-max.jpg'],
      specifications: {
        'Tela': '6.7 polegadas',
        'Processador': 'A17 Pro',
        'Memória': '256GB',
        'Câmera': '48MP'
      },
      featured: true,
      active: true
    };

    return HttpResponse.json({ product });
  }),

  // Cart endpoints
  http.get('/api/cart', () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          product_id: '1',
          quantity: 2,
          product: {
            id: '1',
            name: 'iPhone 15 Pro Max',
            price: 8999.00,
            images: ['/images/iphone-15-pro-max.jpg']
          }
        }
      ],
      total: 17998.00
    });
  }),

  http.post('/api/cart/add', () => {
    return HttpResponse.json({ success: true, message: 'Produto adicionado ao carrinho' });
  }),

  http.put('/api/cart/update', () => {
    return HttpResponse.json({ success: true, message: 'Carrinho atualizado' });
  }),

  http.delete('/api/cart/remove/:id', () => {
    return HttpResponse.json({ success: true, message: 'Item removido do carrinho' });
  }),

  // Orders endpoints
  http.post('/api/orders', () => {
    return HttpResponse.json({
      order: {
        id: '1',
        user_id: '1',
        total: 8999.00,
        status: 'pending',
        payment_method: 'pix',
        payment_status: 'pending',
        created_at: new Date().toISOString()
      }
    }, { status: 201 });
  }),

  http.get('/api/orders', () => {
    return HttpResponse.json({
        orders: [
          {
            id: '1',
            user_id: '1',
            total: 8999.00,
            status: 'pending',
            payment_method: 'pix',
            payment_status: 'pending',
            created_at: new Date().toISOString(),
            items: [
              {
                product_id: '1',
                quantity: 1,
                price: 8999.00,
                product: {
                  name: 'iPhone 15 Pro Max',
                  images: ['/images/iphone-15-pro-max.jpg']
                }
              }
            ]
          }
        ]
      });
    }),

  http.get('/api/orders/:id', ({ params }) => {
    const { id } = params;
    
    return HttpResponse.json({
      order: {
        id,
        user_id: '1',
        total: 8999.00,
        status: 'pending',
        payment_method: 'pix',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        items: [
          {
            product_id: '1',
            quantity: 1,
            price: 8999.00,
            product: {
              name: 'iPhone 15 Pro Max',
              images: ['/images/iphone-15-pro-max.jpg']
            }
          }
        ]
      }
    });
  }),

  // Payment endpoints
  http.post('/api/payments/create', () => {
    return HttpResponse.json({
      payment_id: 'mock-payment-id',
      qr_code: 'mock-qr-code-data',
      qr_code_base64: 'data:image/png;base64,mock-base64',
      payment_url: 'https://mercadopago.com/mock-payment'
    });
  }),

  http.get('/api/payments/:id/status', () => {
    return HttpResponse.json({
      status: 'approved',
      payment_method: 'pix',
      transaction_amount: 8999.00
    });
  }),

  // Admin endpoints
  http.get('/api/admin/dashboard', () => {
    return HttpResponse.json({
      stats: {
        totalOrders: 150,
        totalRevenue: 450000.00,
        totalProducts: 25,
        totalUsers: 300
      },
      recentOrders: [],
      lowStockProducts: []
    });
  }),

  // External API mocks
  http.post('https://api.mercadopago.com/v1/payments', () => {
    return HttpResponse.json({
      id: 'mock-payment-id',
      status: 'pending',
      point_of_interaction: {
        transaction_data: {
          qr_code: 'mock-qr-code',
          qr_code_base64: 'data:image/png;base64,mock-base64'
        }
      }
    }, { status: 201 });
  }),

  // N8N webhook mock
  http.post('http://localhost:5678/webhook/*', () => {
    return HttpResponse.json({ success: true, message: 'Webhook received' });
  })
];

// Setup server
export const server = setupServer(...handlers);