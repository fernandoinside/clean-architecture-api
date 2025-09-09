"""
Integração com balanças Filizola
"""

import serial
import time
from decimal import Decimal
from typing import Optional
from .base import BaseScale
from ..base import EquipmentStatus


class FilizolaScale(BaseScale):
    """
    Driver para balanças Filizola
    
    Suporta protocolo de comunicação Filizola
    via conexão serial
    """
    
    def __init__(self, config):
        super().__init__(config)
        self.serial_connection: Optional[serial.Serial] = None
        self.brand = "Filizola"
    
    def connect(self) -> bool:
        """
        Conecta à balança Filizola
        
        Returns:
            True se conectada com sucesso
        """
        try:
            self.status = EquipmentStatus.CONNECTING
            
            port = self.config.get('connection', {}).get('port', 'COM1')
            baudrate = self.config.get('connection', {}).get('baudrate', 9600)
            timeout = self.config.get('connection', {}).get('timeout', 2)
            
            self.serial_connection = serial.Serial(
                port=port,
                baudrate=baudrate,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
                timeout=timeout
            )
            
            if self.test_connection():
                self.status = EquipmentStatus.CONNECTED
                self.clear_error()
                self.log_operation("connect", True, f"Conectada em {port}")
                return True
            else:
                self.disconnect()
                self.set_error("Falha no teste de comunicação")
                return False
                
        except serial.SerialException as e:
            self.set_error(f"Erro na conexão serial: {str(e)}")
            return False
        except Exception as e:
            self.set_error(f"Erro inesperado na conexão: {str(e)}")
            return False
    
    def disconnect(self) -> bool:
        """
        Desconecta da balança
        
        Returns:
            True se desconectada
        """
        try:
            if self.serial_connection and self.serial_connection.is_open:
                self.serial_connection.close()
            
            self.serial_connection = None
            self.status = EquipmentStatus.DISCONNECTED
            self.log_operation("disconnect", True)
            return True
            
        except Exception as e:
            self.set_error(f"Erro ao desconectar: {str(e)}")
            return False
    
    def is_connected(self) -> bool:
        """
        Verifica se está conectada
        
        Returns:
            True se conectada
        """
        return (
            self.serial_connection is not None and 
            self.serial_connection.is_open and
            self.status == EquipmentStatus.CONNECTED
        )
    
    def test_connection(self) -> bool:
        """
        Testa comunicação com a balança
        
        Returns:
            True se teste passou
        """
        try:
            weight = self.read_weight()
            return weight is not None
        except Exception:
            return False
    
    def read_weight(self) -> Optional[Decimal]:
        """
        Lê peso atual da balança Filizola
        
        Returns:
            Peso em kg ou None se erro
        """
        if not self.is_connected():
            self.set_error("Balança não conectada")
            return None
        
        try:
            self.status = EquipmentStatus.BUSY
            
            # Comando Filizola para leitura
            command = self.config.get('commands', {}).get('read_weight', 'W')
            
            # Limpa buffer
            self.serial_connection.reset_input_buffer()
            
            # Envia comando
            self.serial_connection.write(command.encode())
            
            # Aguarda resposta
            response = self.serial_connection.readline().decode().strip()
            
            if response:
                weight = self._parse_filizola_response(response)
                
                if weight is not None:
                    self._last_weight = weight
                    self.status = EquipmentStatus.CONNECTED
                    return weight
            
            self.set_error("Resposta inválida da balança")
            return None
            
        except serial.SerialTimeoutException:
            self.set_error("Timeout na comunicação")
            return None
        except Exception as e:
            self.set_error(f"Erro na leitura: {str(e)}")
            return None
        finally:
            if self.status == EquipmentStatus.BUSY:
                self.status = EquipmentStatus.CONNECTED
    
    def _parse_filizola_response(self, response: str) -> Optional[Decimal]:
        """
        Processa resposta da balança Filizola
        
        Args:
            response: Resposta da balança
            
        Returns:
            Peso extraído ou None
        """
        try:
            # Remove caracteres de controle
            clean_response = ''.join(c for c in response if c.isprintable())
            
            # Protocolo Filizola: formato varia por modelo
            # Exemplo: "000.000" ou "+000.000" ou "S000.000"
            
            # Remove prefixos comuns
            weight_str = clean_response.lstrip('SW+-')
            
            # Extrai números
            numbers = ''.join(c for c in weight_str if c.isdigit() or c == '.')
            
            if numbers:
                # Converte para decimal assumindo kg
                weight = Decimal(numbers)
                
                # Detecta estabilidade (prefixo 'S' indica estável em alguns modelos)
                self._is_stable = clean_response.startswith('S') or 'stable' in clean_response.lower()
                
                return weight
            
            return None
            
        except Exception as e:
            self.logger.error(f"Erro ao processar resposta Filizola: {e}")
            return None
    
    def tare(self) -> bool:
        """
        Executa tara na balança
        
        Returns:
            True se tara executada
        """
        if not self.is_connected():
            return False
        
        try:
            command = self.config.get('commands', {}).get('tare', 'T')
            
            self.serial_connection.write(command.encode())
            
            time.sleep(0.5)
            
            # Verifica se tara foi aceita
            current_weight = self.read_weight()
            
            if current_weight is not None and abs(current_weight) < Decimal('0.010'):
                self.log_operation("tare", True)
                return True
            else:
                self.set_error("Falha na execução da tara")
                return False
                
        except Exception as e:
            self.set_error(f"Erro na tara: {str(e)}")
            return False
    
    def zero(self) -> bool:
        """
        Zera a balança
        
        Returns:
            True se zerada
        """
        if not self.is_connected():
            return False
        
        try:
            command = self.config.get('commands', {}).get('zero', 'Z')
            
            self.serial_connection.write(command.encode())
            
            time.sleep(0.5)
            
            self.log_operation("zero", True)
            return True
            
        except Exception as e:
            self.set_error(f"Erro ao zerar: {str(e)}")
            return False