"""
Integração com balanças Toledo
"""

import serial
import time
from decimal import Decimal
from typing import Optional
from .base import BaseScale
from ..base import EquipmentStatus, EquipmentError


class ToledoScale(BaseScale):
    """
    Driver para balanças Toledo
    
    Suporta protocolo de comunicação padrão Toledo
    via conexão serial
    """
    
    def __init__(self, config):
        super().__init__(config)
        self.serial_connection: Optional[serial.Serial] = None
        self.brand = "Toledo"
    
    def connect(self) -> bool:
        """
        Conecta à balança Toledo via serial
        
        Returns:
            True se conectada com sucesso
        """
        try:
            self.status = EquipmentStatus.CONNECTING
            
            # Configurações da conexão serial
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
            
            # Teste de comunicação
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
            # Envia comando de leitura de peso para testar
            weight = self.read_weight()
            return weight is not None
            
        except Exception:
            return False
    
    def read_weight(self) -> Optional[Decimal]:
        """
        Lê peso atual da balança Toledo
        
        Returns:
            Peso em kg ou None se erro
        """
        if not self.is_connected():
            self.set_error("Balança não conectada")
            return None
        
        try:
            self.status = EquipmentStatus.BUSY
            
            # Comando Toledo para leitura de peso
            command = self.config.get('commands', {}).get('read_weight', '05')
            
            # Limpa buffer
            self.serial_connection.reset_input_buffer()
            
            # Envia comando
            self.serial_connection.write(command.encode())
            
            # Aguarda resposta
            response = self.serial_connection.readline().decode().strip()
            
            if response:
                # Processa resposta Toledo
                weight = self._parse_toledo_response(response)
                
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
    
    def _parse_toledo_response(self, response: str) -> Optional[Decimal]:
        """
        Processa resposta da balança Toledo
        
        Args:
            response: Resposta da balança
            
        Returns:
            Peso extraído ou None
        """
        try:
            # Remove caracteres de controle
            clean_response = ''.join(c for c in response if c.isprintable())
            
            # Protocolo Toledo típico: "ST,GS,+00000.000kg"
            if 'kg' in clean_response:
                # Extrai parte numérica
                weight_part = clean_response.split(',')[-1].replace('kg', '')
                weight_str = ''.join(c for c in weight_part if c.isdigit() or c in '.-+')
                
                if weight_str:
                    weight = Decimal(weight_str)
                    
                    # Verifica se peso é estável (alguns protocolos incluem indicador)
                    self._is_stable = 'ST' in clean_response or 'stable' in clean_response.lower()
                    
                    return weight
            
            return None
            
        except Exception as e:
            self.logger.error(f"Erro ao processar resposta Toledo: {e}")
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
            
            # Aguarda confirmação
            time.sleep(0.5)
            
            # Verifica se tara foi aceita (peso próximo de zero)
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
            # Toledo: comando zero geralmente é "Z" ou similar
            command = self.config.get('commands', {}).get('zero', 'Z')
            
            self.serial_connection.write(command.encode())
            
            time.sleep(0.5)
            
            self.log_operation("zero", True)
            return True
            
        except Exception as e:
            self.set_error(f"Erro ao zerar: {str(e)}")
            return False