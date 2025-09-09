"""
Gerenciador de configurações da aplicação
"""

import json
import os
import logging
from typing import Any, Dict, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class ConfigManager:
    """
    Gerenciador central de configurações
    
    Carrega e gerencia configurações de múltiplos arquivos JSON,
    com suporte a ambientes diferentes e configurações locais
    """
    
    def __init__(self, config_dir: str = "config"):
        self.config_dir = Path(config_dir)
        self._configs: Dict[str, Dict[str, Any]] = {}
        self._load_all_configs()
    
    def _load_all_configs(self) -> None:
        """Carrega todas as configurações disponíveis"""
        if not self.config_dir.exists():
            logger.warning(f"Diretório de configuração não existe: {self.config_dir}")
            return
        
        # Lista de arquivos de configuração a carregar
        config_files = [
            "api.json",
            "database.json",
            "equipment.json",
            "ui.json",
            "logging.json"
        ]
        
        for config_file in config_files:
            self._load_config(config_file)
    
    def _load_config(self, filename: str) -> None:
        """
        Carrega um arquivo de configuração específico
        
        Args:
            filename: Nome do arquivo de configuração
        """
        config_path = self.config_dir / filename
        
        if not config_path.exists():
            logger.warning(f"Arquivo de configuração não encontrado: {config_path}")
            return
        
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            
            # Nome da configuração é o nome do arquivo sem extensão
            config_name = Path(filename).stem
            self._configs[config_name] = config_data
            
            logger.debug(f"Configuração carregada: {config_name}")
            
            # Tenta carregar configuração local (sobrescreve a principal)
            local_filename = f"local_{filename}"
            local_path = self.config_dir / local_filename
            
            if local_path.exists():
                with open(local_path, 'r', encoding='utf-8') as f:
                    local_config = json.load(f)
                
                # Merge das configurações (local sobrescreve principal)
                self._deep_merge(self._configs[config_name], local_config)
                logger.debug(f"Configuração local aplicada: {config_name}")
                
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON em {config_path}: {e}")
        except Exception as e:
            logger.error(f"Erro ao carregar configuração {config_path}: {e}")
    
    def _deep_merge(self, base: Dict[str, Any], override: Dict[str, Any]) -> None:
        """
        Faz merge profundo de dicionários
        
        Args:
            base: Dicionário base (será modificado)
            override: Dicionário com valores para sobrescrever
        """
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value
    
    def get(self, config_name: str, key_path: str = "", default: Any = None) -> Any:
        """
        Obtém um valor de configuração
        
        Args:
            config_name: Nome da configuração (api, database, etc)
            key_path: Caminho da chave (ex: "database.local_db" ou "endpoints.products")
            default: Valor padrão se não encontrar
            
        Returns:
            Valor da configuração ou default
        """
        if config_name not in self._configs:
            logger.warning(f"Configuração não encontrada: {config_name}")
            return default
        
        config = self._configs[config_name]
        
        if not key_path:
            return config
        
        # Navega pelo caminho das chaves
        keys = key_path.split('.')
        current = config
        
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return default
        
        return current
    
    def set(self, config_name: str, key_path: str, value: Any) -> None:
        """
        Define um valor de configuração
        
        Args:
            config_name: Nome da configuração
            key_path: Caminho da chave
            value: Valor a definir
        """
        if config_name not in self._configs:
            self._configs[config_name] = {}
        
        config = self._configs[config_name]
        keys = key_path.split('.')
        
        # Navega até o penúltimo nível
        current = config
        for key in keys[:-1]:
            if key not in current or not isinstance(current[key], dict):
                current[key] = {}
            current = current[key]
        
        # Define o valor final
        current[keys[-1]] = value
    
    def save_config(self, config_name: str, local: bool = True) -> None:
        """
        Salva configuração em arquivo
        
        Args:
            config_name: Nome da configuração
            local: Se True, salva como configuração local
        """
        if config_name not in self._configs:
            logger.warning(f"Configuração não encontrada para salvar: {config_name}")
            return
        
        filename = f"{'local_' if local else ''}{config_name}.json"
        config_path = self.config_dir / filename
        
        try:
            # Cria diretório se não existe
            self.config_dir.mkdir(parents=True, exist_ok=True)
            
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(self._configs[config_name], f, indent=2, ensure_ascii=False)
            
            logger.info(f"Configuração salva: {config_path}")
            
        except Exception as e:
            logger.error(f"Erro ao salvar configuração {config_path}: {e}")
    
    def reload(self) -> None:
        """Recarrega todas as configurações"""
        self._configs.clear()
        self._load_all_configs()
        logger.info("Configurações recarregadas")
    
    def get_all_configs(self) -> Dict[str, Dict[str, Any]]:
        """Retorna todas as configurações"""
        return self._configs.copy()
    
    def has_config(self, config_name: str) -> bool:
        """Verifica se uma configuração existe"""
        return config_name in self._configs


# Instância global do gerenciador de configuração
_config_manager: Optional[ConfigManager] = None


def get_config() -> ConfigManager:
    """
    Obtém a instância global do gerenciador de configuração
    
    Returns:
        Instância do ConfigManager
    """
    global _config_manager
    
    if _config_manager is None:
        # Determina o diretório de configuração baseado na localização do script
        current_dir = Path(__file__).parent.parent.parent  # Volta para a raiz do projeto
        config_dir = current_dir / "config"
        
        _config_manager = ConfigManager(str(config_dir))
    
    return _config_manager


def init_config(config_dir: Optional[str] = None) -> ConfigManager:
    """
    Inicializa o gerenciador de configuração
    
    Args:
        config_dir: Diretório de configurações (opcional)
        
    Returns:
        Instância do ConfigManager
    """
    global _config_manager
    
    if config_dir:
        _config_manager = ConfigManager(config_dir)
    else:
        _config_manager = get_config()
    
    return _config_manager