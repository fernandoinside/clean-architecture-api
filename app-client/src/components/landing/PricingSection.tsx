'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Star, Zap, Crown } from 'lucide-react'

interface PageStatic {
  id: number
  key: string
  title: string
  content: string
  type: 'page' | 'section' | 'banner' | 'config'
  metadata?: Record<string, any>
}

interface PricingSectionProps {
  cmsData?: PageStatic
}

export function PricingSection({ cmsData }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'Starter',
      description: 'Perfeito para pequenas empresas começando',
      icon: Star,
      price: {
        monthly: 97,
        annual: 67
      },
      features: [
        'Até 100 empresas cadastradas',
        'Até 500 clientes',
        'Sistema básico de pagamentos',
        'CMS com 5 páginas',
        'Suporte por email',
        'Dashboard básico',
        'Relatórios mensais'
      ],
      limitations: [
        'Sem integração API avançada',
        'Sem customização de roles',
        'Sem backup automático'
      ],
      color: 'from-blue-500 to-blue-600',
      popular: false
    },
    {
      name: 'Professional',
      description: 'Ideal para empresas em crescimento',
      icon: Zap,
      price: {
        monthly: 197,
        annual: 147
      },
      features: [
        'Empresas e clientes ilimitados',
        'Sistema completo de pagamentos',
        'CMS ilimitado + editor avançado',
        'Sistema de roles e permissões',
        'Suporte prioritário 24/7',
        'Dashboard avançado com métricas',
        'Relatórios em tempo real',
        'Backup automático diário',
        'Integração API completa',
        'Notificações personalizadas'
      ],
      limitations: [],
      color: 'from-purple-500 to-purple-600',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'Para grandes corporações e necessidades específicas',
      icon: Crown,
      price: {
        monthly: 497,
        annual: 397
      },
      features: [
        'Tudo do Professional +',
        'Servidor dedicado',
        'SLA 99.99% garantido',
        'Customizações sob demanda',
        'Gerente de conta dedicado',
        'Treinamento personalizado',
        'Integração com sistemas legados',
        'Auditoria e compliance',
        'Backup em tempo real',
        'Suporte técnico especializado',
        'White-label disponível'
      ],
      limitations: [],
      color: 'from-orange-500 to-orange-600',
      popular: false
    }
  ]

  const savings = (monthly: number, annual: number) => {
    const monthlyCost = monthly * 12
    const annualCost = annual * 12
    return Math.round(((monthlyCost - annualCost) / monthlyCost) * 100)
  }

  // Se há dados do CMS, usa eles; senão usa o conteúdo padrão
  if (cmsData && cmsData.content) {
    return (
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div dangerouslySetInnerHTML={{ __html: cmsData.content }} />
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Preços que <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">fazem sentido</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Escolha o plano ideal para sua empresa. Todos os planos incluem acesso completo à plataforma e suporte especializado.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white p-1 rounded-lg shadow-lg border border-gray-200">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                !isAnnual
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                isAnnual
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Anual
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 py-1">
                -30%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            const currentPrice = isAnnual ? plan.price.annual : plan.price.monthly
            
            return (
              <Card
                key={index}
                className={`relative border-0 shadow-xl transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'ring-2 ring-blue-500 shadow-2xl'
                    : 'hover:shadow-2xl'
                } bg-white`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-r ${plan.color} text-white flex items-center justify-center mb-4`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-6">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-4xl font-bold text-gray-900">
                        R$ {currentPrice}
                      </span>
                      <div className="text-left">
                        <div className="text-gray-600 text-sm">/mês</div>
                        {isAnnual && (
                          <div className="text-green-600 text-xs font-medium">
                            Economize {savings(plan.price.monthly, plan.price.annual)}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isAnnual && (
                      <div className="text-gray-500 text-sm mt-2">
                        R$ {currentPrice * 12} cobrados anualmente
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <Button
                    className={`w-full mb-8 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Falar com Vendas' : 'Começar Agora'}
                  </Button>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                      Incluído:
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <div className="bg-green-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations.length > 0 && (
                      <>
                        <div className="font-semibold text-gray-900 text-sm uppercase tracking-wide mt-6">
                          Não incluído:
                        </div>
                        <ul className="space-y-3">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="flex items-start space-x-3">
                              <div className="bg-gray-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                                <X className="w-3 h-3 text-gray-400" />
                              </div>
                              <span className="text-gray-500 text-sm">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Perguntas Frequentes</h3>
          <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Posso cancelar a qualquer momento?
              </h4>
              <p className="text-gray-600 text-sm">
                Sim, você pode cancelar seu plano a qualquer momento. Não há taxas de cancelamento e seus dados ficam seguros por 30 dias.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Existe período de teste gratuito?
              </h4>
              <p className="text-gray-600 text-sm">
                Sim! Todos os planos incluem 14 dias de teste gratuito com acesso completo aos recursos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Como funciona o suporte técnico?
              </h4>
              <p className="text-gray-600 text-sm">
                Oferecemos suporte por email para todos os planos. Planos Professional e Enterprise têm suporte prioritário 24/7.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Posso fazer upgrade do meu plano?
              </h4>
              <p className="text-gray-600 text-sm">
                Claro! Você pode fazer upgrade ou downgrade a qualquer momento. Ajustamos a cobrança proporcionalmente.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ainda tem dúvidas sobre qual plano escolher?
            </h3>
            <p className="text-blue-100 mb-6">
              Fale com nossos especialistas e descubra qual plano é ideal para sua empresa.
            </p>
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}