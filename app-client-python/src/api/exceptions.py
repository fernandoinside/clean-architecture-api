"""
Exceções customizadas para a API
"""

from typing import Optional, Dict, Any


class APIError(Exception):
    """
    Exceção base para erros da API
    """
    
    def __init__(
        self, 
        message: str, 
        status_code: Optional[int] = None,
        response_data: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.response_data = response_data or {}
        super().__init__(self.message)
    
    def __str__(self) -> str:
        if self.status_code:
            return f"API Error {self.status_code}: {self.message}"
        return f"API Error: {self.message}"


class AuthenticationError(APIError):
    """
    Erro de autenticação (401, 403)
    """
    
    def __init__(self, message: str = "Falha na autenticação", **kwargs):
        super().__init__(message, **kwargs)


class NetworkError(APIError):
    """
    Erro de rede/conectividade
    """
    
    def __init__(self, message: str = "Erro de conectividade", **kwargs):
        super().__init__(message, **kwargs)


class ValidationError(APIError):
    """
    Erro de validação de dados (400, 422)
    """
    
    def __init__(self, message: str = "Dados inválidos", **kwargs):
        super().__init__(message, **kwargs)


class NotFoundError(APIError):
    """
    Recurso não encontrado (404)
    """
    
    def __init__(self, message: str = "Recurso não encontrado", **kwargs):
        super().__init__(message, **kwargs)


class ConflictError(APIError):
    """
    Conflito de dados (409)
    """
    
    def __init__(self, message: str = "Conflito de dados", **kwargs):
        super().__init__(message, **kwargs)


class ServerError(APIError):
    """
    Erro interno do servidor (500+)
    """
    
    def __init__(self, message: str = "Erro interno do servidor", **kwargs):
        super().__init__(message, **kwargs)


class TimeoutError(APIError):
    """
    Timeout na requisição
    """
    
    def __init__(self, message: str = "Timeout na requisição", **kwargs):
        super().__init__(message, **kwargs)