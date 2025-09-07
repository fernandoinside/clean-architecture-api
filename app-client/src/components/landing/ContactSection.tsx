'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  MessageSquare,
  Users,
  Headphones
} from 'lucide-react'

interface PageStatic {
  id: number
  key: string
  title: string
  content: string
  type: 'page' | 'section' | 'banner' | 'config'
  metadata?: Record<string, any>
}

interface ContactSectionProps {
  cmsData?: PageStatic
}

export function ContactSection({ cmsData }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'contato@srmgestao.com',
      description: 'Resposta em até 2 horas'
    },
    {
      icon: Phone,
      title: 'Telefone',
      content: '+55 (11) 9999-9999',
      description: 'Seg-Sex: 8h às 18h'
    },
    {
      icon: MapPin,
      title: 'Endereço',
      content: 'São Paulo, SP - Brasil',
      description: 'Atendimento presencial com agendamento'
    },
    {
      icon: Clock,
      title: 'Horário de Atendimento',
      content: 'Segunda a Sexta: 8h às 18h',
      description: 'Suporte 24/7 para clientes Premium'
    }
  ]

  // Se há dados do CMS, usa eles; senão usa o conteúdo padrão
  if (cmsData && cmsData.content) {
    return (
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div dangerouslySetInnerHTML={{ __html: cmsData.content }} />
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Vamos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">conversar</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pronto para transformar sua empresa? Entre em contato conosco e descubra como o SRM Gestão pode impulsionar seu negócio.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
                  Envie sua mensagem
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Preencha o formulário abaixo e nossa equipe entrará em contato em breve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome completo *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="h-12"
                          placeholder="seu.email@empresa.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Empresa
                        </label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="h-12"
                          placeholder="Nome da sua empresa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="h-12"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assunto *
                      </label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="h-12"
                        placeholder="Como podemos te ajudar?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem *
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder="Conte-nos mais detalhes sobre sua necessidade..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-gray-500 text-center">
                      Ao enviar este formulário, você concorda com nossa{' '}
                      <a href="/privacy-policy" className="text-blue-600 hover:underline">
                        Política de Privacidade
                      </a>
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Mensagem enviada com sucesso!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Obrigado pelo seu contato. Nossa equipe responderá em breve.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({
                          name: '',
                          email: '',
                          company: '',
                          phone: '',
                          subject: '',
                          message: ''
                        })
                      }}
                      variant="outline"
                    >
                      Enviar Nova Mensagem
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <Headphones className="w-5 h-5 mr-2" />
                  Precisa de ajuda imediata?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 mb-4">
                  Nossa equipe está pronta para atendê-lo. Escolha a melhor forma de contato:
                </p>
                <div className="space-y-3">
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar Agora
                  </Button>
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-blue-600">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat ao Vivo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {info.title}
                          </h3>
                          <p className="text-gray-700 font-medium mb-1">
                            {info.content}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* FAQ Quick Access */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Perguntas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Quanto tempo leva para implementar?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      A implementação básica leva de 1 a 3 dias úteis.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Vocês oferecem treinamento?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Sim, todos os planos incluem treinamento da equipe.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Os dados ficam seguros?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Total segurança com criptografia e backup automático.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pronto para começar?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Junte-se a mais de 1000 empresas que já transformaram seus negócios com o SRM Gestão.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3">
                <Users className="w-4 h-4 mr-2" />
                Começar Teste Grátis
              </Button>
              <Button variant="outline" className="px-8 py-3">
                <Phone className="w-4 h-4 mr-2" />
                Agendar Demonstração
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}