# Guia de Instalação - App Client Python

Este guia detalha o processo completo de instalação e configuração do Cliente Python SRM Gestão.

## 📋 Pré-requisitos

### Sistema Operacional
- Windows 10/11 (recomendado)
- Windows 7/8.1 (suporte limitado)
- Linux (Ubuntu 20.04+)

### Software Necessário
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Git (opcional, para desenvolvimento)

### Hardware Recomendado
- Processador: Dual-core 2.0GHz+
- RAM: 4GB mínimo, 8GB recomendado
- Armazenamento: 500MB livres
- USB/Serial: Para equipamentos

## 🚀 Instalação Rápida

### 1. Baixar o Projeto
```bash
# Opção 1: Clone do repositório
git clone <url-do-repositorio> app-client-python
cd app-client-python

# Opção 2: Download direto
# Extraia o arquivo ZIP baixado em uma pasta de sua escolha
```

### 2. Instalar Dependências
```bash
# Instalar pacotes Python necessários
pip install -r requirements.txt
```

### 3. Executar Setup Inicial
```bash
# Windows
python scripts/setup.py

# Linux/Mac
python3 scripts/setup.py
```

### 4. Primeira Execução
```bash
# Windows
python src/main.py
# ou
run_pos.bat

# Linux/Mac
python3 src/main.py
```

## 🔧 Instalação Detalhada

### Verificação do Python

1. **Verificar versão instalada:**
```bash
python --version
# Deve mostrar Python 3.8+ 
```

2. **Se Python não estiver instalado:**
   - Windows: Baixe em [python.org](https://python.org)
   - Ubuntu: `sudo apt install python3 python3-pip`
   - CentOS: `sudo yum install python3 python3-pip`

### Configuração de Ambiente Virtual (Recomendado)

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências no ambiente virtual
pip install -r requirements.txt
```

### Instalação Manual de Dependências

Se houver problemas com o requirements.txt:

```bash
# Dependências principais
pip install requests==2.31.0
pip install Pillow==10.3.0
pip install pydantic==2.5.3
pip install pyserial==3.5

# Dependências de interface
pip install ttkthemes==3.2.2
pip install customtkinter==5.2.0

# Dependências opcionais
pip install structlog==23.2.0
pip install pyyaml==6.0.1
```

## ⚙️ Configuração Inicial

### 1. Configuração da API

Edite o arquivo `config/local_api.json`:

```json
{
  "base_url": "http://seu-servidor:3000",
  "timeout": 30,
  "retry_attempts": 3,
  "headers": {
    "User-Agent": "SRM-POS-Client/2.0"
  }
}
```

### 2. Configuração de Equipamentos

Edite `config/local_equipment.json` conforme necessário:

```json
{
  "scales": {
    "enabled": true,
    "default_brand": "toledo",
    "connection": {
      "port": "COM1",
      "baudrate": 9600
    }
  },
  "printers": {
    "enabled": true,
    "thermal": {
      "enabled": true,
      "connection": {
        "type": "usb"
      }
    }
  }
}
```

### 3. Configuração da Interface

Edite `config/local_ui.json` para personalizar:

```json
{
  "theme": {
    "name": "modern_light"
  },
  "window": {
    "main": {
      "width": 1200,
      "height": 800,
      "maximized": false
    }
  }
}
```

## 🔌 Configuração de Equipamentos

### Balanças

#### Toledo
1. Conecte via cabo serial (RS-232)
2. Configure porta na configuração
3. Teste a conexão no menu Equipamentos

#### Filizola
1. Conecte via cabo serial
2. Verifique protocolo na documentação
3. Ajuste configurações conforme modelo

### Impressoras Térmicas

#### EPSON TM-T20
1. Instale driver oficial
2. Configure como impressora padrão
3. Teste impressão no sistema

#### Outras Marcas
1. Verifique compatibilidade ESC/POS
2. Configure porta USB/Serial
3. Teste comandos básicos

### Equipamentos Fiscais

#### SAT-CF-e
1. Instale biblioteca do fabricante
2. Configure certificados
3. Teste ativação SAT

## 🐛 Solução de Problemas

### Problemas Comuns

#### "Python não é reconhecido como comando"
**Solução:** Adicione Python ao PATH do sistema
- Windows: Reinstale Python marcando "Add to PATH"
- Linux: Python3 geralmente já está no PATH

#### "Módulo não encontrado"
**Solução:** 
```bash
pip install nome_do_modulo
# ou
pip install -r requirements.txt --force-reinstall
```

#### "Porta COM em uso"
**Solução:**
1. Feche outros programas que usam a porta
2. Reinicie o computador
3. Verifique Device Manager (Windows)

#### "Falha na conexão com API"
**Solução:**
1. Verifique se o servidor está rodando
2. Teste conectividade: `ping seu-servidor`
3. Verifique firewall/antivírus
4. Use modo offline temporariamente

### Logs e Debugging

#### Localização dos Logs
- Windows: `logs\app.log`
- Linux: `logs/app.log`

#### Ativar Debug Detalhado
Edite `config/local_logging.json`:
```json
{
  "loggers": {
    "": {
      "level": "DEBUG"
    }
  }
}
```

#### Verificar Status do Sistema
Execute no menu da aplicação: `Ver Logs` ou `Status do Sistema`

## 📊 Verificação da Instalação

### Teste Básico
1. Execute `python src/main.py`
2. Verifique se a interface abre
3. Teste conectividade API (botão de teste)
4. Verifique logs em `logs/app.log`

### Teste de Equipamentos
1. Acesse menu Equipamentos
2. Teste cada equipamento configurado
3. Verifique logs de equipamentos

### Teste de Banco de Dados
1. Verifique criação do arquivo `data/pos_local.db`
2. Execute uma transação de teste
3. Confirme armazenamento dos dados

## 🔒 Segurança

### Permissões de Arquivo
- Aplicação: Leitura/Escrita na pasta do projeto
- Equipamentos: Acesso a portas COM/USB
- Rede: Acesso HTTP/HTTPS para API

### Configurações de Firewall
- Libere porta da API (geralmente 3000)
- Permita conexões de saída HTTP/HTTPS
- Configure antivírus para não bloquear

## 📱 Instalação em Múltiplos Terminais

### Terminal Principal (Servidor)
1. Instale versão completa
2. Configure banco de dados central
3. Execute sincronizações

### Terminais Secundários
1. Instale versão cliente
2. Configure apontamento para servidor principal
3. Configure equipamentos locais

## 🔄 Atualizações

### Atualização Manual
1. Faça backup da pasta `data/` e `config/`
2. Baixe nova versão
3. Substitua arquivos, mantendo configurações
4. Execute: `pip install -r requirements.txt --upgrade`

### Verificação de Versão
Consulte versão atual em: Menu > Sobre

## 📞 Suporte

### Documentação Adicional
- `docs/API.md` - Documentação da API
- `docs/EQUIPMENT.md` - Guia de equipamentos
- `docs/TROUBLESHOOTING.md` - Solução de problemas

### Contato
- Email: suporte@srmgestao.com
- Documentação: [docs.srmgestao.com](https://docs.srmgestao.com)
- Issues: GitHub Issues (para bugs)

---

**Instalação concluída com sucesso?** 
Consulte o `docs/USER_GUIDE.md` para começar a usar o sistema!