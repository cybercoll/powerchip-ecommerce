import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock do Next.js router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    query: {},
    asPath: '/'
  })
}));

// Mock do react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock do CartContext
const mockAddToCart = jest.fn().mockResolvedValue(true);
jest.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    items: [],
    total: 0,
    isLoading: false,
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn()
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock do AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

const mockProduct = {
  id: '1',
  name: 'iPhone 15 Pro Max',
  description: 'iPhone 15 Pro Max 256GB',
  price: 8999.00,
  category: 'smartphones',
  brand: 'Apple',
  stock: 100,
  images: ['/images/iphone-15-pro-max.jpg'],
  specifications: {
    'Tela': '6.7 polegadas',
    'Processador': 'A17 Pro'
  },
  featured: true,
  active: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <CartProvider>
        {component}
      </CartProvider>
    </AuthProvider>
  );
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar as informações do produto corretamente', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('iPhone 15 Pro Max')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15 Pro Max 256GB')).toBeInTheDocument();
    expect(screen.getByText('R$ 8.999,00')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Em estoque (100)')).toBeInTheDocument();
  });

  it('deve exibir a imagem do produto com alt text correto', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('iPhone 15 Pro Max');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/iphone-15-pro-max.jpg');
  });

  it('deve navegar para a página do produto ao clicar no card', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const card = screen.getByTestId('product-card');
    fireEvent.click(card);

    // Verificar se o mock foi chamado (pode haver delay)
    expect(mockPush).toHaveBeenCalled();
  });

  it('deve adicionar produto ao carrinho ao clicar no botão', async () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const addButton = screen.getByText('Adicionar ao Carrinho');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id, 1);
    });
  });

  it('deve exibir badge de destaque quando produto é featured', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Destaque')).toBeInTheDocument();
  });

  it('deve exibir produto sem estoque corretamente', () => {
    const outOfStockProduct = {
      ...mockProduct,
      stock: 0
    };

    renderWithProviders(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText('Sem estoque')).toBeInTheDocument();
    expect(screen.getByText('Indisponível')).toBeInTheDocument();
    
    const addButton = screen.queryByText('Adicionar ao Carrinho');
    expect(addButton).not.toBeInTheDocument();
  });

  it('deve aplicar desconto quando fornecido', () => {
    const discountedProduct = {
      ...mockProduct,
      discount: 10 // 10% de desconto
    };

    renderWithProviders(<ProductCard product={discountedProduct} />);

    expect(screen.getByText('R$ 8.099,10')).toBeInTheDocument(); // Preço com desconto
    expect(screen.getByText('R$ 8.999,00')).toBeInTheDocument(); // Preço original riscado
    expect(screen.getByText('10% OFF')).toBeInTheDocument();
  });

  it('deve exibir especificações principais do produto', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    // Verificar se as especificações estão presentes (podem estar em elementos separados)
    expect(screen.getByText(/Tela/)).toBeInTheDocument();
    expect(screen.getByText(/6.7 polegadas/)).toBeInTheDocument();
    expect(screen.getByText(/Processador/)).toBeInTheDocument();
    expect(screen.getByText(/A17 Pro/)).toBeInTheDocument();
  });

  it('deve ter acessibilidade adequada', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', 'Produto: iPhone 15 Pro Max');

    const addButton = screen.getByRole('button', { name: /adicionar ao carrinho/i });
    expect(addButton).toBeInTheDocument();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/1');
  });

  it('deve lidar com erro ao adicionar ao carrinho', async () => {
    mockAddToCart.mockRejectedValueOnce(new Error('Erro ao adicionar'));

    renderWithProviders(<ProductCard product={mockProduct} />);

    const addButton = screen.getByText('Adicionar ao Carrinho');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('1', 1);
    });
  });

  it('deve exibir loading ao adicionar produto ao carrinho', async () => {
    mockAddToCart.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderWithProviders(<ProductCard product={mockProduct} />);

    const addButton = screen.getByText('Adicionar ao Carrinho');
    fireEvent.click(addButton);

    expect(screen.getByText('Adicionando...')).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });
});