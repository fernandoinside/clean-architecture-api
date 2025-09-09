"""
Modelo de Sessão de Caixa
"""

from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum
from pydantic import Field, validator
from .base import BaseModel


class SessionStatus(str, Enum):
    """Status da sessão de caixa"""
    OPEN = "open"
    CLOSED = "closed"
    SUSPENDED = "suspended"


class CashierSession(BaseModel):
    """
    Modelo de Sessão de Caixa
    
    Representa uma sessão de trabalho de um operador de caixa,
    controlando abertura, fechamento e movimentações
    """
    
    # Identificação
    session_number: Optional[str] = Field(None, description="Número da sessão")
    
    # Usuário e local
    user_id: int = Field(..., description="ID do usuário/operador")
    user_name: Optional[str] = Field(None, description="Nome do operador")
    terminal_id: Optional[str] = Field(None, description="ID do terminal/caixa")
    
    # Timestamps
    opened_at: datetime = Field(default_factory=datetime.now, description="Data/hora de abertura")
    closed_at: Optional[datetime] = Field(None, description="Data/hora de fechamento")
    
    # Valores iniciais
    opening_cash: Decimal = Field(..., description="Dinheiro inicial no caixa", ge=0)
    
    # Movimentações durante a sessão
    total_sales: Decimal = Field(0, description="Total de vendas", ge=0)
    total_cash_sales: Decimal = Field(0, description="Total vendas em dinheiro", ge=0)
    total_card_sales: Decimal = Field(0, description="Total vendas no cartão", ge=0)
    total_pix_sales: Decimal = Field(0, description="Total vendas PIX", ge=0)
    total_other_sales: Decimal = Field(0, description="Outras formas de pagamento", ge=0)
    
    # Número de transações
    sales_count: int = Field(0, description="Número de vendas", ge=0)
    cancelled_sales_count: int = Field(0, description="Vendas canceladas", ge=0)
    
    # Valores de fechamento
    closing_cash: Optional[Decimal] = Field(None, description="Dinheiro final declarado", ge=0)
    expected_cash: Optional[Decimal] = Field(None, description="Dinheiro esperado", ge=0)
    cash_difference: Optional[Decimal] = Field(None, description="Diferença no dinheiro")
    
    # Status
    status: SessionStatus = Field(SessionStatus.OPEN, description="Status da sessão")
    
    # Observações
    opening_notes: Optional[str] = Field(None, description="Observações da abertura")
    closing_notes: Optional[str] = Field(None, description="Observações do fechamento")
    
    # Sincronização
    synced: bool = Field(False, description="Sincronizada com servidor")
    sync_error: Optional[str] = Field(None, description="Erro de sincronização")
    
    @validator('closing_cash')
    def validate_closing_cash(cls, v, values):
        """Valida valor de fechamento apenas para sessões fechadas"""
        status = values.get('status')
        if status == SessionStatus.CLOSED and v is None:
            raise ValueError('Sessão fechada deve ter valor de fechamento')
        return v
    
    @validator('closed_at')
    def validate_closed_at(cls, v, values):
        """Valida data de fechamento"""
        if v and 'opened_at' in values and v <= values['opened_at']:
            raise ValueError('Data de fechamento deve ser posterior à abertura')
        return v
    
    def calculate_expected_cash(self) -> Decimal:
        """
        Calcula o dinheiro esperado no caixa
        
        Returns:
            Valor esperado baseado em abertura + vendas em dinheiro
        """
        return self.opening_cash + self.total_cash_sales
    
    def calculate_difference(self) -> Optional[Decimal]:
        """
        Calcula a diferença entre esperado e declarado
        
        Returns:
            Diferença (positiva = sobra, negativa = falta)
        """
        if self.closing_cash is not None:
            expected = self.calculate_expected_cash()
            return self.closing_cash - expected
        return None
    
    def add_sale(self, amount: Decimal, payment_method: str) -> None:
        """
        Registra uma venda na sessão
        
        Args:
            amount: Valor da venda
            payment_method: Método de pagamento
        """
        self.total_sales += amount
        self.sales_count += 1
        
        # Distribui por método de pagamento
        if payment_method.lower() == 'cash':
            self.total_cash_sales += amount
        elif payment_method.lower() in ['credit_card', 'debit_card']:
            self.total_card_sales += amount
        elif payment_method.lower() == 'pix':
            self.total_pix_sales += amount
        else:
            self.total_other_sales += amount
    
    def cancel_sale(self, amount: Decimal, payment_method: str) -> None:
        """
        Registra cancelamento de venda
        
        Args:
            amount: Valor da venda cancelada
            payment_method: Método de pagamento original
        """
        self.total_sales -= amount
        self.sales_count -= 1
        self.cancelled_sales_count += 1
        
        # Remove do método de pagamento correspondente
        if payment_method.lower() == 'cash':
            self.total_cash_sales -= amount
        elif payment_method.lower() in ['credit_card', 'debit_card']:
            self.total_card_sales -= amount
        elif payment_method.lower() == 'pix':
            self.total_pix_sales -= amount
        else:
            self.total_other_sales -= amount
    
    def can_close(self) -> bool:
        """
        Verifica se a sessão pode ser fechada
        
        Returns:
            True se pode fechar, False caso contrário
        """
        return self.status == SessionStatus.OPEN
    
    def close_session(self, closing_cash: Decimal, notes: Optional[str] = None) -> None:
        """
        Fecha a sessão de caixa
        
        Args:
            closing_cash: Valor final em dinheiro
            notes: Observações do fechamento
        """
        if not self.can_close():
            raise ValueError("Sessão não pode ser fechada no status atual")
        
        self.closing_cash = closing_cash
        self.expected_cash = self.calculate_expected_cash()
        self.cash_difference = self.calculate_difference()
        self.closed_at = datetime.now()
        self.closing_notes = notes
        self.status = SessionStatus.CLOSED
    
    def suspend_session(self, notes: Optional[str] = None) -> None:
        """
        Suspende a sessão temporariamente
        
        Args:
            notes: Motivo da suspensão
        """
        if self.status == SessionStatus.OPEN:
            self.status = SessionStatus.SUSPENDED
            if notes:
                self.closing_notes = notes
    
    def resume_session(self) -> None:
        """
        Resume uma sessão suspensa
        """
        if self.status == SessionStatus.SUSPENDED:
            self.status = SessionStatus.OPEN
    
    @property
    def duration_minutes(self) -> Optional[int]:
        """Duração da sessão em minutos"""
        if self.closed_at:
            delta = self.closed_at - self.opened_at
            return int(delta.total_seconds() / 60)
        else:
            delta = datetime.now() - self.opened_at
            return int(delta.total_seconds() / 60)
    
    @property
    def average_sale_value(self) -> Decimal:
        """Valor médio por venda"""
        if self.sales_count > 0:
            return self.total_sales / self.sales_count
        return Decimal(0)
    
    @property
    def is_open(self) -> bool:
        """Verifica se a sessão está aberta"""
        return self.status == SessionStatus.OPEN
    
    @property
    def has_difference(self) -> bool:
        """Verifica se há diferença no fechamento"""
        return self.cash_difference is not None and abs(self.cash_difference) > Decimal('0.01')
    
    @property
    def difference_description(self) -> Optional[str]:
        """Descrição da diferença no fechamento"""
        if self.cash_difference is None:
            return None
        
        if abs(self.cash_difference) <= Decimal('0.01'):
            return "Fechamento correto"
        elif self.cash_difference > 0:
            return f"Sobra de R$ {self.cash_difference:.2f}"
        else:
            return f"Falta de R$ {abs(self.cash_difference):.2f}"