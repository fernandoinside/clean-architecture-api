"""
Modelo de Cliente
"""

from typing import Optional
from pydantic import Field, EmailStr, validator
from .base import BaseModel


class Customer(BaseModel):
    """
    Modelo de Cliente
    
    Representa um cliente no sistema com suas informações
    pessoais e de contato
    """
    
    name: str = Field(..., description="Nome completo do cliente", min_length=1, max_length=255)
    email: Optional[EmailStr] = Field(None, description="Email do cliente")
    phone: Optional[str] = Field(None, description="Telefone do cliente", max_length=20)
    
    # Documentos
    document: Optional[str] = Field(None, description="CPF ou CNPJ", max_length=20)
    document_type: Optional[str] = Field(None, description="Tipo do documento (CPF/CNPJ)")
    
    # Endereço
    address: Optional[str] = Field(None, description="Endereço completo")
    city: Optional[str] = Field(None, description="Cidade", max_length=100)
    state: Optional[str] = Field(None, description="Estado/UF", max_length=2)
    zip_code: Optional[str] = Field(None, description="CEP", max_length=10)
    
    # Status
    is_active: bool = Field(True, description="Cliente ativo")
    is_vip: bool = Field(False, description="Cliente VIP")
    
    # Configurações comerciais
    discount_rate: Optional[float] = Field(None, description="Desconto padrão (%)", ge=0, le=100)
    credit_limit: Optional[float] = Field(None, description="Limite de crédito", ge=0)
    
    # Metadados
    notes: Optional[str] = Field(None, description="Observações sobre o cliente")
    last_purchase_at: Optional[str] = Field(None, description="Última compra")
    total_purchases: float = Field(0, description="Total em compras", ge=0)
    purchases_count: int = Field(0, description="Número de compras", ge=0)
    
    @validator('document')
    def validate_document(cls, v):
        """Valida CPF/CNPJ"""
        if v is not None:
            # Remove caracteres especiais
            v = ''.join(filter(str.isdigit, v))
            if len(v) not in [11, 14]:
                raise ValueError('Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        """Valida telefone"""
        if v is not None:
            # Remove caracteres especiais
            digits = ''.join(filter(str.isdigit, v))
            if len(digits) < 10:
                raise ValueError('Telefone deve ter pelo menos 10 dígitos')
        return v
    
    @validator('state')
    def validate_state(cls, v):
        """Valida UF do estado"""
        if v is not None:
            v = v.upper().strip()
            if len(v) != 2:
                raise ValueError('Estado deve ter 2 caracteres (UF)')
        return v
    
    @property
    def formatted_document(self) -> Optional[str]:
        """Retorna documento formatado"""
        if not self.document:
            return None
            
        if len(self.document) == 11:  # CPF
            return f"{self.document[:3]}.{self.document[3:6]}.{self.document[6:9]}-{self.document[9:]}"
        elif len(self.document) == 14:  # CNPJ
            return f"{self.document[:2]}.{self.document[2:5]}.{self.document[5:8]}/{self.document[8:12]}-{self.document[12:]}"
        
        return self.document
    
    @property
    def formatted_phone(self) -> Optional[str]:
        """Retorna telefone formatado"""
        if not self.phone:
            return None
            
        digits = ''.join(filter(str.isdigit, self.phone))
        
        if len(digits) == 11:  # Celular
            return f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
        elif len(digits) == 10:  # Fixo
            return f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"
        
        return self.phone
    
    @property
    def display_name(self) -> str:
        """Nome para exibição"""
        if self.document:
            return f"{self.name} ({self.formatted_document})"
        return self.name
    
    @property
    def is_corporate(self) -> bool:
        """Verifica se é pessoa jurídica"""
        return self.document and len(self.document) == 14
    
    @property
    def average_purchase(self) -> float:
        """Valor médio de compra"""
        if self.purchases_count > 0:
            return self.total_purchases / self.purchases_count
        return 0.0
    
    def matches_search(self, query: str) -> bool:
        """
        Verifica se o cliente corresponde à busca
        
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
            
        # Busca no documento
        if self.document:
            # Remove formatação para busca
            doc_digits = ''.join(filter(str.isdigit, self.document))
            query_digits = ''.join(filter(str.isdigit, query))
            if query_digits in doc_digits:
                return True
            
        # Busca no email
        if self.email and query in self.email.lower():
            return True
            
        # Busca no telefone
        if self.phone:
            phone_digits = ''.join(filter(str.isdigit, self.phone))
            query_digits = ''.join(filter(str.isdigit, query))
            if query_digits in phone_digits:
                return True
            
        return False
    
    def can_purchase(self, amount: float) -> bool:
        """
        Verifica se o cliente pode fazer uma compra
        
        Args:
            amount: Valor da compra
            
        Returns:
            True se pode comprar, False caso contrário
        """
        if not self.is_active:
            return False
            
        # Verifica limite de crédito se definido
        if self.credit_limit:
            return amount <= self.credit_limit
            
        return True