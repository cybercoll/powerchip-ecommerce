import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PowerChip - Eletrônicos de Qualidade",
  description: "Os melhores produtos eletrônicos com qualidade e preço justo. Carregadores, fones, celulares, notebooks e muito mais.",
  keywords: "eletrônicos, carregador, fone de ouvido, celular, notebook, power bank, caixa de som",
  authors: [{ name: "PowerChip" }],
  creator: "PowerChip",
  publisher: "PowerChip",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://powerchip-agente-ia.com.br'),
  openGraph: {
    title: "PowerChip - Eletrônicos de Qualidade",
    description: "Os melhores produtos eletrônicos com qualidade e preço justo",
    url: 'https://powerchip-agente-ia.com.br',
    siteName: 'PowerChip',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PowerChip - Eletrônicos de Qualidade',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PowerChip - Eletrônicos de Qualidade",
    description: "Os melhores produtos eletrônicos com qualidade e preço justo",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
