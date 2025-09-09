"""
API package - Cliente para comunicação com a API SRM Gestão
"""

from .client import APIClient
from .endpoints import ProductsAPI, CustomersAPI, SalesAPI, CashierSessionsAPI, AuthAPI
from .exceptions import APIError, AuthenticationError, NetworkError, ValidationError

__all__ = [
    "APIClient",
    "ProductsAPI",
    "CustomersAPI", 
    "SalesAPI",
    "CashierSessionsAPI",
    "AuthAPI",
    "APIError",
    "AuthenticationError",
    "NetworkError",
    "ValidationError"
]