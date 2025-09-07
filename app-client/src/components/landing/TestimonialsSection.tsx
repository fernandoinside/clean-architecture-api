'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'

interface PageStatic {
  id: number
  key: string
  title: string
  content: string
  type: 'page' | 'section' | 'banner' | 'config'
  metadata?: Record<string, any>
}

interface TestimonialsSectionProps {
  cmsData?: PageStatic
}

export function TestimonialsSection({ cmsData }: TestimonialsSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Maria Silva',
      role: 'CEO',
      company: 'TechStart Ltda',
      avatar: 'MS',
      content: 'O SRM Gestão revolucionou nossa empresa. A integração com o sistema de pagamentos e o CMS dinâmico nos permitiu crescer 300% em 6 meses. A experiência do usuário é excepcional.',
      rating: 5,
      stats: '300% crescimento'
    },
    {
      id: 2,
      name: 'João Santos',
      role: 'Diretor de TI',
      company: 'InnovateCorp',
      avatar: 'JS',
      content: 'Como desenvolvedor, fico impressionado com a qualidade do código TypeScript e a arquitetura do sistema. A documentação é perfeita e o suporte técnico é excelente.',
      rating: 5,
      stats: '99.9% uptime'
    },
    {
      id: 3,
      name: 'Ana Costa',
      role: 'Gerente Comercial',
      company: 'SalesForce Pro',
      avatar: 'AC',
      content: 'A gestão de clientes integrada com endereços e o sistema de notificações nos ajudou a melhorar nossa conversão em 250%. Interface intuitiva e recursos poderosos.',
      rating: 5,
      stats: '250% conversão'
    },
    {
      id: 4,
      name: 'Pedro Oliveira',
      role: 'Fundador',
      company: 'StartupHub',
      avatar: 'PO',
      content: 'Migrar para o SRM Gestão foi a melhor decisão que tomamos. O sistema de roles e permissões nos dá controle total, e a performance é impressionante.',
      rating: 5,
      stats: '10x mais rápido'
    }
  ]

  const companies = [
    { name: 'TechStart', logo: 'TS' },
    { name: 'InnovateCorp', logo: 'IC' },
    { name: 'SalesForce Pro', logo: 'SF' },
    { name: 'StartupHub', logo: 'SH' },
    { name: 'DataCorp', logo: 'DC' },
    { name: 'CloudTech', logo: 'CT' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Se há dados do CMS, usa eles; senão usa o conteúdo padrão
  if (cmsData && cmsData.content) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div dangerouslySetInnerHTML={{ __html: cmsData.content }} />
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            O que nossos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">clientes dizem</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais de 1000 empresas confiam no SRM Gestão para transformar seus negócios.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative mb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-white relative overflow-hidden">
              {/* Background Quote */}
              <div className="absolute top-8 right-8 opacity-10">
                <Quote className="w-24 h-24 text-blue-600" />
              </div>
              
              <CardContent className="p-12">
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-24 h-24 border-4 border-blue-200">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold">
                        {testimonials[currentTestimonial].avatar}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    {/* Stars */}
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Testimonial */}
                    <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-gray-600">
                          {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].company}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {testimonials[currentTestimonial].stats}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow hover:bg-gray-50"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>

              {/* Dots */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentTestimonial === index 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow hover:bg-gray-50"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-gray-600 mb-8 text-lg">
            Empresas que confiam no SRM Gestão
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-8 md:space-x-12 opacity-60">
            {companies.map((company, index) => (
              <div
                key={index}
                className="flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-200 mb-4"
              >
                <span className="text-xl font-bold text-gray-400">
                  {company.logo}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Junte-se a mais de 1000 empresas de sucesso
            </h3>
            <p className="text-blue-100 mb-6">
              Comece gratuitamente e veja como o SRM Gestão pode transformar seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Começar Grátis
              </button>
              <button className="border border-blue-300 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors">
                Falar com Especialista
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}