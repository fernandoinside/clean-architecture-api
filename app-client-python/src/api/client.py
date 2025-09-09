"""
Cliente principal para comunicação com a API SRM Gestão
"""

import json
import logging
from typing import Optional, Dict, Any, List, Union
from urllib.parse import urljoin
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .exceptions import (
    APIError, AuthenticationError, NetworkError, ValidationError,
    NotFoundError, ConflictError, ServerError, TimeoutError
)

logger = logging.getLogger(__name__)


class APIClient:
    """
    Cliente HTTP para comunicação com a API SRM Gestão
    
    Fornece funcionalidades como:
    - Autenticação automática
    - Retry automático
    - Tratamento de erros
    - Cache de configurações
    - Logging estruturado
    """
    
    def __init__(
        self,
        base_url: str,
        timeout: int = 30,
        retry_attempts: int = 3,
        retry_delay: float = 1.0,
        headers: Optional[Dict[str, str]] = None
    ):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.retry_attempts = retry_attempts
        self.retry_delay = retry_delay
        
        # Token de autenticação
        self._token: Optional[str] = None
        
        # Configurar sessão HTTP
        self.session = requests.Session()
        
        # Headers padrão
        default_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SRM-POS-Client/2.0'
        }
        if headers:
            default_headers.update(headers)
        self.session.headers.update(default_headers)
        
        # Configurar retry strategy
        retry_strategy = Retry(
            total=retry_attempts,
            backoff_factor=retry_delay,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "TRACE"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
    
    def set_token(self, token: str) -> None:
        """
        Define o token de autenticação
        
        Args:
            token: Token de autenticação JWT
        """
        self._token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def clear_token(self) -> None:
        """Remove o token de autenticação"""
        self._token = None
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
    
    @property
    def is_authenticated(self) -> bool:
        """Verifica se está autenticado"""
        return self._token is not None
    
    def _build_url(self, endpoint: str) -> str:
        """
        Constrói URL completa
        
        Args:
            endpoint: Endpoint da API
            
        Returns:
            URL completa
        """
        return urljoin(f"{self.base_url}/", endpoint.lstrip('/'))
    
    def _handle_response(self, response: requests.Response) -> Any:
        """
        Processa resposta da API
        
        Args:
            response: Resposta HTTP
            
        Returns:
            Dados da resposta
            
        Raises:
            APIError: Para erros da API
        """
        try:
            # Log da requisição
            logger.debug(
                f"API Request: {response.request.method} {response.request.url} "
                f"-> {response.status_code}"
            )
            
            # Verifica status code
            if response.status_code == 200:
                if response.content:
                    return response.json()
                return None
            elif response.status_code == 201:
                return response.json() if response.content else None
            elif response.status_code == 204:
                return None
            elif response.status_code == 401:
                raise AuthenticationError("Token inválido ou expirado", status_code=401)
            elif response.status_code == 403:
                raise AuthenticationError("Acesso negado", status_code=403)
            elif response.status_code == 404:
                raise NotFoundError("Recurso não encontrado", status_code=404)
            elif response.status_code == 409:
                raise ConflictError("Conflito de dados", status_code=409)
            elif response.status_code == 422:
                error_data = response.json() if response.content else {}
                raise ValidationError("Dados inválidos", status_code=422, response_data=error_data)
            elif response.status_code >= 500:
                raise ServerError(f"Erro do servidor: {response.status_code}", status_code=response.status_code)
            else:
                # Erro genérico
                error_data = {}
                try:
                    error_data = response.json()
                except:
                    pass
                
                raise APIError(
                    f"Erro na API: {response.status_code}",
                    status_code=response.status_code,
                    response_data=error_data
                )
                
        except requests.exceptions.JSONDecodeError:
            # Resposta não é JSON válido
            raise APIError(f"Resposta inválida da API: {response.text[:100]}")
        except Exception as e:
            if isinstance(e, APIError):
                raise
            raise APIError(f"Erro ao processar resposta: {str(e)}")
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Any:
        """
        Faz requisição HTTP
        
        Args:
            method: Método HTTP
            endpoint: Endpoint da API
            data: Dados para enviar no body
            params: Parâmetros de query string
            headers: Headers adicionais
            
        Returns:
            Resposta da API
        """
        url = self._build_url(endpoint)
        
        # Headers para esta requisição
        request_headers = {}
        if headers:
            request_headers.update(headers)
        
        try:
            # Log da requisição
            logger.debug(f"Making {method} request to {url}")
            if data:
                logger.debug(f"Request data: {json.dumps(data, indent=2, default=str)}")
            
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                headers=request_headers,
                timeout=self.timeout
            )
            
            return self._handle_response(response)
            
        except requests.exceptions.Timeout:
            raise TimeoutError("Timeout na requisição")
        except requests.exceptions.ConnectionError as e:
            raise NetworkError(f"Erro de conexão: {str(e)}")
        except requests.exceptions.RequestException as e:
            raise NetworkError(f"Erro de rede: {str(e)}")
    
    def get(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Any:
        """
        Requisição GET
        
        Args:
            endpoint: Endpoint da API
            params: Parâmetros de query string
            headers: Headers adicionais
            
        Returns:
            Resposta da API
        """
        return self._make_request('GET', endpoint, params=params, headers=headers)
    
    def post(
        self,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Any:
        """
        Requisição POST
        
        Args:
            endpoint: Endpoint da API
            data: Dados para enviar
            headers: Headers adicionais
            
        Returns:
            Resposta da API
        """
        return self._make_request('POST', endpoint, data=data, headers=headers)
    
    def put(
        self,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Any:
        """
        Requisição PUT
        
        Args:
            endpoint: Endpoint da API
            data: Dados para enviar
            headers: Headers adicionais
            
        Returns:
            Resposta da API
        """
        return self._make_request('PUT', endpoint, data=data, headers=headers)
    
    def delete(
        self,
        endpoint: str,
        headers: Optional[Dict[str, str]] = None
    ) -> Any:
        """
        Requisição DELETE
        
        Args:
            endpoint: Endpoint da API
            headers: Headers adicionais
            
        Returns:
            Resposta da API
        """
        return self._make_request('DELETE', endpoint, headers=headers)
    
    def health_check(self) -> bool:
        """
        Verifica se a API está disponível
        
        Returns:
            True se API está online, False caso contrário
        """
        try:
            self.get('/health')  # Assumindo que existe um endpoint /health
            return True
        except:
            return False