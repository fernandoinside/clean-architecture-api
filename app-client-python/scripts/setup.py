"""
Script de configuração inicial da aplicação
"""

import os
import sys
import json
from pathlib import Path


def create_directories():
    """Cria diretórios necessários"""
    directories = [
        'data',
        'logs',
        'temp',
        'config',
        'assets'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✓ Diretório criado: {directory}")


def create_desktop_shortcut():
    """Cria atalho na área de trabalho (Windows)"""
    try:
        import winshell
        from win32com.client import Dispatch
        
        desktop = winshell.desktop()
        shortcut_path = os.path.join(desktop, "SRM PDV.lnk")
        target_path = sys.executable
        start_in = str(Path(__file__).parent.parent)
        arguments = f'"{start_in}/src/main.py"'
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(shortcut_path)
        shortcut.Targetpath = target_path
        shortcut.Arguments = arguments
        shortcut.StartIn = start_in
        shortcut.WindowStyle = 1
        shortcut.save()
        
        print(f"✓ Atalho criado na área de trabalho")
        
    except ImportError:
        print("⚠ Bibliotecas para criar atalho não disponíveis (pip install pywin32 winshell)")
    except Exception as e:
        print(f"⚠ Erro ao criar atalho: {e}")


def create_startup_script():
    """Cria script de inicialização"""
    startup_script = """@echo off
echo Iniciando SRM Gestão PDV...
cd /d "%~dp0"
python src/main.py
pause
"""
    
    script_path = Path("run_pos.bat")
    script_path.write_text(startup_script, encoding='utf-8')
    print(f"✓ Script de inicialização criado: {script_path}")


def check_dependencies():
    """Verifica dependências necessárias"""
    print("\n=== Verificando Dependências ===")
    
    required_packages = [
        'requests',
        'Pillow',
        'pydantic',
        'pyserial'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package}")
        except ImportError:
            print(f"✗ {package} - FALTANDO")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠ Instale os pacotes faltantes com:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    print("\n✓ Todas as dependências estão instaladas!")
    return True


def setup_sample_config():
    """Cria configuração de exemplo se não existir"""
    config_path = Path("config/local_api.json")
    
    if not config_path.exists():
        sample_config = {
            "base_url": "http://localhost:3000",
            "timeout": 30,
            "retry_attempts": 3
        }
        
        config_path.parent.mkdir(exist_ok=True)
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(sample_config, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Configuração de exemplo criada: {config_path}")
        print(f"  Edite este arquivo para configurar sua API")


def main():
    """Função principal do setup"""
    print("=== Setup do SRM Gestão PDV ===\n")
    
    # Verifica se está no diretório correto
    if not Path("src/main.py").exists():
        print("❌ Execute este script a partir do diretório raiz do projeto!")
        return False
    
    print("1. Criando diretórios...")
    create_directories()
    
    print("\n2. Verificando dependências...")
    if not check_dependencies():
        return False
    
    print("\n3. Configurando arquivos...")
    setup_sample_config()
    create_startup_script()
    
    print("\n4. Criando atalhos...")
    create_desktop_shortcut()
    
    print("\n=== Setup Concluído! ===")
    print("\nPróximos passos:")
    print("1. Configure a API editando config/local_api.json")
    print("2. Execute: python src/main.py")
    print("3. Ou use o arquivo: run_pos.bat")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)