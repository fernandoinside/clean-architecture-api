# SRM Gestão - Sistema de Gestão Completo

Sistema completo de gestão empresarial desenvolvido com Node.js/TypeScript (backend) e Next.js (frontend).

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com TypeScript
- **Express.js** - Framework web
- **Knex.js** - Query builder para SQL
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Winston** - Sistema de logs
- **Docker** - Containerização

### Frontend
- **Next.js 15** com React 19
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Radix UI** - Componentes acessíveis
- **React Hook Form** - Gerenciamento de formulários
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP

## 📋 Funcionalidades

- **Gestão de Usuários** - CRUD completo com sistema de permissões
- **Gestão de Empresas** - Múltiplas empresas por usuário
- **Gestão de Clientes** - Cadastro completo com endereços
- **Sistema de Pagamentos** - Integração com gateways de pagamento
- **Sistema de Assinaturas** - Planos e controle de acesso
- **Gestão de Arquivos** - Upload e organização de documentos
- **Sistema de Notificações** - Alertas e comunicações
- **Logs de Auditoria** - Rastreamento de ações do sistema
- **Sistema de Templates** - Templates personalizáveis para e-mails
- **API RESTful** - Documentada com Swagger

## 🛠️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+
- Redis
- Docker (opcional)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd api-srmgestao
```

2. **Configuração das variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Instalação das dependências**

Backend:
```bash
npm install
```

Frontend:
```bash
cd app-client
npm install
```

4. **Configuração do banco de dados**
```bash
# Executar migrações
npm run db:migrate

# Executar seeds (opcional)
npm run db:seed
```

### Docker (Recomendado)

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Logs dos serviços
docker-compose logs -f
```

## 🚀 Execução

### Desenvolvimento

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
cd app-client
npm run dev
```

### Produção

**Backend:**
```bash
npm run build
npm start
```

**Frontend:**
```bash
cd app-client
npm run build
npm start
```

## 📚 Scripts Disponíveis

### Backend
- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Build para produção
- `npm run start` - Iniciar em produção
- `npm run lint` - Verificar código
- `npm run format` - Formatar código
- `npm run db:migrate` - Executar migrações
- `npm run db:studio` - Interface visual do banco

### Frontend
- `npm run dev` - Desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Iniciar build de produção
- `npm run lint` - Verificar código

## 📖 API Documentation

A documentação da API está disponível através do Swagger:
- Desenvolvimento: `http://localhost:3001/api-docs`
- Produção: `https://seu-dominio.com/api-docs`

## 🏗️ Arquitetura

### Backend
```
src/
├── config/          # Configurações
├── controllers/     # Controladores
├── middleware/      # Middlewares
├── models/         # Modelos de dados
├── routes/         # Rotas da API
├── services/       # Lógica de negócio
├── utils/          # Utilitários
├── validations/    # Validações
├── migrations/     # Migrações do banco
└── seeds/          # Seeds do banco
```

### Frontend
```
app-client/src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Hooks personalizados
├── store/         # Gerenciamento de estado
├── lib/           # Utilitários e configurações
└── config/        # Configurações
```

## 🔒 Segurança

- **Autenticação JWT** com refresh tokens
- **Rate limiting** para prevenir spam
- **Helmet.js** para headers de segurança
- **CORS** configurado adequadamente
- **Validação rigorosa** de entrada de dados
- **Sanitização** de dados
- **Logs de auditoria** completos

## 🗄️ Banco de Dados

O sistema utiliza PostgreSQL como banco principal e Redis para cache e sessões. As migrações garantem versionamento e evolução do schema.

## 📊 Monitoramento

- **Winston** para logs estruturados
- **Logs rotativos** diários
- **Health checks** para monitoramento
- **Métricas** de performance

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos canais oficiais do projeto.