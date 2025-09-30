'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'

// Tipos
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
  created_at: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<boolean>
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Atualizar usuário quando a sessão muda
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      const newUser = {
        id: session.user.id as string,
        name: session.user.name || '',
        email: session.user.email || '',
        role: (session.user as any).role || 'customer',
        created_at: (session.user as any).created_at || new Date().toISOString(),
      }
      
      setUser(prevUser => {
        // Só atualiza se realmente mudou
        if (!prevUser || 
            prevUser.id !== newUser.id ||
            prevUser.name !== newUser.name ||
            prevUser.email !== newUser.email ||
            prevUser.role !== newUser.role) {
          return newUser
        }
        return prevUser
      })
    } else {
      setUser(null)
    }

    setIsLoading(false)
  }, [session?.user?.id, session?.user?.name, session?.user?.email, (session?.user as any)?.role, status])

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciais inválidas')
        return false
      }

      if (result?.ok) {
        toast.success('Login realizado com sucesso')
        return true
      }

      return false
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro ao fazer login')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await signOut({ redirect: false })
      setUser(null)
      toast.success('Logout realizado com sucesso')
    } catch (error) {
      console.error('Erro no logout:', error)
      toast.error('Erro ao fazer logout')
    } finally {
      setIsLoading(false)
    }
  }

  // Registro
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      if (response.ok) {
        toast.success('Conta criada com sucesso')
        
        // Fazer login automaticamente após o registro
        return await login(email, password)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao criar conta')
        return false
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      toast.error('Erro ao criar conta')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Propriedades derivadas
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  const value: AuthContextType = {
    user,
    isLoading: isLoading || status === 'loading',
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar o contexto
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

export default AuthContext