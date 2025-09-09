# Guia de Desenvolvimento

Este documento fornece diretrizes para desenvolver e contribuir com o projeto App Client Python.

## 🛠️ Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Python 3.8+
- Git
- Editor de código (VS Code recomendado)
- Terminal/Command Prompt

### Setup Inicial

1. **Clone do repositório**:
```bash
git clone <repository-url>
cd app-client-python
```

2. **Ambiente virtual**:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac  
source venv/bin/activate
```

3. **Dependências de desenvolvimento**:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Se existir

# Ou instalar manualmente ferramentas de dev:
pip install black flake8 mypy pytest pytest-cov pre-commit
```

4. **Setup de hooks**:
```bash
pre-commit install
```

## 📋 Padrões de Código

### Formatação com Black

```bash
# Formatar todo o código
black src/ tests/

# Verificar sem modificar
black --check src/
```

### Linting com Flake8

```bash
# Verificar qualidade do código
flake8 src/ tests/

# Configuração em setup.cfg ou .flake8
```

### Type Checking com MyPy

```bash
# Verificar tipagem
mypy src/

# Configuração em pyproject.toml
```

### Exemplo de Código Bem Formatado

```python
"""
Módulo de exemplo seguindo padrões do projeto
"""

from typing import Optional, List, Dict, Any
from decimal import Decimal
import logging

from ..models.base import BaseModel
from ..core.config import get_config

logger = logging.getLogger(__name__)


class ExampleService:
    """
    Service de exemplo demonstrando padrões adotados
    
    Attributes:
        config: Configurações do serviço
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or get_config().get('example', default={})
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
    
    def process_items(
        self, 
        items: List[BaseModel], 
        discount_percent: Optional[Decimal] = None
    ) -> Dict[str, Any]:
        """
        Processa lista de itens aplicando lógica de negócio
        
        Args:
            items: Lista de itens a processar
            discount_percent: Desconto percentual opcional
            
        Returns:
            Dicionário com resultado do processamento
            
        Raises:
            ValueError: Se items estiver vazio
            TypeError: Se discount_percent for inválido
        """
        if not items:
            raise ValueError("Lista de itens não pode estar vazia")
        
        if discount_percent is not None and discount_percent < 0:
            raise ValueError("Percentual de desconto não pode ser negativo")
        
        self.logger.info(
            "Processando itens",
            extra={
                'item_count': len(items),
                'discount_percent': discount_percent
            }
        )
        
        total_amount = Decimal('0.00')
        processed_items = []
        
        for item in items:
            processed_item = self._process_single_item(item, discount_percent)
            processed_items.append(processed_item)
            total_amount += processed_item.get('amount', Decimal('0.00'))
        
        result = {
            'items': processed_items,
            'total_amount': total_amount,
            'discount_applied': discount_percent is not None
        }
        
        self.logger.info(
            "Processamento concluído",
            extra={
                'total_amount': float(total_amount),
                'items_processed': len(processed_items)
            }
        )
        
        return result
    
    def _process_single_item(
        self, 
        item: BaseModel, 
        discount_percent: Optional[Decimal]
    ) -> Dict[str, Any]:
        """Processa um item individual"""
        # Implementação específica
        pass
```

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/                    # Testes unitários
│   ├── test_models.py
│   ├── test_services.py
│   └── test_utils.py
├── integration/             # Testes de integração
│   ├── test_api_client.py
│   └── test_database.py
├── equipment/               # Testes de equipamentos
│   ├── test_scales.py
│   └── test_printers.py
├── fixtures/                # Dados de teste
│   ├── products.json
│   └── sales.json
└── conftest.py             # Configuração pytest
```

### Escrevendo Testes

#### Teste Unitário Exemplo

```python
"""
Testes para ProductService
"""

import pytest
from decimal import Decimal
from unittest.mock import Mock, patch

from src.services.product_service import ProductService
from src.models.product import Product


