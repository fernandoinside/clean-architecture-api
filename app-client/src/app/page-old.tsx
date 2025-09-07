'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Loader2 } from 'lucide-react'

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

  // Encontrar conteúdo específico por key
  const heroBanner = pageData.find(p => p.key === 'hero-main-banner')
  const aboutSection = pageData.find(p => p.key === 'about-section')
  const featuresSection = pageData.find(p => p.key === 'features-section')
  const contactInfo = pageData.find(p => p.key === 'contact-info')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        
        {/* Hero Banner - Dinâmico */}
        {heroBanner ? (
          <div className="text-center mb-16">
            <div dangerouslySetInnerHTML={{ __html: heroBanner.content }} />
          </div>
        ) : (
          /* Fallback estático caso não carregue do CMS */
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              SRM Gestão
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sistema completo de gestão para empresas e clientes com interface moderna e intuitiva
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/login">
                  Fazer Login
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  Entrar no Sistema
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* About Section - Dinâmica */}
        {aboutSection && (
          <div className="mb-16">
            <div dangerouslySetInnerHTML={{ __html: aboutSection.content }} />
          </div>
        )}

        {/* Features Section - Dinâmica */}
        {featuresSection ? (
          <div className="mb-16">
            <div dangerouslySetInnerHTML={{ __html: featuresSection.content }} />
          </div>
        ) : (
          /* Features estáticas como fallback */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏢 Empresas
                </CardTitle>
                <CardDescription>
                  Gerencie empresas com informações completas e organizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cadastro completo com metadata</li>
                  <li>• Filtros e busca avançada</li>
                  <li>• Status personalizáveis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👥 Clientes
                </CardTitle>
                <CardDescription>
                  Sistema integrado de clientes com gestão de endereços
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Abas integradas (Dados + Endereços)</li>
                  <li>• Campos flexíveis com metadata</li>
                  <li>• Múltiplos endereços por cliente</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔐 Autenticação
                </CardTitle>
                <CardDescription>
                  Sistema seguro de autenticação e controle de acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Login com JWT tokens</li>
                  <li>• Refresh automático</li>
                  <li>• Recuperação de senha</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 CMS Integrado
                </CardTitle>
                <CardDescription>
                  Sistema de gerenciamento de conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Páginas estáticas editáveis</li>
                  <li>• Conteúdo dinâmico</li>
                  <li>• Banners e seções</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💳 Pagamentos
                </CardTitle>
                <CardDescription>
                  Sistema completo de pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Planos e assinaturas</li>
                  <li>• Integração Pagarme</li>
                  <li>• PIX e Cartão</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Dashboard
                </CardTitle>
                <CardDescription>
                  Interface administrativa completa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Relatórios em tempo real</li>
                  <li>• Gestão de usuários</li>
                  <li>• Controle de permissões</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA Buttons - Sempre presentes */}
        {!heroBanner && (
          <div className="text-center space-y-4 mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/login">
                  Fazer Login
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  Entrar no Sistema
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Sistema baseado na API SRM Gestão com documentação completa
            </p>
          </div>
        )}

        {/* Stats - Estáticas */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-gray-600">TypeScript</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{pageData.length || 8}+</div>
            <div className="text-gray-600">Páginas CMS</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">⚡</div>
            <div className="text-gray-600">Next.js 14</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">🎨</div>
            <div className="text-gray-600">Shadcn/ui</div>
          </div>
        </div>

        {/* Debug Info - Apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-8 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Erro CMS:</strong> {error}
            </p>
            <p className="text-red-600 text-xs mt-1">
              Exibindo conteúdo estático como fallback.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 SRM Gestão. Sistema completo de gestão empresarial.</p>
            <div className="mt-4 space-x-6">
              <Link href="/about-us" className="hover:text-gray-700">
                Sobre Nós
              </Link>
              <Link href="/privacy-policy" className="hover:text-gray-700">
                Privacidade
              </Link>
              <Link href="/terms-of-service" className="hover:text-gray-700">
                Termos
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}