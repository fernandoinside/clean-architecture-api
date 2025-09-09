"""
Base model class para todos os modelos da aplicação
"""

from typing import Any, Dict, Optional, TypeVar, Generic
from datetime import datetime
from pydantic import BaseModel as PydanticBaseModel, Field
import json

T = TypeVar('T')


class BaseModel(PydanticBaseModel, Generic[T]):
    """
    Classe base para todos os modelos de dados
    
    Fornece funcionalidades comuns como:
    - Validação de dados com Pydantic
    - Serialização/Deserialização JSON
    - Métodos de utilidade
    - Timestamping automático
    """
    
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        # Permite usar datetime e outros tipos complexos
        arbitrary_types_allowed = True
        # Permite usar campos extras não definidos no modelo
        extra = "forbid"
        # Usa enum values ao invés de enum names
        use_enum_values = True
        # Validação acontece sempre
        validate_assignment = True
        # Formato de data padrão
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Converte o modelo para dicionário
        
        Returns:
            Dict com os dados do modelo
        """
        return self.dict(exclude_unset=True, exclude_none=True)
    
    def to_json(self) -> str:
        """
        Converte o modelo para JSON string
        
        Returns:
            JSON string representando o modelo
        """
        return self.json(exclude_unset=True, exclude_none=True)
    
    @classmethod
    def from_dict(cls: type[T], data: Dict[str, Any]) -> T:
        """
        Cria uma instância do modelo a partir de um dicionário
        
        Args:
            data: Dicionário com os dados
            
        Returns:
            Instância do modelo
        """
        return cls(**data)
    
    @classmethod
    def from_json(cls: type[T], json_str: str) -> T:
        """
        Cria uma instância do modelo a partir de JSON string
        
        Args:
            json_str: String JSON com os dados
            
        Returns:
            Instância do modelo
        """
        data = json.loads(json_str)
        return cls.from_dict(data)
    
    def update(self, **kwargs) -> None:
        """
        Atualiza os campos do modelo
        
        Args:
            **kwargs: Campos a serem atualizados
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        # Atualiza timestamp de modificação
        self.updated_at = datetime.now()
    
    def is_valid(self) -> bool:
        """
        Verifica se o modelo é válido
        
        Returns:
            True se válido, False caso contrário
        """
        try:
            self.dict()
            return True
        except Exception:
            return False
    
    def __str__(self) -> str:
        """String representation do modelo"""
        class_name = self.__class__.__name__
        if self.id:
            return f"{class_name}(id={self.id})"
        return f"{class_name}()"
    
    def __repr__(self) -> str:
        """Representation detalhada do modelo"""
        return f"{self.__class__.__name__}({self.to_dict()})"