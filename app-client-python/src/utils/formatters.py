"""
Utilitários para formatação de dados
"""

from decimal import Decimal
from typing import Optional


def format_currency(value: float | Decimal, symbol: str = "R$") -> str:
    """
    Formata valor monetário
    
    Args:
        value: Valor a formatar
        symbol: Símbolo da moeda
        
    Returns:
        String formatada
    """
    if value is None:
        return f"{symbol} 0,00"
    
    return f"{symbol} {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def format_phone(phone: str) -> Optional[str]:
    """
    Formata telefone brasileiro
    
    Args:
        phone: Telefone sem formatação
        
    Returns:
        Telefone formatado ou None
    """
    if not phone:
        return None
        
    digits = ''.join(filter(str.isdigit, phone))
    
    if len(digits) == 11:  # Celular
        return f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
    elif len(digits) == 10:  # Fixo
        return f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"
    
    return phone


def format_document(document: str) -> Optional[str]:
    """
    Formata CPF ou CNPJ
    
    Args:
        document: Documento sem formatação
        
    Returns:
        Documento formatado ou None
    """
    if not document:
        return None
        
    digits = ''.join(filter(str.isdigit, document))
    
    if len(digits) == 11:  # CPF
        return f"{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}"
    elif len(digits) == 14:  # CNPJ
        return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}/{digits[8:12]}-{digits[12:]}"
    
    return document


def format_cep(cep: str) -> Optional[str]:
    """
    Formata CEP brasileiro
    
    Args:
        cep: CEP sem formatação
        
    Returns:
        CEP formatado ou None
    """
    if not cep:
        return None
        
    digits = ''.join(filter(str.isdigit, cep))
    
    if len(digits) == 8:
        return f"{digits[:5]}-{digits[5:]}"
    
    return cep


def format_percentage(value: float | Decimal, decimals: int = 1) -> str:
    """
    Formata percentual
    
    Args:
        value: Valor percentual
        decimals: Número de casas decimais
        
    Returns:
        String formatada
    """
    if value is None:
        return "0%"
    
    return f"{value:.{decimals}f}%"


def format_weight(weight: float | Decimal, unit: str = "kg") -> str:
    """
    Formata peso
    
    Args:
        weight: Peso a formatar
        unit: Unidade (kg, g)
        
    Returns:
        String formatada
    """
    if weight is None:
        return f"0 {unit}"
    
    if unit == "kg":
        return f"{weight:.3f} kg"
    else:
        return f"{weight:.0f} g"


def truncate_string(text: str, max_length: int, suffix: str = "...") -> str:
    """
    Trunca string se necessário
    
    Args:
        text: Texto original
        max_length: Tamanho máximo
        suffix: Sufixo para indicar truncamento
        
    Returns:
        String truncada se necessário
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def format_file_size(size_bytes: int) -> str:
    """
    Formata tamanho de arquivo
    
    Args:
        size_bytes: Tamanho em bytes
        
    Returns:
        String formatada (ex: "1.5 MB")
    """
    if size_bytes == 0:
        return "0 B"
    
    sizes = ["B", "KB", "MB", "GB"]
    i = 0
    
    while size_bytes >= 1024 and i < len(sizes) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.1f} {sizes[i]}"


def format_duration(seconds: int) -> str:
    """
    Formata duração em formato legível
    
    Args:
        seconds: Duração em segundos
        
    Returns:
        String formatada (ex: "2h 30m")
    """
    if seconds < 60:
        return f"{seconds}s"
    
    minutes = seconds // 60
    seconds = seconds % 60
    
    if minutes < 60:
        if seconds > 0:
            return f"{minutes}m {seconds}s"
        return f"{minutes}m"
    
    hours = minutes // 60
    minutes = minutes % 60
    
    if minutes > 0:
        return f"{hours}h {minutes}m"
    return f"{hours}h"