"""
Validadores de dados brasileiros
"""

import re
from typing import Optional


def validate_cpf(cpf: str) -> bool:
    """
    Valida CPF brasileiro
    
    Args:
        cpf: CPF a validar
        
    Returns:
        True se válido, False caso contrário
    """
    if not cpf:
        return False
    
    # Remove caracteres especiais
    cpf = ''.join(filter(str.isdigit, cpf))
    
    # Verifica se tem 11 dígitos
    if len(cpf) != 11:
        return False
    
    # Verifica se todos os dígitos são iguais
    if cpf == cpf[0] * 11:
        return False
    
    # Calcula primeiro dígito verificador
    sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digit1 = 11 - (sum1 % 11)
    if digit1 >= 10:
        digit1 = 0
    
    # Calcula segundo dígito verificador
    sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digit2 = 11 - (sum2 % 11)
    if digit2 >= 10:
        digit2 = 0
    
    # Verifica se os dígitos calculados conferem
    return cpf[-2:] == f"{digit1}{digit2}"


def validate_cnpj(cnpj: str) -> bool:
    """
    Valida CNPJ brasileiro
    
    Args:
        cnpj: CNPJ a validar
        
    Returns:
        True se válido, False caso contrário
    """
    if not cnpj:
        return False
    
    # Remove caracteres especiais
    cnpj = ''.join(filter(str.isdigit, cnpj))
    
    # Verifica se tem 14 dígitos
    if len(cnpj) != 14:
        return False
    
    # Verifica se todos os dígitos são iguais
    if cnpj == cnpj[0] * 14:
        return False
    
    # Calcula primeiro dígito verificador
    weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum1 = sum(int(cnpj[i]) * weights1[i] for i in range(12))
    digit1 = 11 - (sum1 % 11)
    if digit1 >= 10:
        digit1 = 0
    
    # Calcula segundo dígito verificador
    weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    sum2 = sum(int(cnpj[i]) * weights2[i] for i in range(13))
    digit2 = 11 - (sum2 % 11)
    if digit2 >= 10:
        digit2 = 0
    
    # Verifica se os dígitos calculados conferem
    return cnpj[-2:] == f"{digit1}{digit2}"


def validate_email(email: str) -> bool:
    """
    Valida email
    
    Args:
        email: Email a validar
        
    Returns:
        True se válido, False caso contrário
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    """
    Valida telefone brasileiro
    
    Args:
        phone: Telefone a validar
        
    Returns:
        True se válido, False caso contrário
    """
    if not phone:
        return False
    
    digits = ''.join(filter(str.isdigit, phone))
    return len(digits) in [10, 11]  # Fixo ou celular


def validate_cep(cep: str) -> bool:
    """
    Valida CEP brasileiro
    
    Args:
        cep: CEP a validar
        
    Returns:
        True se válido, False caso contrário
    """
    if not cep:
        return False
    
    digits = ''.join(filter(str.isdigit, cep))
    return len(digits) == 8


def validate_barcode(barcode: str) -> bool:
    """
    Valida código de barras (EAN-13 básico)
    
    Args:
        barcode: Código de barras a validar
        
    Returns:
        True se válido, False caso contrário
    """
    if not barcode:
        return False
    
    digits = ''.join(filter(str.isdigit, barcode))
    
    # Verifica comprimentos comuns
    if len(digits) not in [8, 12, 13, 14]:
        return False
    
    return True  # Validação básica, pode ser expandida


def validate_decimal(value: str, max_digits: int = 10, decimal_places: int = 2) -> bool:
    """
    Valida valor decimal
    
    Args:
        value: Valor a validar
        max_digits: Máximo de dígitos totais
        decimal_places: Casas decimais permitidas
        
    Returns:
        True se válido, False caso contrário
    """
    if not value:
        return False
    
    try:
        # Remove espaços
        value = value.strip()
        
        # Converte vírgula para ponto
        value = value.replace(',', '.')
        
        # Tenta converter para float
        float_value = float(value)
        
        # Verifica se é positivo
        if float_value < 0:
            return False
        
        # Verifica número de casas decimais
        if '.' in value:
            decimal_part = value.split('.')[1]
            if len(decimal_part) > decimal_places:
                return False
        
        # Verifica número total de dígitos
        total_digits = len(value.replace('.', ''))
        if total_digits > max_digits:
            return False
        
        return True
        
    except (ValueError, TypeError):
        return False


def validate_percentage(value: str) -> bool:
    """
    Valida percentual (0-100)
    
    Args:
        value: Valor percentual a validar
        
    Returns:
        True se válido, False caso contrário
    """
    try:
        value = value.strip().replace(',', '.')
        percent = float(value)
        return 0 <= percent <= 100
    except (ValueError, TypeError):
        return False