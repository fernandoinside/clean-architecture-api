'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { LandingLayout } from '@/components/layouts/LandingLayout'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { ContactSection } from '@/components/landing/ContactSection'

interface PageStatic {
  id: number
  key: string
  title: string
  content: string
  type: 'page' | 'section' | 'banner' | 'config'
  order: number
  metadata?: Record<string, any>
}

export default function HomePage() {
  const [pageData, setPageData] = useState<PageStatic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3000/page-statics/public')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados da página')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setPageData(data.data)
        } else {
          throw new Error('Erro nos dados recebidos')
        }
      } catch (err) {
        console.error('Erro ao carregar página:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        // Fallback para conteúdo estático em caso de erro
        setPageData([])
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Encontrar conteúdo específico por key para cada seção
  const heroBanner = pageData.find(p => p.key === 'hero-main-banner')
  const featuresSection = pageData.find(p => p.key === 'features-section')
  const testimonialsSection = pageData.find(p => p.key === 'testimonials-section')
  const pricingSection = pageData.find(p => p.key === 'pricing-section')
  const contactSection = pageData.find(p => p.key === 'contact-section')

  return (
    <LandingLayout>
      {/* Hero Section com suporte a CMS */}
      <HeroSection cmsData={heroBanner} />
      
      {/* Features Section com suporte a CMS */}
      <FeaturesSection cmsData={featuresSection} />
      
      {/* Testimonials Section com suporte a CMS */}
      <TestimonialsSection cmsData={testimonialsSection} />
      
      {/* Pricing Section com suporte a CMS */}
      <PricingSection cmsData={pricingSection} />
      
      {/* Contact Section com suporte a CMS */}
      <ContactSection cmsData={contactSection} />

      {/* Debug Info - Apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && error && (
        <div className="container mx-auto px-4 mt-8">
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Erro CMS:</strong> {error}
            </p>
            <p className="text-red-600 text-xs mt-1">
              Exibindo conteúdo estático como fallback. Seções CMS encontradas: {pageData.length}
            </p>
          </div>
        </div>
      )}
    </LandingLayout>
  )
}