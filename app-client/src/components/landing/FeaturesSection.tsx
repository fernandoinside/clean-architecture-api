'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  Shield, 
  Zap,
  BarChart3,
  Mail,
  Globe,
  ArrowRight,
  Check
} from 'lucide-react'

interface PageStatic {
  id: number
  key: string
  title: string
  content: string
  type: 'page' | 'section' | 'banner' | 'config'
  metadata?: Record<string, any>
}

interface FeaturesSectionProps {
  cmsData?: PageStatic
}

export function FeaturesSection({ cmsData }: FeaturesSectionProps) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Building2,
      title: 'Gestão de Empresas',
      description: 'Complete empresa management with advanced metadata and customizable fields',
      highlights: [
        'Cadastro completo com metadata flexível',
        'Status personalizáveis por empresa',
        'Filtros e busca avançada em tempo real',
        'Relatórios detalhados de performance'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Clientes Integrados',
      description: 'Advanced customer management with integrated address system',
      highlights: [
        'Sistema integrado cliente + endereços',
        'Interface com abas para melhor UX',
        'Múltiplos endereços por cliente',
        'Histórico completo de interações'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: CreditCard,
      title: 'Sistema de Pagamentos',
      description: 'Complete payment solution with Pagarme integration',
      highlights: [
        'Integração completa com Pagarme',
        'Suporte a PIX e Cartões',
        'Planos e assinaturas flexíveis',
        'Dashboard financeiro em tempo real'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: FileText,
      title: 'CMS Dinâmico',
      description: 'Built-in content management system for dynamic pages',
      highlights: [
        'Páginas estáticas editáveis',
        'Conteúdo dinâmico por seções',
        'Sistema de banners e configurações',
        'Preview em tempo real'
      ],
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Shield,
      title: 'Segurança Avançada',
      description: 'Enterprise-level security with role-based permissions',
      highlights: [
        'Autenticação JWT com refresh',
        'Sistema de roles e permissões',
        'Auditoria completa de ações',
        'Criptografia de ponta a ponta'
      ],
      color: 'from-red-500 to-red-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and reporting dashboard',
      highlights: [
        'Dashboard em tempo real',
        'Relatórios customizáveis',
        'Métricas de performance',
        'Exportação em múltiplos formatos'
      ],
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  // Se há dados do CMS, usa eles; senão usa o conteúdo padrão
  if (cmsData && cmsData.content) {
    return (
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div dangerouslySetInnerHTML={{ __html: cmsData.content }} />
        </div>
      </section>
    )
  }

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Recursos que <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transformam</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma plataforma completa com todos os recursos que sua empresa precisa para crescer e se destacar no mercado.
          </p>
        </div>

        {/* Interactive Feature Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Feature List */}
          <div className="space-y-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white flex-shrink-0`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className={`w-5 h-5 transition-colors ${
                      activeFeature === index ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Feature Details */}
          <div className="lg:sticky lg:top-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${features[activeFeature].color} text-white flex items-center justify-center mb-4`}>
                  {(() => {
                    const IconComponent = features[activeFeature].icon
                    return <IconComponent className="w-8 h-8" />
                  })()}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {features[activeFeature].title}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  {features[activeFeature].description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features[activeFeature].highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Explorar {features[activeFeature].title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold mb-2">99.9%</div>
            <div className="text-blue-100">Uptime Garantido</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold mb-2">1000+</div>
            <div className="text-blue-100">Empresas Ativas</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold mb-2">50k+</div>
            <div className="text-blue-100">Usuários Ativos</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
            <div className="text-blue-100">Suporte Premium</div>
          </div>
        </div>
      </div>
    </section>
  )
}