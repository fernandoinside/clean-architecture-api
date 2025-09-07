'use client'

import { ReactNode } from 'react'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

interface LandingLayoutProps {
  children: ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}