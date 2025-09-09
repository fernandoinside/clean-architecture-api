"""
Equipment package - Integração com equipamentos de PDV
"""

from .base import BaseEquipment, EquipmentError, EquipmentNotFoundError
from .scales.manager import ScaleManager
from .printers.manager import PrinterManager
from .fiscal.manager import FiscalManager
from .barcode.manager import BarcodeManager

__all__ = [
    "BaseEquipment",
    "EquipmentError",
    "EquipmentNotFoundError",
    "ScaleManager",
    "PrinterManager", 
    "FiscalManager",
    "BarcodeManager"
]