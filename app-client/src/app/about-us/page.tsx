'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, ArrowLeft } from 'lucide-react'

interface PageStatic {
  id: number
  key: string
  title: string
  content: string
  type: 'page' | 'section' | 'banner' | 'config'
  order: number
  metadata?: Record<string, any>
}

export default function AboutUsPage() {
  const [pageData, setPageData] = useState<PageStatic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3000/page-statics/key/about-us')
        
        if (!response.ok) {
          throw new Error('Página não encontrada')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {pageData ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{pageData.title}</h1>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: pageData.content }} 
              />
            </>
          ) : (
            /* Fallback content */
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre Nós</h1>
              <div className="prose prose-lg max-w-none">
                <h2>Sobre o SRM Gestão</h2>
                <p>Somos uma empresa focada em desenvolver soluções tecnológicas inovadoras para gestão empresarial.</p>
                
                <h3>Nossa Missão</h3>
                <p>Simplificar a gestão empresarial através de tecnologia avançada e interface intuitiva.</p>
                
                <h3>Nossa Visão</h3>
                <p>Ser a principal plataforma de gestão empresarial no mercado nacional.</p>
                
                <h3>Nossos Valores</h3>
                <ul>
                  <li>Inovação constante</li>
                  <li>Foco no cliente</li>
                  <li>Transparência</li>
                  <li>Qualidade</li>
                </ul>
              </div>
            </>
          )}
          
          {error && (
            <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Aviso:</strong> Não foi possível carregar o conteúdo dinâmico. Exibindo conteúdo padrão.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}