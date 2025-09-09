"""
Classe base para balanças
"""

from abc import abstractmethod
from decimal import Decimal
from typing import Optional
from ..base import BaseEquipment


class BaseScale(BaseEquipment):
    """
    Classe base para integração com balanças
    
    Define interface comum para todas as marcas de balanças
    """
    
    def __init__(self, config):
        super().__init__("scale", config)
        self._last_weight: Optional[Decimal] = None
        self._is_stable = False
    
    @abstractmethod
    def read_weight(self) -> Optional[Decimal]:
        """
        Lê o peso atual da balança
        
        Returns:
            Peso em kg ou None se erro
        """
        pass
    
    @abstractmethod
    def tare(self) -> bool:
        """
        Executa tara na balança
        
        Returns:
            True se tara executada com sucesso
        """
        pass
    
    @abstractmethod
    def zero(self) -> bool:
        """
        Zera a balança
        
        Returns:
            True se zerada com sucesso
        """
        pass
    
    def is_weight_stable(self) -> bool:
        """
        Verifica se o peso está estável
        
        Returns:
            True se peso estável
        """
        return self._is_stable
    
    def get_last_weight(self) -> Optional[Decimal]:
        """
        Obtém último peso lido
        
        Returns:
            Último peso ou None
        """
        return self._last_weight
    
    def wait_for_stable_weight(self, timeout: int = 10) -> Optional[Decimal]:
        """
        Aguarda peso estável
        
        Args:
            timeout: Timeout em segundos
            
        Returns:
            Peso estável ou None se timeout
        """
        import time
        
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            weight = self.read_weight()
            
            if weight is not None and self.is_weight_stable():
                return weight
            
            time.sleep(0.1)  # 100ms entre leituras
        
        return None
    
    def format_weight(self, weight: Optional[Decimal]) -> str:
        """
        Formata peso para exibição
        
        Args:
            weight: Peso a formatar
            
        Returns:
            Peso formatado como string
        """
        if weight is None:
            return "--- kg"
        
        return f"{weight:.3f} kg"