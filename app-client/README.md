# SRM Gestão - Frontend Client

Interface web moderna desenvolvida com Next.js para o sistema SRM Gestão.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com SSR
- **React 19** - Biblioteca JavaScript para UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e customizáveis
- **React Hook Form** - Gerenciamento eficiente de formulários
- **Zod** - Validação de schemas
- **Zustand** - Gerenciamento de estado leve
- **Axios** - Cliente HTTP para API
- **Lucide React** - Ícones SVG
- **React Hot Toast** - Sistema de notificações

## 📋 Funcionalidades

### Módulos Principais
- **Dashboard** - Visão geral do sistema
- **Gestão de Usuários** - Cadastro e gerenciamento de usuários
- **Gestão de Empresas** - Controle de empresas e filiais
- **Gestão de Clientes** - CRM completo
- **Sistema de Pagamentos** - Interface para pagamentos
- **Assinaturas e Planos** - Gestão de subscription
- **Configurações** - Personalização do sistema
- **Relatórios** - Dashboards e relatórios

### Recursos Técnicos
- **Responsivo** - Interface adaptada para mobile e desktop
- **Tema Escuro/Claro** - Suporte a múltiplos temas
- **Componentes Reutilizáveis** - Biblioteca de componentes própria
- **Validação em Tempo Real** - Feedback instantâneo nos formulários
- **Estado Global** - Gerenciamento centralizado com Zustand
- **Otimização de Performance** - Lazy loading e code splitting
- **Acessibilidade** - Componentes seguindo padrões WCAG

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Setup

1. **Navegue para o diretório**
```bash
cd app-client
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env.local baseado no .env.example (se existir)
# Configure a URL da API backend
```

4. **Execute em desenvolvimento**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3003`

## 📖 Scripts Disponíveis

- `npm run dev` - Desenvolvimento com hot reload (porta 3003)
- `npm run build` - Build otimizado para produção
- `npm run start` - Executar build de produção
- `npm run lint` - Verificar código com ESLint

## 🏗️ Estrutura do Projeto

```
src/
├── app/                 # App Router do Next.js
│   ├── (auth)/         # Grupo de rotas autenticadas
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página inicial
│
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (buttons, inputs, etc)
│   ├── forms/          # Componentes de formulários
│   ├── tables/         # Componentes de tabelas
│   └── layout/         # Componentes de layout
│
├── hooks/              # Hooks customizados
│   ├── useAuth.ts      # Hook de autenticação
│   └── useApi.ts       # Hook para chamadas API
│
├── store/              # Gerenciamento de estado (Zustand)
│   ├── auth.ts         # Estado de autenticação
│   ├── user.ts         # Estado dos usuários
│   └── company.ts      # Estado das empresas
│
├── lib/                # Utilitários e configurações
│   ├── api.ts          # Cliente API (Axios)
│   ├── auth.ts         # Funções de autenticação
│   └── utils.ts        # Funções utilitárias
│
├── types/              # Definições de tipos TypeScript
│   ├── api.ts          # Tipos da API
│   └── auth.ts         # Tipos de autenticação
│
├── config/             # Configurações
│   └── permissions.ts  # Configuração de permissões
│
└── styles/             # Estilos globais
    └── globals.css     # CSS global
```

## 🎨 Customização de Tema

O projeto utiliza Tailwind CSS com configuração customizada:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Cores customizadas do tema
      }
    }
  }
}
```

## 🔐 Autenticação

O sistema de autenticação utiliza:
- **JWT Tokens** armazenados no localStorage
- **Refresh Tokens** para renovação automática
- **Guards de Rota** para proteção de páginas
- **Interceptadores Axios** para headers automáticos

## 📱 Responsividade

A interface é totalmente responsiva com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🧩 Componentes

### Componentes Base
- `Button` - Botões com variações
- `Input` - Campos de entrada
- `Select` - Seletores dropdown
- `Modal` - Janelas modais
- `Table` - Tabelas com paginação

### Componentes de Layout
- `Header` - Cabeçalho da aplicação
- `Sidebar` - Menu lateral
- `Footer` - Rodapé

### Componentes de Formulário
- `FormField` - Campo de formulário com validação
- `FormSection` - Seções de formulário
- `FormActions` - Ações do formulário

## 🔧 Configuração da API

Configure a URL base da API no arquivo de configuração:

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Conecte o repositório ao Vercel
# Configure as variáveis de ambiente
# Deploy automático a cada push
```

### Build Manual
```bash
npm run build
npm run start
```

### Docker
```bash
# Dockerfile incluído no projeto
docker build -t srm-frontend .
docker run -p 3003:3003 srm-frontend
```

## 🧪 Testes

Para implementar testes futuramente:
- **Jest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **Cypress** - Testes E2E

## 🔧 Troubleshooting

### Problemas Comuns

**Erro de CORS:**
```bash
# Verifique se a API está configurada corretamente
# Confirme a URL da API nas variáveis de ambiente
```

**Erro de Build:**
```bash
# Limpe o cache do Next.js
rm -rf .next
npm run build
```

**Problemas de Styling:**
```bash
# Recompile os estilos do Tailwind
npx tailwindcss build
```

## 📚 Recursos Adicionais

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

## 🤝 Contribuição

1. Siga os padrões de código estabelecidos
2. Use TypeScript para tipagem
3. Mantenha componentes pequenos e reutilizáveis
4. Documente componentes complexos
5. Teste em diferentes dispositivos

## 🏷️ Versioning

Este projeto segue o [Semantic Versioning](https://semver.org/).