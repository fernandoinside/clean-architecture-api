"""
Configuração de logging estruturado para a aplicação
"""

import json
import logging
import logging.config
from typing import Dict, Any
from pathlib import Path


class JSONFormatter(logging.Formatter):
    """
    Formatter customizado para logs em formato JSON
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Formata o record como JSON
        
        Args:
            record: Record de log
            
        Returns:
            String JSON formatada
        """
        # Dados básicos do log
        log_data = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Adiciona informações de exceção se existir
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        # Adiciona campos extras se existirem
        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)
        
        return json.dumps(log_data, ensure_ascii=False)


def setup_logging(config_path: str = None, default_level: int = logging.INFO) -> None:
    """
    Configura o sistema de logging da aplicação
    
    Args:
        config_path: Caminho para arquivo de configuração de logging
        default_level: Nível de log padrão se não houver configuração
    """
    # Garante que o diretório de logs existe
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    if config_path and Path(config_path).exists():
        # Carrega configuração do arquivo
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Aplica a configuração
            logging.config.dictConfig(config)
            
        except Exception as e:
            # Fallback para configuração básica
            print(f"Erro ao carregar configuração de logging: {e}")
            _setup_basic_logging(default_level)
    else:
        # Configuração básica
        _setup_basic_logging(default_level)


def _setup_basic_logging(level: int = logging.INFO) -> None:
    """
    Configura logging básico quando não há arquivo de configuração
    
    Args:
        level: Nível de logging
    """
    # Formatter básico
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Handler para console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    
    # Handler para arquivo
    file_handler = logging.FileHandler('logs/app.log', encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Handler para erros
    error_handler = logging.FileHandler('logs/errors.log', encoding='utf-8')
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(JSONFormatter())
    
    # Configurar logger raiz
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)


def get_logger(name: str, extra_data: Dict[str, Any] = None) -> logging.Logger:
    """
    Obtém um logger com dados extras opcionais
    
    Args:
        name: Nome do logger
        extra_data: Dados extras para incluir nos logs
        
    Returns:
        Logger configurado
    """
    logger = logging.getLogger(name)
    
    if extra_data:
        # Adapter para adicionar dados extras
        class ExtraAdapter(logging.LoggerAdapter):
            def process(self, msg, kwargs):
                if 'extra' in kwargs:
                    kwargs['extra'].update(self.extra)
                else:
                    kwargs['extra'] = self.extra
                return msg, kwargs
        
        return ExtraAdapter(logger, extra_data)
    
    return logger


def log_performance(func):
    """
    Decorator para log de performance de funções
    
    Args:
        func: Função a ser decorada
        
    Returns:
        Função decorada
    """
    import time
    import functools
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = logging.getLogger(func.__module__)
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            logger.info(
                f"Performance: {func.__name__} executada em {execution_time:.3f}s",
                extra={'execution_time': execution_time, 'function': func.__name__}
            )
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            
            logger.error(
                f"Error: {func.__name__} falhou após {execution_time:.3f}s: {e}",
                extra={
                    'execution_time': execution_time,
                    'function': func.__name__,
                    'error': str(e)
                },
                exc_info=True
            )
            raise
    
    return wrapper


def log_api_call(method: str, url: str, status_code: int = None, response_time: float = None):
    """
    Log específico para chamadas de API
    
    Args:
        method: Método HTTP
        url: URL da requisição
        status_code: Código de status HTTP
        response_time: Tempo de resposta em segundos
    """
    logger = logging.getLogger('api_client')
    
    extra_data = {
        'api_method': method,
        'api_url': url,
        'api_status_code': status_code,
        'api_response_time': response_time
    }
    
    if status_code and status_code >= 400:
        logger.error(f"API Error: {method} {url} -> {status_code}", extra=extra_data)
    else:
        logger.info(f"API Call: {method} {url} -> {status_code}", extra=extra_data)