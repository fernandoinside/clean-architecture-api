"""
Modelo de Usuário
"""

from typing import Optional, List
from pydantic import Field, EmailStr
from .base import BaseModel


class User(BaseModel):
    """
    Modelo de Usuário
    
    Representa um usuário do sistema com suas permissões
    e informações básicas
    """
    
    name: str = Field(..., description="Nome completo do usuário", min_length=1, max_length=255)
    email: EmailStr = Field(..., description="Email do usuário")
    username: Optional[str] = Field(None, description="Nome de usuário", max_length=50)
    
    # Status
    is_active: bool = Field(True, description="Usuário ativo")
    is_admin: bool = Field(False, description="Usuário administrador")
    
    # Permissões específicas
    can_sell: bool = Field(True, description="Pode realizar vendas")
    can_cancel_sale: bool = Field(False, description="Pode cancelar vendas")
    can_apply_discount: bool = Field(True, description="Pode aplicar descontos")
    can_open_cashier: bool = Field(True, description="Pode abrir caixa")
    can_close_cashier: bool = Field(False, description="Pode fechar caixa")
    can_view_reports: bool = Field(False, description="Pode visualizar relatórios")
    can_manage_products: bool = Field(False, description="Pode gerenciar produtos")
    can_manage_customers: bool = Field(False, description="Pode gerenciar clientes")
    
    # Configurações pessoais
    max_discount_percent: Optional[float] = Field(None, description="Desconto máximo permitido (%)", ge=0, le=100)
    
    # Metadados
    last_login_at: Optional[str] = Field(None, description="Último login")
    
    @property
    def display_name(self) -> str:
        """Nome para exibição"""
        return self.name
    
    def has_permission(self, permission: str) -> bool:
        """
        Verifica se o usuário tem uma permissão específica
        
        Args:
            permission: Nome da permissão
            
        Returns:
            True se tem a permissão, False caso contrário
        """
        if self.is_admin:
            return True
            
        return getattr(self, f"can_{permission}", False)
    
    def can_apply_discount_percent(self, percent: float) -> bool:
        """
        Verifica se pode aplicar desconto de determinado percentual
        
        Args:
            percent: Percentual do desconto
            
        Returns:
            True se pode aplicar, False caso contrário
        """
        if not self.can_apply_discount:
            return False
            
        if self.is_admin:
            return True
            
        if self.max_discount_percent is None:
            return True
            
        return percent <= self.max_discount_percent


class Company(BaseModel):
    """
    Modelo de Empresa
    
    Representa uma empresa/filial no sistema
    """
    
    name: str = Field(..., description="Nome da empresa", min_length=1, max_length=255)
    trade_name: Optional[str] = Field(None, description="Nome fantasia", max_length=255)
    
    # Documentos
    document: str = Field(..., description="CNPJ da empresa", min_length=14, max_length=18)
    state_registration: Optional[str] = Field(None, description="Inscrição estadual")
    municipal_registration: Optional[str] = Field(None, description="Inscrição municipal")
    
    # Contato
    email: Optional[EmailStr] = Field(None, description="Email da empresa")
    phone: Optional[str] = Field(None, description="Telefone")
    website: Optional[str] = Field(None, description="Website")
    
    # Endereço
    address: Optional[str] = Field(None, description="Endereço")
    city: Optional[str] = Field(None, description="Cidade")
    state: Optional[str] = Field(None, description="Estado/UF")
    zip_code: Optional[str] = Field(None, description="CEP")
    
    # Status
    is_active: bool = Field(True, description="Empresa ativa")
    is_matrix: bool = Field(False, description="É matriz")
    
    @property
    def formatted_document(self) -> str:
        """Retorna CNPJ formatado"""
        if len(self.document) == 14:
            return f"{self.document[:2]}.{self.document[2:5]}.{self.document[5:8]}/{self.document[8:12]}-{self.document[12:]}"
        return self.document
    
    @property
    def display_name(self) -> str:
        """Nome para exibição"""
        if self.trade_name:
            return self.trade_name
        return self.name