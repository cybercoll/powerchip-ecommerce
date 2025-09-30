import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createSupabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'
import { db } from './database'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const supabase = createSupabaseAdmin()
          
          // Get user from Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          if (authError || !authData.user) {
            return null
          }

          // Get user profile from our users table
          const user = await db.getUserById(authData.user.id)
          
          if (!user) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  secret: process.env.NEXTAUTH_SECRET
}

// Auth helper functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUserAccount(email: string, password: string, name: string, role: 'admin' | 'client' = 'client') {
  try {
    const supabase = createSupabaseAdmin()
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create auth user')
    }

    // Split name into parts for database
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    // Hash the password for our users table
    const passwordHash = await hashPassword(password)
    
    // Create user profile in our users table
    const user = await db.createUser({
      id: authData.user.id,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role
    })

    return user
  } catch (error) {
    console.error('Create user error:', error)
    throw error
  }
}

// Middleware helper to check user role
export function requireAuth(requiredRole?: 'admin' | 'customer') {
  return (handler: any) => {
    return async (req: any, res: any) => {
      const session = await getServerSession(req, res, authOptions)
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (requiredRole && session.user.role !== requiredRole && session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      req.user = session.user
      return handler(req, res)
    }
  }
}

// Types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}

import { getServerSession } from 'next-auth/next'