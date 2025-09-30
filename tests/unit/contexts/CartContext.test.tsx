import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import * as cartService from '@/lib/services/cart';

// Mock dos serviços
jest.mock('@/lib/services/cart');
const mockCartService = cartService as jest.Mocked<typeof cartService>;

// Mock do toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockUser = {
  id: '1',
  email: 'test@powerchip.com.br',
  name: 'Usuário Teste',
  role: 'customer' as const
};

const mockCartItems = [
  {
    id: '1',
    product_id: '1',
    user_id: '1',
    quantity: 2,
    created_at: '2024-01-01T00:00:00.000Z',
    product: {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 8999.00,
      images: ['/images/iphone-15-pro-max.jpg'],
      stock: 100
    }
  },
  {
    id: '2',
    product_id: '2',
    user_id: '1',
    quantity: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    product: {
      id: '2',
      name: 'Samsung Galaxy S24',
      price: 6999.00,
      images: ['/images/galaxy-s24.jpg'],
      stock: 50
    }
  }
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <CartProvider>
      {children}
    </CartProvider>
  </AuthProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do usuário autenticado
    jest.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        user: mockUser,
        isAuthenticated: true
      })
    }));
  });

  describe('Estado inicial', () => {
    it('deve inicializar com carrinho vazio', () => {
      mockCartService.getCartItems.mockResolvedValue([]);
      
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.items).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.isLoading).toBe(true);
    });

    it('deve carregar itens do carrinho na inicialização', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });

      await waitForNextUpdate();

      expect(result.current.items).toEqual(mockCartItems);
      expect(result.current.total).toBe(24997.00); // (8999 * 2) + (6999 * 1)
      expect(result.current.itemCount).toBe(3); // 2 + 1
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('addToCart', () => {
    it('deve adicionar produto ao carrinho com sucesso', async () => {
      mockCartService.getCartItems.mockResolvedValue([]);
      mockCartService.addToCart.mockResolvedValue({
        id: '3',
        product_id: '3',
        user_id: '1',
        quantity: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        product: {
          id: '3',
          name: 'MacBook Pro M3',
          price: 15999.00,
          images: ['/images/macbook-pro-m3.jpg'],
          stock: 25
        }
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        await result.current.addToCart('3', 1);
      });

      expect(mockCartService.addToCart).toHaveBeenCalledWith('3', 1);
      expect(result.current.items).toHaveLength(1);
      expect(result.current.total).toBe(15999.00);
    });

    it('deve lidar com erro ao adicionar produto', async () => {
      mockCartService.getCartItems.mockResolvedValue([]);
      mockCartService.addToCart.mockRejectedValue(new Error('Produto sem estoque'));
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        const success = await result.current.addToCart('3', 1);
        expect(success).toBe(false);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('deve incrementar quantidade se produto já existe no carrinho', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.updateCartItem.mockResolvedValue({
        ...mockCartItems[0],
        quantity: 3
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        await result.current.addToCart('1', 1);
      });

      expect(mockCartService.updateCartItem).toHaveBeenCalledWith('1', 3);
    });
  });

  describe('updateQuantity', () => {
    it('deve atualizar quantidade do item', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.updateCartItem.mockResolvedValue({
        ...mockCartItems[0],
        quantity: 5
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateQuantity('1', 5);
      });

      expect(mockCartService.updateCartItem).toHaveBeenCalledWith('1', 5);
    });

    it('deve remover item quando quantidade for 0', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.removeFromCart.mockResolvedValue(true);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        await result.current.updateQuantity('1', 0);
      });

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith('1');
    });

    it('deve lidar com erro ao atualizar quantidade', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.updateCartItem.mockRejectedValue(new Error('Erro ao atualizar'));
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        const success = await result.current.updateQuantity('1', 5);
        expect(success).toBe(false);
      });
    });
  });

  describe('removeFromCart', () => {
    it('deve remover item do carrinho', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.removeFromCart.mockResolvedValue(true);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        await result.current.removeFromCart('1');
      });

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith('1');
    });

    it('deve lidar com erro ao remover item', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.removeFromCart.mockRejectedValue(new Error('Erro ao remover'));
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        const success = await result.current.removeFromCart('1');
        expect(success).toBe(false);
      });
    });
  });

  describe('clearCart', () => {
    it('deve limpar todo o carrinho', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.clearCart.mockResolvedValue(true);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        await result.current.clearCart();
      });

      expect(mockCartService.clearCart).toHaveBeenCalled();
    });

    it('deve lidar com erro ao limpar carrinho', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      mockCartService.clearCart.mockRejectedValue(new Error('Erro ao limpar'));
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      await act(async () => {
        const success = await result.current.clearCart();
        expect(success).toBe(false);
      });
    });
  });

  describe('Cálculos', () => {
    it('deve calcular total corretamente', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      expect(result.current.total).toBe(24997.00);
    });

    it('deve calcular quantidade total de itens', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      expect(result.current.itemCount).toBe(3);
    });

    it('deve retornar 0 para carrinho vazio', async () => {
      mockCartService.getCartItems.mockResolvedValue([]);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      expect(result.current.total).toBe(0);
      expect(result.current.itemCount).toBe(0);
    });
  });

  describe('Utilitários', () => {
    it('deve verificar se produto está no carrinho', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      expect(result.current.isInCart('1')).toBe(true);
      expect(result.current.isInCart('999')).toBe(false);
    });

    it('deve retornar quantidade do produto no carrinho', async () => {
      mockCartService.getCartItems.mockResolvedValue(mockCartItems);
      
      const { result, waitForNextUpdate } = renderHook(() => useCart(), { wrapper });
      await waitForNextUpdate();

      expect(result.current.getItemQuantity('1')).toBe(2);
      expect(result.current.getItemQuantity('2')).toBe(1);
      expect(result.current.getItemQuantity('999')).toBe(0);
    });
  });
});