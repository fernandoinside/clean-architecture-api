"""
Funções auxiliares gerais
"""

import uuid
import time
import functools
import logging
from typing import Any, Callable, Optional, TypeVar, Union
from pathlib import Path

T = TypeVar('T')
logger = logging.getLogger(__name__)


def generate_uuid() -> str:
    """
    Gera UUID único
    
    Returns:
        String UUID
    """
    return str(uuid.uuid4())


def generate_short_id(length: int = 8) -> str:
    """
    Gera ID curto baseado em timestamp
    
    Args:
        length: Tamanho do ID
        
    Returns:
        String ID
    """
    import random
    import string
    
    timestamp = str(int(time.time()))[-4:]  # Últimos 4 dígitos do timestamp
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length-4))
    
    return timestamp + random_part


def safe_convert(value: Any, target_type: type, default: Any = None) -> Any:
    """
    Conversão segura de tipos
    
    Args:
        value: Valor a converter
        target_type: Tipo de destino
        default: Valor padrão em caso de erro
        
    Returns:
        Valor convertido ou padrão
    """
    if value is None:
        return default
    
    try:
        if target_type == bool:
            # Conversão especial para bool
            if isinstance(value, str):
                return value.lower() in ('true', '1', 'yes', 'on', 'sim')
            return bool(value)
        
        return target_type(value)
        
    except (ValueError, TypeError):
        return default


def retry_on_exception(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """
    Decorator para retry automático em caso de exceção
    
    Args:
        max_attempts: Número máximo de tentativas
        delay: Delay inicial em segundos
        backoff_factor: Fator de multiplicação do delay
        exceptions: Tupla de exceções para retry
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> T:
            current_delay = delay
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                    
                except exceptions as e:
                    if attempt == max_attempts - 1:
                        # Última tentativa, relança a exceção
                        raise
                    
                    logger.warning(
                        f"Tentativa {attempt + 1}/{max_attempts} falhou para {func.__name__}: {e}"
                    )
                    
                    time.sleep(current_delay)
                    current_delay *= backoff_factor
            
            # Nunca deveria chegar aqui
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


def singleton(cls):
    """
    Decorator para padrão Singleton
    
    Args:
        cls: Classe a ser transformada em singleton
        
    Returns:
        Classe singleton
    """
    instances = {}
    
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    
    return get_instance


def measure_time(func: Callable) -> Callable:
    """
    Decorator para medir tempo de execução
    
    Args:
        func: Função a ser medida
        
    Returns:
        Função decorada
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        execution_time = time.time() - start_time
        
        logger.debug(f"{func.__name__} executada em {execution_time:.3f}s")
        return result
    
    return wrapper


def ensure_directory(path: Union[str, Path]) -> Path:
    """
    Garante que um diretório existe
    
    Args:
        path: Caminho do diretório
        
    Returns:
        Path do diretório
    """
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    return path


def clean_filename(filename: str) -> str:
    """
    Limpa nome de arquivo removendo caracteres inválidos
    
    Args:
        filename: Nome original do arquivo
        
    Returns:
        Nome limpo do arquivo
    """
    import re
    
    # Remove caracteres inválidos para nomes de arquivo
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # Remove espaços extras e pontos no início/fim
    filename = filename.strip(' .')
    
    # Limita tamanho
    if len(filename) > 100:
        name, ext = Path(filename).stem, Path(filename).suffix
        filename = name[:100-len(ext)] + ext
    
    return filename


def deep_merge_dicts(base: dict, override: dict) -> dict:
    """
    Faz merge profundo de dicionários
    
    Args:
        base: Dicionário base
        override: Dicionário para sobrescrever
        
    Returns:
        Dicionário merged
    """
    result = base.copy()
    
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value
    
    return result


def chunk_list(items: list, chunk_size: int) -> list:
    """
    Divide lista em chunks menores
    
    Args:
        items: Lista original
        chunk_size: Tamanho de cada chunk
        
    Returns:
        Lista de chunks
    """
    chunks = []
    for i in range(0, len(items), chunk_size):
        chunks.append(items[i:i + chunk_size])
    return chunks


def debounce(wait_time: float):
    """
    Decorator para debounce de função
    
    Args:
        wait_time: Tempo de espera em segundos
    """
    def decorator(func):
        last_called = [0]
        
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            current_time = time.time()
            if current_time - last_called[0] >= wait_time:
                last_called[0] = current_time
                return func(*args, **kwargs)
        
        return wrapper
    return decorator