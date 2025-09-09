"""
Modelo de Produto
"""

from typing import Optional, List, Dict, Any
from decimal import Decimal
from pydantic import Field, validator
from .base import BaseModel


class Product(BaseModel):
    """
    Modelo de Produto
    
    Representa um produto no sistema com todas suas informações
    incluindo preços, estoque, códigos e metadados
    """
    
    name: str = Field(..., description="Nome do produto", min_length=1, max_length=255)
    description: Optional[str] = Field(None, description="Descrição detalhada do produto")
    sku: Optional[str] = Field(None, description="SKU do produto", max_length=50)
    barcode: Optional[str] = Field(None, description="Código de barras", max_length=50)
    
    # Preços
    price: Decimal = Field(..., description="Preço de venda", ge=0)
    cost: Optional[Decimal] = Field(None, description="Custo do produto", ge=0)
    wholesale_price: Optional[Decimal] = Field(None, description="Preço atacado", ge=0)
    
    # Estoque
    stock_quantity: int = Field(0, description="Quantidade em estoque", ge=0)
    min_stock: Optional[int] = Field(None, description="Estoque mínimo", ge=0)
    max_stock: Optional[int] = Field(None, description="Estoque máximo", ge=0)
    
    # Categorização
    category_id: Optional[int] = Field(None, description="ID da categoria")
    category_name: Optional[str] = Field(None, description="Nome da categoria")
    brand: Optional[str] = Field(None, description="Marca do produto", max_length=100)
    
    # Características físicas
    weight: Optional[Decimal] = Field(None, description="Peso em kg", ge=0)
    requires_weighing: bool = Field(False, description="Produto vendido por peso")
    
    # Status e configurações
    is_active: bool = Field(True, description="Produto ativo")
    is_service: bool = Field(False, description="É um serviço")
    has_variants: bool = Field(False, description="Possui variações")
    
    # Impostos
    tax_rate: Optional[Decimal] = Field(None, description="Taxa de imposto (%)", ge=0, le=100)
    
    # Metadados
    image_url: Optional[str] = Field(None, description="URL da imagem do produto")
    notes: Optional[str] = Field(None, description="Observações")
    
    # Campos específicos para PDV
    last_sold_at: Optional[str] = Field(None, description="Última venda")
    times_sold: int = Field(0, description="Quantas vezes foi vendido", ge=0)
    
    @validator('price', 'cost', 'wholesale_price', 'weight', 'tax_rate')
    def validate_decimals(cls, v):
        """Valida campos decimais"""
        if v is not None and v < 0:
            raise ValueError('Valor não pode ser negativo')
        return v
    
    @validator('sku', 'barcode')
    def validate_codes(cls, v):
        """Valida códigos únicos"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v
    
    @property
    def formatted_price(self) -> str:
        """Retorna o preço formatado como string"""
        return f"R$ {self.price:.2f}"
    
    @property
    def profit_margin(self) -> Optional[Decimal]:
        """Calcula a margem de lucro"""
        if self.cost and self.cost > 0:
            return ((self.price - self.cost) / self.cost) * 100
        return None
    
    @property
    def is_low_stock(self) -> bool:
        """Verifica se está com estoque baixo"""
        if self.min_stock:
            return self.stock_quantity <= self.min_stock
        return self.stock_quantity == 0
    
    @property
    def display_name(self) -> str:
        """Nome para exibição (inclui SKU se disponível)"""
        if self.sku:
            return f"{self.name} ({self.sku})"
        return self.name
    
    def matches_search(self, query: str) -> bool:
        """
        Verifica se o produto corresponde à busca
        
        Args:
            query: Termo de busca
            
        Returns:
            True se corresponde, False caso contrário
        """
        if not query:
            return True
            
        query = query.lower().strip()
        
        # Busca no nome
        if query in self.name.lower():
            return True
            
        # Busca no SKU
        if self.sku and query in self.sku.lower():
            return True
            
        # Busca no código de barras
        if self.barcode and query in self.barcode.lower():
            return True
            
        # Busca na descrição
        if self.description and query in self.description.lower():
            return True
            
        return False
    
    def can_sell_quantity(self, quantity: int) -> bool:
        """
        Verifica se é possível vender a quantidade solicitada
        
        Args:
            quantity: Quantidade solicitada
            
        Returns:
            True se pode vender, False caso contrário
        """
        if not self.is_active:
            return False
            
        # Produtos por peso sempre podem ser vendidos
        if self.requires_weighing:
            return True
            
        # Verifica estoque disponível
        return self.stock_quantity >= quantity
    
    def calculate_total(self, quantity: int, weight: Optional[Decimal] = None) -> Decimal:
        """
        Calcula o total para venda
        
        Args:
            quantity: Quantidade
            weight: Peso (para produtos por peso)
            
        Returns:
            Valor total
        """
        if self.requires_weighing and weight:
            return self.price * weight
        else:
            return self.price * Decimal(quantity)