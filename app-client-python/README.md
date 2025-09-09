# App Client Python - SRM Gestão

Cliente Python para consumo da API SRM Gestão, desenvolvido para uso em pontos de venda físicos com integração completa de equipamentos.

## 🏗️ Arquitetura

### Estrutura do Projeto
```
app-client-python/
├── src/                    # Código fonte principal
│   ├── core/              # Núcleo da aplicação
│   ├── api/               # Cliente da API e comunicação
│   ├── models/            # Modelos de dados
│   ├── services/          # Lógica de negócio
│   ├── ui/                # Interface do usuário
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── windows/       # Janelas principais
│   │   ├── dialogs/       # Diálogos e modais
│   │   └── themes/        # Temas e estilos
│   ├── equipment/         # Integração com equipamentos
│   │   ├── scales/        # Balanças
│   │   ├── printers/      # Impressoras
│   │   ├── fiscal/        # Equipamentos fiscais
│   │   └── barcode/       # Leitores de código de barras
│   ├── utils/             # Utilitários gerais
│   └── exceptions/        # Exceções customizadas
├── config/                # Arquivos de configuração
├── docs/                  # Documentação
├── tests/                 # Testes automatizados
├── scripts/               # Scripts de utilidade
├── assets/                # Recursos (imagens, ícones)
├── logs/                  # Logs da aplicação
└── data/                  # Dados locais e cache
```

## 🚀 Características

### ✅ Funcionalidades
- **Arquitetura em Camadas** - Separação clara de responsabilidades
- **Integração Completa de Equipamentos** - Balanças, impressoras, equipamentos fiscais
- **Interface Moderna** - Tkinter com design responsivo e profissional
- **Offline First** - Funcionamento sem conexão à internet
- **Sincronização Inteligente** - Dados sincronizados automaticamente
- **Configuração Flexível** - Sistema de configuração modular
- **Logs Estruturados** - Sistema de logging profissional
- **Testes Automatizados** - Cobertura completa de testes

### 🔧 Equipamentos Suportados
- **Balanças** - Toledo, Filizola, outras via protocolo padrão
- **Impressoras** - Térmicas, matriciais, laser
- **Equipamentos Fiscais** - ECF, SAT-CF-e, NFC-e
- **Código de Barras** - Leitores USB e serial

## 📋 Pré-requisitos

- Python 3.8+
- Tkinter (incluído no Python)
- SQLite3 (incluído no Python)
- Drivers específicos dos equipamentos

## 🛠️ Instalação

1. **Clone/Baixe o projeto**:
```bash
git clone <repository> app-client-python
cd app-client-python
```

2. **Instale dependências**:
```bash
pip install -r requirements.txt
```

3. **Configure o ambiente**:
```bash
python scripts/setup.py
```

4. **Execute a aplicação**:
```bash
python src/main.py
```

## ⚙️ Configuração

### Primeira Execução
1. Execute o script de setup: `python scripts/setup.py`
2. Configure a API no arquivo `config/api.json`
3. Configure equipamentos em `config/equipment.json`
4. Inicie a aplicação

### Arquivos de Configuração
- `config/api.json` - Configurações da API
- `config/database.json` - Configurações do banco local
- `config/equipment.json` - Configurações de equipamentos
- `config/ui.json` - Configurações da interface
- `config/logging.json` - Configurações de logs

## 🎯 Desenvolvimento

### Padrões Adotados
- **Clean Architecture** - Separação clara de camadas
- **SOLID Principles** - Código maintível e extensível
- **Design Patterns** - Factory, Observer, Strategy
- **Type Hints** - Tipagem estática para melhor manutenibilidade
- **Docstrings** - Documentação completa do código

### Estrutura de Camadas
1. **Core** - Configurações e inicialização
2. **API** - Comunicação com backend
3. **Models** - Estrutura de dados
4. **Services** - Lógica de negócio
5. **UI** - Interface do usuário
6. **Equipment** - Integração com hardware
7. **Utils** - Utilitários compartilhados

## 🧪 Testes

```bash
# Executar todos os testes
python -m pytest tests/

# Testes com cobertura
python -m pytest tests/ --cov=src

# Testes específicos
python -m pytest tests/test_api/
```

## 📊 Logs e Monitoramento

- **Logs Estruturados** - JSON format para análise
- **Múltiplos Níveis** - DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Rotação Automática** - Arquivos organizados por data
- **Dashboard de Monitoramento** - Interface para acompanhar logs

## 🔧 Extensibilidade

### Adicionando Novos Equipamentos
1. Crie uma classe em `src/equipment/`
2. Implemente a interface base
3. Configure em `config/equipment.json`
4. Adicione testes em `tests/equipment/`

### Personalizando Interface
1. Crie novos temas em `src/ui/themes/`
2. Adicione componentes em `src/ui/components/`
3. Configure em `config/ui.json`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente seguindo os padrões
4. Adicione testes
5. Envie um pull request

## 📈 Roadmap

- [ ] Interface web complementar
- [ ] Integração com mais equipamentos
- [ ] Relatórios avançados
- [ ] Sincronização em tempo real
- [ ] Suporte multi-loja
- [ ] API de plugins

---

**App Client Python SRM Gestão** - Versão 2.0  
Desenvolvido com arquitetura profissional para máxima eficiência.