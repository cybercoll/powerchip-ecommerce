import { createSupabaseAdmin } from './supabase'
import { Database } from './supabase'

type Tables = Database['public']['Tables']
type Product = Tables['products']['Row']
type Category = Tables['categories']['Row']
type User = Tables['users']['Row']
type Order = Tables['orders']['Row']
type OrderItem = Tables['order_items']['Row']
type CartItem = Tables['cart_items']['Row']

// Database helper functions
export class DatabaseService {
  private supabase = createSupabaseAdmin()

  // Execute raw SQL query
  async query(sql: string, params?: any[]): Promise<any> {
    const { data, error } = await this.supabase.rpc('execute_sql', {
      query: sql,
      params: params || []
    })
    
    if (error) throw error
    return data
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      console.log('Database: Fetching categories from Supabase...')
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Supabase error in getCategories:', error)
        throw error
      }
      
      console.log('Database: Categories fetched successfully:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Database: Error in getCategories:', error)
      throw error
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  // Products
  async getProducts(options: {
    categoryId?: string
    search?: string
    sortBy?: string
    limit?: number
    offset?: number
    includeOutOfStock?: boolean
  } = {}): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, description)
      `)
      .eq('active', true)

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    // Filtrar produtos fora de estoque se especificado
    if (options.includeOutOfStock === false) {
      query = query.gt('stock_quantity', 0)
    }

    // Aplicar ordenação
    switch (options.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'name':
      default:
        query = query.order('name', { ascending: true })
        break
    }

    if (options.limit && options.offset !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1)
    } else if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }
    return data || []
  }

  async getProductCount(options: {
    categoryId?: string
    search?: string
    includeOutOfStock?: boolean
  } = {}): Promise<number> {
    let query = this.supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    // Filtrar produtos fora de estoque se especificado
    if (options.includeOutOfStock === false) {
      query = query.gt('stock_quantity', 0)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error counting products:', error)
      throw error
    }

    return count || 0
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .eq('id', id)
      .eq('active', true)
      .single()
    
    if (error) throw error
    return data
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  }

  async updateProductStock(productId: string, quantity: number): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update({ 
        stock_quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
    
    if (error) throw error
  }

  // Users
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      // Se o erro for PGRST116 (nenhuma linha encontrada), retornar null ao invés de lançar erro
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    return data
  }

  async createUser(userData: Tables['users']['Insert']): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateUser(id: string, userData: Tables['users']['Update']): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Cart
  async getCartItems(userId: string): Promise<(CartItem & { products: Product })[]> {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select(`
        *,
        products(
          *,
          category:categories(id, name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching cart items:', error)
      throw error
    }
    return data || []
  }

  async addToCart(userId: string, productId: string, quantity: number = 1, unitPrice?: number): Promise<CartItem> {
    // Get the product price if not provided
    let price = unitPrice
    if (!price) {
      const product = await this.getProductById(productId)
      if (!product) {
        throw new Error('Produto não encontrado')
      }
      price = product.price
    }

    // Check if item already exists in cart
    const { data: existingItem } = await this.supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (existingItem) {
      // Update quantity
      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      // Create new cart item
      const { data, error } = await this.supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          unit_price: price
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId)
    }

    const { data, error } = await this.supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async removeFromCart(cartItemId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
    
    if (error) throw error
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
    
    if (error) throw error
  }

  // Orders
  async createOrder(orderData: Tables['orders']['Insert']): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async createOrderItems(orderItems: Tables['order_items']['Insert'][]): Promise<OrderItem[]> {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert(orderItems)
      .select()
    
    if (error) throw error
    return data || []
  }

  async getOrdersByUser(userId: string): Promise<(Order & { order_items: (OrderItem & { products: Product })[] })[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async getOrderById(orderId: string): Promise<(Order & { order_items: (OrderItem & { products: Product })[] }) | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('id', orderId)
      .single()
    
    if (error) throw error
    return data
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updatePaymentStatus(orderId: string, paymentStatus: Order['payment_status']): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Admin functions
  async getAllOrders(): Promise<(Order & { order_items: (OrderItem & { products: Product })[], users: User })[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        users(*),
        order_items(
          *,
          products(*)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async getUsersForAdmin(options: {
    role?: string;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<User[]> {
    let query = this.supabase
      .from('users')
      .select('*')

    if (options.role) {
      query = query.eq('role', options.role)
    }

    if (options.search) {
      query = query.or(`email.ilike.%${options.search}%,first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%`)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(options.offset, options.offset + options.limit - 1)

    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }

  async getOrdersForAdmin(options: {
    status?: string;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<Array<Order & { user_email: string; items_count: number }>> {
    let query = this.supabase
      .from('orders')
      .select(`
        *,
        users!inner(email),
        order_items(id)
      `)

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.search) {
      query = query.or(`id.ilike.%${options.search}%,users.email.ilike.%${options.search}%`)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(options.offset, options.offset + options.limit - 1)

    const { data, error } = await query
    
    if (error) throw error
    
    return data?.map(order => ({
      ...order,
      user_email: (order.users as any)?.email || 'N/A',
      items_count: (order.order_items as any[])?.length || 0
    })) || []
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  // Analytics
  async getDashboardStats(): Promise<{
    totalOrders: number
    totalRevenue: number
    totalProducts: number
    totalUsers: number
    recentOrders: Order[]
  }> {
    const [ordersResult, productsResult, usersResult, recentOrdersResult] = await Promise.all([
      this.supabase.from('orders').select('total_amount'),
      this.supabase.from('products').select('id'),
      this.supabase.from('users').select('id'),
      this.supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
    ])

    const totalOrders = ordersResult.data?.length || 0
    const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const totalProducts = productsResult.data?.length || 0
    const totalUsers = usersResult.data?.length || 0
    const recentOrders = recentOrdersResult.data || []

    return {
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders
    }
  }

  // Admin Dashboard Methods
  async getProductCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  }

  async getOrderCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  }

  async getUserCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  }

  async getTotalRevenue(): Promise<number> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered')
    
    if (error) throw error
    
    const total = data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
    return total
  }

  async getRecentOrders(limit: number = 10): Promise<Array<{
    id: string;
    user_email: string;
    total: number;
    status: string;
    created_at: string;
  }>> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        users!inner(email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return data?.map(order => ({
      id: order.id,
      user_email: (order.users as any)?.email || 'N/A',
      total: order.total_amount || 0,
      status: order.status || 'pending',
      created_at: order.created_at || ''
    })) || []
  }

  // Product Management Methods
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) throw error
    return data
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async checkProductHasOrders(productId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1)
    
    if (error) throw error
    return (data?.length || 0) > 0
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .insert(product)
      .select('*')
      .single()
    
    if (error) throw error
    return data
  }

  // Cart methods
  async getCartItems(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .select(`
          *,
          products(
            id,
            name,
            price,
            image_url,
            stock_quantity,
            active,
            category:categories(
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar itens do carrinho:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Supabase indisponível, retornando carrinho vazio:', error)
      // Retorna carrinho vazio quando Supabase não está disponível
      return []
    }
  }

  async getCartItem(userId: string, productId: string) {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar item do carrinho:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Supabase indisponível, item não encontrado:', error)
      return null
    }
  }

  async getCartItemById(itemId: string) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar item do carrinho por ID:', error)
      throw error
    }

    return data
  }

  async getCartItemWithProduct(itemId: string) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          image_url,
          stock_quantity,
          active
        )
      `)
      .eq('id', itemId)
      .single()

    if (error) {
      console.error('Erro ao buscar item do carrinho com produto:', error)
      throw error
    }

    return data
  }



  async updateCartItemQuantity(itemId: string, quantity: number) {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar quantidade do item:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Supabase indisponível, simulando atualização:', error)
      // Simula item atualizado quando Supabase não está disponível
      return {
        id: itemId,
        quantity: quantity,
        updated_at: new Date().toISOString()
      }
    }
  }

  async removeFromCart(itemId: string) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Erro ao remover do carrinho:', error)
      throw error
    }
  }

  async clearCart(userId: string) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao limpar carrinho:', error)
      throw error
    }
  }

  // Payment methods
  async updatePaymentInfo(orderId: string, paymentInfo: {
    payment_id: string
    payment_method: string
    payment_status: string
  }) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({
        payment_id: paymentInfo.payment_id,
        payment_method: paymentInfo.payment_method,
        payment_status: paymentInfo.payment_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar informações de pagamento:', error)
      throw error
    }

    return data
  }

  async getOrderByPaymentId(paymentId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(id, name, price)
        )
      `)
      .eq('payment_id', paymentId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar pedido por payment_id:', error)
      throw error
    }

    return data
  }
}

// Export the singleton instance
export const db = new DatabaseService()

// Export types
export type { Product, Category, User, Order, OrderItem, CartItem }