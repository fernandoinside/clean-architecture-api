"""
Modelo de Empresa - arquivo separado para melhor organização
"""

from typing import Optional
from pydantic import Field, EmailStr
from .base import BaseModel


class Company(BaseModel):
    """
    Modelo de Empresa
    
    Representa uma empresa/filial no sistema com todas
    as informações fiscais e comerciais necessárias
    """
    
    name: str = Field(..., description="Razão social da empresa", min_length=1, max_length=255)
    trade_name: Optional[str] = Field(None, description="Nome fantasia", max_length=255)
    
    # Documentos fiscais
    document: str = Field(..., description="CNPJ da empresa", min_length=14, max_length=18)
    state_registration: Optional[str] = Field(None, description="Inscrição estadual")
    municipal_registration: Optional[str] = Field(None, description="Inscrição municipal")
    
    # Contato
    email: Optional[EmailStr] = Field(None, description="Email da empresa")
    phone: Optional[str] = Field(None, description="Telefone principal")
    phone_secondary: Optional[str] = Field(None, description="Telefone secundário")
    website: Optional[str] = Field(None, description="Website")
    
    # Endereço principal
    address: Optional[str] = Field(None, description="Endereço completo")
    address_number: Optional[str] = Field(None, description="Número")
    address_complement: Optional[str] = Field(None, description="Complemento")
    neighborhood: Optional[str] = Field(None, description="Bairro")
    city: Optional[str] = Field(None, description="Cidade")
    state: Optional[str] = Field(None, description="Estado/UF", max_length=2)
    zip_code: Optional[str] = Field(None, description="CEP")
    
    # Configurações empresariais
    is_active: bool = Field(True, description="Empresa ativa")
    is_matrix: bool = Field(False, description="É matriz/sede")
    
    # Configurações fiscais
    fiscal_regime: Optional[str] = Field(None, description="Regime fiscal (Simples, Lucro Real, etc)")
    icms_tax_rate: Optional[float] = Field(None, description="Alíquota ICMS padrão", ge=0, le=100)
    
    # Configurações de funcionamento
    business_hours_start: Optional[str] = Field(None, description="Horário abertura (HH:MM)")
    business_hours_end: Optional[str] = Field(None, description="Horário fechamento (HH:MM)")
    
    # Logo e branding
    logo_url: Optional[str] = Field(None, description="URL do logo")
    primary_color: Optional[str] = Field(None, description="Cor primária (hex)")
    secondary_color: Optional[str] = Field(None, description="Cor secundária (hex)")
    
    @property
    def formatted_document(self) -> str:
        """Retorna CNPJ formatado"""
        if len(self.document) == 14:
            return f"{self.document[:2]}.{self.document[2:5]}.{self.document[5:8]}/{self.document[8:12]}-{self.document[12:]}"
        return self.document
    
    @property
    def display_name(self) -> str:
        """Nome para exibição (prioriza nome fantasia)"""
        if self.trade_name:
            return self.trade_name
        return self.name
    
    @property
    def full_address(self) -> str:
        """Endereço completo formatado"""
        parts = []
        
        if self.address:
            parts.append(self.address)
            
        if self.address_number:
            parts.append(f"nº {self.address_number}")
            
        if self.address_complement:
            parts.append(self.address_complement)
            
        if self.neighborhood:
            parts.append(f"Bairro: {self.neighborhood}")
            
        if self.city and self.state:
            parts.append(f"{self.city}/{self.state}")
            
        if self.zip_code:
            parts.append(f"CEP: {self.zip_code}")
            
        return " - ".join(parts) if parts else ""
    
    @property
    def formatted_phone(self) -> Optional[str]:
        """Telefone formatado"""
        if not self.phone:
            return None
            
        digits = ''.join(filter(str.isdigit, self.phone))
        
        if len(digits) == 11:  # Celular
            return f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
        elif len(digits) == 10:  # Fixo
            return f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"
        
        return self.phone
    
    def is_open_now(self) -> bool:
        """
        Verifica se a empresa está aberta no horário atual
        
        Returns:
            True se está aberta, False caso contrário
        """
        if not self.business_hours_start or not self.business_hours_end:
            return True  # Assume sempre aberta se não há horário definido
            
        from datetime import datetime, time
        
        try:
            start_time = datetime.strptime(self.business_hours_start, "%H:%M").time()
            end_time = datetime.strptime(self.business_hours_end, "%H:%M").time()
            current_time = datetime.now().time()
            
            if start_time <= end_time:
                # Horário normal (ex: 08:00 às 18:00)
                return start_time <= current_time <= end_time
            else:
                # Horário que passa da meia-noite (ex: 18:00 às 02:00)
                return current_time >= start_time or current_time <= end_time
                
        except ValueError:
            # Erro no formato do horário
            return True