import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    // Habilita styled-components
    styledComponents: true,
  },
  // Configuração de cache para melhor performance
  experimental: {
    // Habilita o uso de módulos ES no navegador
    esmExternals: true,
    // Otimiza o carregamento de fontes
    optimizeCss: true,
  },
  // Configuração explícita do root do Turbopack para evitar escolha do diretório do monorepo
  turbopack: {
    root: __dirname,
  },
  // Configuração de headers para cache e segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  // Configuração de redirecionamentos
  async redirects() {
    return [
      // Removido redirecionamento automático da landing page para dashboard
      // Agora a página inicial (/) mostra a landing page
      // {
      //   source: '/',
      //   destination: '/dashboard',
      //   permanent: true,
      // },
    ]
  },
}

export default nextConfig
