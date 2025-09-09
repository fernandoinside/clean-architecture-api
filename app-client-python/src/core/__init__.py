"""
Core package - Funcionalidades principais da aplicação
"""

from .config import ConfigManager, get_config
from .database import DatabaseManager
from .logging import setup_logging

__all__ = [
    "ConfigManager",
    "get_config", 
    "DatabaseManager",
    "setup_logging"
]