"""
Classe base para todos os equipamentos
"""

import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class EquipmentStatus(str, Enum):
    """Status do equipamento"""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ERROR = "error"
    BUSY = "busy"


class EquipmentError(Exception):
    """Erro base para equipamentos"""
    
    def __init__(self, message: str, equipment_type: str = "", error_code: str = ""):
        self.equipment_type = equipment_type
        self.error_code = error_code
        super().__init__(message)


class EquipmentNotFoundError(EquipmentError):
    """Equipamento não encontrado"""
    pass


class BaseEquipment(ABC):
    """
    Classe base para todos os equipamentos de PDV
    
    Define interface comum para:
    - Conexão/Desconexão
    - Status do equipamento
    - Configurações
    - Logging
    """
    
    def __init__(self, equipment_type: str, config: Dict[str, Any]):
        self.equipment_type = equipment_type
        self.config = config
        self.status = EquipmentStatus.DISCONNECTED
        self.last_error: Optional[str] = None
        self.logger = logging.getLogger(f"equipment.{equipment_type}")
    
    @abstractmethod
    def connect(self) -> bool:
        """
        Conecta ao equipamento
        
        Returns:
            True se conectado com sucesso
        """
        pass
    
    @abstractmethod
    def disconnect(self) -> bool:
        """
        Desconecta do equipamento
        
        Returns:
            True se desconectado com sucesso
        """
        pass
    
    @abstractmethod
    def is_connected(self) -> bool:
        """
        Verifica se está conectado
        
        Returns:
            True se conectado
        """
        pass
    
    @abstractmethod
    def test_connection(self) -> bool:
        """
        Testa a conexão com o equipamento
        
        Returns:
            True se teste passou
        """
        pass
    
    def get_status(self) -> EquipmentStatus:
        """
        Obtém status atual do equipamento
        
        Returns:
            Status do equipamento
        """
        return self.status
    
    def get_last_error(self) -> Optional[str]:
        """
        Obtém último erro ocorrido
        
        Returns:
            Mensagem do último erro ou None
        """
        return self.last_error
    
    def set_error(self, error_message: str) -> None:
        """
        Define erro atual
        
        Args:
            error_message: Mensagem de erro
        """
        self.last_error = error_message
        self.status = EquipmentStatus.ERROR
        self.logger.error(f"{self.equipment_type}: {error_message}")
    
    def clear_error(self) -> None:
        """Limpa erro atual"""
        self.last_error = None
        if self.status == EquipmentStatus.ERROR:
            self.status = EquipmentStatus.DISCONNECTED
    
    def get_info(self) -> Dict[str, Any]:
        """
        Obtém informações do equipamento
        
        Returns:
            Dicionário com informações
        """
        return {
            'type': self.equipment_type,
            'status': self.status.value,
            'connected': self.is_connected(),
            'last_error': self.last_error,
            'config': self.config
        }
    
    def update_config(self, new_config: Dict[str, Any]) -> None:
        """
        Atualiza configuração do equipamento
        
        Args:
            new_config: Nova configuração
        """
        self.config.update(new_config)
        self.logger.info(f"{self.equipment_type}: Configuração atualizada")
    
    def log_operation(self, operation: str, success: bool, details: str = "") -> None:
        """
        Log de operação do equipamento
        
        Args:
            operation: Nome da operação
            success: Se foi bem sucedida
            details: Detalhes adicionais
        """
        level = logging.INFO if success else logging.ERROR
        message = f"{self.equipment_type}: {operation} - {'Sucesso' if success else 'Falha'}"
        
        if details:
            message += f" - {details}"
        
        self.logger.log(level, message)