"""
Modelos de Venda
"""

from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from enum import Enum
from pydantic import Field, validator
from .base import BaseModel


class PaymentMethod(str, Enum):
    """Métodos de pagamento disponíveis"""
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PIX = "pix"
    CHECK = "check"
    STORE_CREDIT = "store_credit"


class SaleStatus(str, Enum):
    """Status da venda"""
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class SaleItem(BaseModel):
    """
    Item de uma venda
    
    Representa um produto/serviço vendido com quantidade,
    preço e detalhes específicos da transação
    """
    
    product_id: int = Field(..., description="ID do produto")
    product_name: str = Field(..., description="Nome do produto no momento da venda")
    product_sku: Optional[str] = Field(None, description="SKU do produto")
    
    quantity: int = Field(..., description="Quantidade vendida", gt=0)
    weight: Optional[Decimal] = Field(None, description="Peso para produtos por peso", ge=0)
    
    unit_price: Decimal = Field(..., description="Preço unitário", ge=0)
    total_price: Decimal = Field(..., description="Preço total do item", ge=0)
    
    discount_amount: Decimal = Field(0, description="Valor de desconto", ge=0)
    discount_percentage: Optional[Decimal] = Field(None, description="Percentual de desconto", ge=0, le=100)
    
    # Impostos
    tax_rate: Optional[Decimal] = Field(None, description="Taxa de imposto (%)", ge=0, le=100)
    tax_amount: Optional[Decimal] = Field(None, description="Valor do imposto", ge=0)
    
    @validator('total_price')
    def validate_total_price(cls, v, values):
        """Valida se o preço total está correto"""
        if 'unit_price' in values and 'quantity' in values:
            expected = values['unit_price'] * values['quantity']
            if 'weight' in values and values['weight']:
                expected = values['unit_price'] * values['weight']
            
            # Considera desconto
            if 'discount_amount' in values:
                expected -= values['discount_amount']
                
            # Pequena margem para erros de arredondamento
            if abs(v - expected) > Decimal('0.01'):
                raise ValueError('Preço total inconsistente com quantidade/peso e preço unitário')
        return v
    
    @property
    def final_price(self) -> Decimal:
        """Preço final após descontos e impostos"""
        price = self.total_price - self.discount_amount
        if self.tax_amount:
            price += self.tax_amount
        return price


class Sale(BaseModel):
    """
    Modelo de Venda
    
    Representa uma transação completa com todos os itens,
    pagamentos e informações relacionadas
    """
    
    # Identificação
    sale_number: Optional[str] = Field(None, description="Número da venda")
    
    # Cliente (opcional)
    customer_id: Optional[int] = Field(None, description="ID do cliente")
    customer_name: Optional[str] = Field(None, description="Nome do cliente")
    customer_document: Optional[str] = Field(None, description="Documento do cliente")
    
    # Itens da venda
    items: List[SaleItem] = Field([], description="Itens da venda")
    
    # Valores
    subtotal: Decimal = Field(0, description="Subtotal (sem desconto)", ge=0)
    discount_amount: Decimal = Field(0, description="Valor total de desconto", ge=0)
    discount_percentage: Optional[Decimal] = Field(None, description="Percentual de desconto geral", ge=0, le=100)
    tax_amount: Decimal = Field(0, description="Valor total de impostos", ge=0)
    total_amount: Decimal = Field(0, description="Valor total da venda", ge=0)
    
    # Pagamento
    payment_method: PaymentMethod = Field(..., description="Método de pagamento")
    amount_paid: Decimal = Field(0, description="Valor pago", ge=0)
    change_amount: Decimal = Field(0, description="Troco", ge=0)
    
    # Status e controle
    status: SaleStatus = Field(SaleStatus.PENDING, description="Status da venda")
    
    # Metadados
    cashier_session_id: Optional[int] = Field(None, description="ID da sessão de caixa")
    user_id: Optional[int] = Field(None, description="ID do usuário/vendedor")
    user_name: Optional[str] = Field(None, description="Nome do vendedor")
    
    # Dados fiscais
    fiscal_document_number: Optional[str] = Field(None, description="Número documento fiscal")
    fiscal_document_type: Optional[str] = Field(None, description="Tipo documento fiscal")
    
    # Observações
    notes: Optional[str] = Field(None, description="Observações da venda")
    
    # Sincronização
    synced: bool = Field(False, description="Sincronizada com servidor")
    sync_error: Optional[str] = Field(None, description="Erro de sincronização")
    
    @validator('items')
    def validate_items(cls, v):
        """Valida se há itens na venda"""
        if not v:
            raise ValueError('Venda deve ter pelo menos um item')
        return v
    
    @validator('amount_paid')
    def validate_amount_paid(cls, v, values):
        """Valida se o valor pago é suficiente"""
        if 'total_amount' in values and v < values['total_amount']:
            # Permite margem pequena para diferenças de arredondamento
            if values['total_amount'] - v > Decimal('0.01'):
                raise ValueError('Valor pago insuficiente')
        return v
    
    def calculate_totals(self) -> None:
        """
        Calcula os totais da venda baseado nos itens
        """
        self.subtotal = sum(item.total_price for item in self.items)
        self.discount_amount = sum(item.discount_amount for item in self.items)
        self.tax_amount = sum(item.tax_amount or 0 for item in self.items)
        
        # Aplica desconto geral se definido
        if self.discount_percentage:
            additional_discount = (self.subtotal * self.discount_percentage) / 100
            self.discount_amount += additional_discount
        
        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount
        
        # Calcula troco
        if self.amount_paid > self.total_amount:
            self.change_amount = self.amount_paid - self.total_amount
        else:
            self.change_amount = Decimal(0)
    
    def add_item(self, item: SaleItem) -> None:
        """
        Adiciona um item à venda
        
        Args:
            item: Item a ser adicionado
        """
        self.items.append(item)
        self.calculate_totals()
    
    def remove_item(self, index: int) -> None:
        """
        Remove um item da venda
        
        Args:
            index: Índice do item a ser removido
        """
        if 0 <= index < len(self.items):
            self.items.pop(index)
            self.calculate_totals()
    
    def clear_items(self) -> None:
        """Remove todos os itens da venda"""
        self.items = []
        self.calculate_totals()
    
    def apply_discount(self, percentage: Decimal) -> None:
        """
        Aplica desconto geral na venda
        
        Args:
            percentage: Percentual de desconto (0-100)
        """
        if 0 <= percentage <= 100:
            self.discount_percentage = percentage
            self.calculate_totals()
    
    def can_complete(self) -> bool:
        """
        Verifica se a venda pode ser finalizada
        
        Returns:
            True se pode finalizar, False caso contrário
        """
        return (
            len(self.items) > 0 and
            self.total_amount > 0 and
            self.amount_paid >= self.total_amount and
            self.status == SaleStatus.PENDING
        )
    
    def complete(self) -> None:
        """
        Finaliza a venda
        """
        if self.can_complete():
            self.status = SaleStatus.COMPLETED
    
    def cancel(self) -> None:
        """
        Cancela a venda
        """
        self.status = SaleStatus.CANCELLED
    
    @property
    def item_count(self) -> int:
        """Número total de itens (somando quantidades)"""
        return sum(item.quantity for item in self.items)
    
    @property
    def is_cash_sale(self) -> bool:
        """Verifica se é venda à vista"""
        return self.payment_method == PaymentMethod.CASH