class TestProductService:
    """Testes para ProductService"""
    
    @pytest.fixture
    def mock_database(self):
        """Mock do banco de dados"""
        db = Mock()
        db.execute_query.return_value = []
        return db
    
    @pytest.fixture
    def mock_api_client(self):
        """Mock do cliente da API"""
        api = Mock()
        api.get.return_value = {'products': []}
        return api
    
    @pytest.fixture
    def product_service(self, mock_database, mock_api_client):
        """Instância do ProductService com mocks"""
        return ProductService(mock_database, mock_api_client)
    
    def test_calculate_item_total_without_discount(self, product_service):
        """Testa cálculo de total sem desconto"""
        # Arrange
        product = Product(
            id=1,
            name="Produto Teste",
            price=Decimal('10.50')
        )
        quantity = 3
        
        # Act
        total = product_service.calculate_item_total(product, quantity)
        
        # Assert
        assert total == Decimal('31.50')
    
    def test_calculate_item_total_with_discount(self, product_service):
        """Testa cálculo de total com desconto"""
        # Arrange
        product = Product(
            id=1,
            name="Produto Teste", 
            price=Decimal('100.00')
        )
        quantity = 1
        discount_percent = Decimal('10.00')
        
        # Act
        total = product_service.calculate_item_total(
            product, quantity, discount_percent
        )
        
        # Assert
        assert total == Decimal('90.00')
    
    @pytest.mark.parametrize("quantity,expected", [
        (1, Decimal('10.50')),
        (2, Decimal('21.00')),
        (0, Decimal('0.00'))
    ])
    def test_calculate_total_different_quantities(
        self, product_service, quantity, expected
    ):
        """Testa cálculo com diferentes quantidades"""
        product = Product(id=1, name="Test", price=Decimal('10.50'))
        
        result = product_service.calculate_item_total(product, quantity)
        
        assert result == expected
    
    def test_search_products_api_error(self, product_service, mock_api_client):
        """Testa comportamento quando API falha"""
        # Arrange
        mock_api_client.get.side_effect = Exception("API Error")
        
        # Act & Assert
        with pytest.raises(Exception, match="API Error"):
            product_service.search_products("test query")
```

#### Teste de Integração Exemplo

```python
"""
Testes de integração para DatabaseManager
"""

import pytest
import tempfile
from pathlib import Path

from src.core.database import DatabaseManager


