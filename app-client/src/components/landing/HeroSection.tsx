'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronRight, Play, Star, Users, Zap, Shield } from 'lucide-react'

interface PageStatic {
  id: number
  key: string
  title: string
  content: string
  type: 'page' | 'section' | 'banner' | 'config'
  metadata?: Record<string, any>
}

interface HeroSectionProps {
  cmsData?: PageStatic
}

export function HeroSection({ cmsData }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Se há dados do CMS, usa eles; senão usa o conteúdo padrão
  if (cmsData && cmsData.content) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div 
          className={`container mx-auto px-4 text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div dangerouslySetInnerHTML={{ __html: cmsData.content }} />
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 text-center z-10">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8 hover:bg-blue-200 transition-colors cursor-pointer">
            <Star className="w-4 h-4 mr-2" />
            Novo: Sistema CMS integrado disponível
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestão Empresarial
            </span>
            <br />
            <span className="text-gray-800">Sem Limites</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Transforme sua empresa com nossa plataforma completa de gestão. 
            <br className="hidden md:block" />
            <span className="font-semibold text-gray-700">TypeScript, Next.js e tecnologia de ponta</span> 
            para resultados extraordinários.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/dashboard">
                Começar Grátis
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg font-semibold hover:bg-blue-50 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12 text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold">1000+</span>
              <span>Empresas Ativas</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-semibold">99.9%</span>
              <span>Uptime</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold">100%</span>
              <span>Seguro</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Next.js</div>
            <div className="text-2xl font-bold text-gray-400">TypeScript</div>
            <div className="text-2xl font-bold text-gray-400">Tailwind</div>
            <div className="text-2xl font-bold text-gray-400">PostgreSQL</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}