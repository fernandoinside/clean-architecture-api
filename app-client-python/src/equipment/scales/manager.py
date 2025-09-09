"""
Gerenciador de balanças
"""

from typing import Optional, Dict, Any
from decimal import Decimal
from .base import BaseScale
from .toledo import ToledoScale
from .filizola import FilizolaScale
from ..base import EquipmentError


class ScaleManager:
    """
    Gerenciador para balanças
    
    Fornece interface unificada para diferentes marcas de balanças
    """
    
    SUPPORTED_BRANDS = {
        'toledo': ToledoScale,
        'filizola': FilizolaScale,
    }
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.scale: Optional[BaseScale] = None
        self._initialize_scale()
    
    def _initialize_scale(self) -> None:
        """Inicializa balança baseada na configuração"""
        if not self.config.get('enabled', False):
            return
        
        brand = self.config.get('default_brand', 'toledo').lower()
        
        if brand not in self.SUPPORTED_BRANDS:
            raise EquipmentError(f"Marca de balança não suportada: {brand}")
        
        scale_class = self.SUPPORTED_BRANDS[brand]
        scale_config = self.config.get('supported_brands', {}).get(brand, {})
        scale_config.update(self.config.get('connection', {}))
        
        self.scale = scale_class(scale_config)
    
    def connect(self) -> bool:
        """
        Conecta à balança
        
        Returns:
            True se conectada
        """
        if not self.scale:
            return False
        
        return self.scale.connect()
    
    def disconnect(self) -> bool:
        """
        Desconecta da balança
        
        Returns:
            True se desconectada
        """
        if not self.scale:
            return True
        
        return self.scale.disconnect()
    
    def is_connected(self) -> bool:
        """
        Verifica se balança está conectada
        
        Returns:
            True se conectada
        """
        return self.scale is not None and self.scale.is_connected()
    
    def read_weight(self) -> Optional[Decimal]:
        """
        Lê peso atual
        
        Returns:
            Peso em kg ou None
        """
        if not self.scale:
            return None
        
        return self.scale.read_weight()
    
    def wait_for_stable_weight(self, timeout: int = 10) -> Optional[Decimal]:
        """
        Aguarda peso estável
        
        Args:
            timeout: Timeout em segundos
            
        Returns:
            Peso estável ou None
        """
        if not self.scale:
            return None
        
        return self.scale.wait_for_stable_weight(timeout)
    
    def tare(self) -> bool:
        """
        Executa tara
        
        Returns:
            True se executada
        """
        if not self.scale:
            return False
        
        return self.scale.tare()
    
    def zero(self) -> bool:
        """
        Zera balança
        
        Returns:
            True se zerada
        """
        if not self.scale:
            return False
        
        return self.scale.zero()
    
    def is_weight_stable(self) -> bool:
        """
        Verifica se peso está estável
        
        Returns:
            True se estável
        """
        if not self.scale:
            return False
        
        return self.scale.is_weight_stable()
    
    def get_last_weight(self) -> Optional[Decimal]:
        """
        Obtém último peso lido
        
        Returns:
            Último peso
        """
        if not self.scale:
            return None
        
        return self.scale.get_last_weight()
    
    def get_status(self) -> Dict[str, Any]:
        """
        Obtém status da balança
        
        Returns:
            Dicionário com status
        """
        if not self.scale:
            return {
                'enabled': False,
                'connected': False,
                'status': 'disabled'
            }
        
        return {
            'enabled': True,
            'connected': self.scale.is_connected(),
            'status': self.scale.get_status().value,
            'last_weight': self.scale.get_last_weight(),
            'weight_stable': self.scale.is_weight_stable(),
            'last_error': self.scale.get_last_error(),
            'brand': getattr(self.scale, 'brand', 'unknown')
        }
    
    def format_weight(self, weight: Optional[Decimal]) -> str:
        """
        Formata peso para exibição
        
        Args:
            weight: Peso a formatar
            
        Returns:
            Peso formatado
        """
        if not self.scale:
            return "--- kg"
        
        return self.scale.format_weight(weight)