class TestDatabaseIntegration:
    """Testes de integração do banco de dados"""
    
    @pytest.fixture
    def temp_db(self):
        """Banco temporário para testes"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        db = DatabaseManager(db_path)
        yield db
        
        # Cleanup
        Path(db_path).unlink(missing_ok=True)
    
    def test_create_and_read_product(self, temp_db):
        """Testa criação e leitura de produto"""
        # Arrange
        product_data = {
            'name': 'Produto Teste',
            'price': 19.99,
            'sku': 'TEST123'
        }
        
        # Act - Criar produto
        temp_db.execute_query(
            """
            INSERT INTO products (name, price, sku) 
            VALUES (?, ?, ?)
            """,
            (product_data['name'], product_data['price'], product_data['sku'])
        )
        
        # Act - Ler produto
        result = temp_db.execute_query(
            "SELECT name, price, sku FROM products WHERE sku = ?",
            (product_data['sku'],),
            fetch=True
        )
        
        # Assert
        assert len(result) == 1
        row = result[0]
        assert row['name'] == product_data['name']
        assert row['price'] == product_data['price']
        assert row['sku'] == product_data['sku']
```

### Executando Testes

```bash
# Todos os testes
pytest

# Testes específicos
pytest tests/unit/test_models.py

# Com cobertura
pytest --cov=src tests/

# Verbose
pytest -v

# Parar no primeiro erro
pytest -x

# Executar testes marcados
pytest -m "not slow"
```

### Configuração do Pytest

```python
# conftest.py
import pytest
from unittest.mock import Mock

@pytest.fixture
def sample_product():
    """Fixture com produto de exemplo"""
    from src.models.product import Product
    from decimal import Decimal
    
    return Product(
        id=1,
        name="Produto Teste",
        price=Decimal('19.99'),
        sku="TEST123"
    )

@pytest.fixture
def mock_config():
    """Mock das configurações"""
    return {
        'api': {
            'base_url': 'http://localhost:3000',
            'timeout': 30
        },
        'database': {
            'local_db': ':memory:'
        }
    }
```

## 🔄 Workflow de Desenvolvimento

### Branch Strategy

```bash
# Feature branch
git checkout -b feature/nova-funcionalidade

# Bug fix
git checkout -b bugfix/corrigir-erro

# Hot fix
git checkout -b hotfix/erro-critico
```

### Commit Convention

Seguimos [Conventional Commits](https://conventionalcommits.org/):

```bash
# Formato
<type>[optional scope]: <description>

# Exemplos
feat(api): adicionar endpoint de produtos
fix(equipment): corrigir conexão com balança Toledo
docs(readme): atualizar instruções de instalação
test(services): adicionar testes para ProductService
refactor(database): otimizar queries de produtos
```

### Pull Request Process

1. **Criar branch** da `main`
2. **Implementar** funcionalidade
3. **Escrever testes**
4. **Verificar qualidade**:
   ```bash
   black --check src/
   flake8 src/
   mypy src/
   pytest
   ```
5. **Commit** seguindo convenções
6. **Push** e criar PR
7. **Review** por outro desenvolvedor
8. **Merge** após aprovação

## 🚀 Deploy e Release

### Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- `MAJOR.MINOR.PATCH`
- `2.1.0` → `2.1.1` (patch: bug fix)
- `2.1.1` → `2.2.0` (minor: nova funcionalidade)
- `2.2.0` → `3.0.0` (major: breaking change)

### Release Process

1. **Atualizar versão** em `src/__init__.py` e `pyproject.toml`
2. **Atualizar CHANGELOG.md**
3. **Criar tag**:
   ```bash
   git tag -a v2.1.0 -m "Release version 2.1.0"
   git push origin v2.1.0
   ```
4. **Criar release** no GitHub
5. **Deploy** se automatizado

## 🐛 Debug e Profiling

### Logging para Debug

```python
# Ativar logs detalhados
import logging
logging.basicConfig(level=logging.DEBUG)

# Logger específico
logger = logging.getLogger('src.services.product_service')
logger.setLevel(logging.DEBUG)
```

### Profiling de Performance

```python
# Decorador para medir tempo
from src.utils.helpers import measure_time

@measure_time
def slow_function():
    # Código lento
    pass
```

### Debugging com VSCode

`.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Main",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/src/main.py",
            "console": "integratedTerminal",
            "cwd": "${workspaceFolder}"
        }
    ]
}
```

## 📚 Documentação

### Docstrings

```python
def complex_function(param1: str, param2: Optional[int] = None) -> Dict[str, Any]:
    """
    Função complexa que faz algo importante
    
    Args:
        param1: Descrição do primeiro parâmetro
        param2: Parâmetro opcional com valor padrão
        
    Returns:
        Dicionário com resultado da operação
        
    Raises:
        ValueError: Quando param1 está vazio
        TypeError: Quando param2 não é inteiro
        
    Example:
        >>> result = complex_function("test", 42)
        >>> print(result['status'])
        'success'
    """
    pass
```

### README dos Módulos

Cada pacote deve ter documentação explicando:
- Propósito do módulo
- Classes principais
- Exemplos de uso
- Dependências específicas

## 🤝 Contribuição

### Reportar Bugs

1. **Verificar** se já existe issue similar
2. **Usar template** de bug report
3. **Incluir**:
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Logs relevantes
   - Versão do sistema

### Sugerir Funcionalidades

1. **Discutir** no issue primeiro
2. **Detalhar** caso de uso
3. **Considerar** impacto na arquitetura
4. **Propor** implementação se possível

### Code Review

#### Para Reviewer

- ✅ Funcionalidade atende requisito
- ✅ Código segue padrões
- ✅ Testes adequados incluídos
- ✅ Documentação atualizada
- ✅ Performance não degradada
- ✅ Segurança considerada

#### Para Autor

- 📝 Descrição clara do PR
- 🧪 Testes passando
- 📋 Checklist preenchido
- 💬 Responder comentários
- 🔄 Aplicar mudanças solicitadas

---

Este guia garante código de qualidade e desenvolvimento colaborativo eficiente! 🚀