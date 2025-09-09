"""
Aplicação principal do Cliente Python SRM Gestão

Este é o ponto de entrada da aplicação desktop para PDV
"""

import sys
import logging
from pathlib import Path
import tkinter as tk
from tkinter import messagebox

# Adiciona o diretório src ao path para imports
sys.path.insert(0, str(Path(__file__).parent))

from core.config import init_config
from core.logging import setup_logging
from core.database import DatabaseManager


class SRMPOSApp:
    """
    Aplicação principal do PDV
    
    Gerencia inicialização, configurações e coordena
    todos os componentes da aplicação
    """
    
    def __init__(self):
        self.config_manager = None
        self.database_manager = None
        self.logger = None
        self.root = None
    
    def initialize(self) -> bool:
        """
        Inicializa a aplicação
        
        Returns:
            True se inicialização bem sucedida
        """
        try:
            # 1. Inicializar configurações
            self.config_manager = init_config()
            
            # 2. Configurar logging
            logging_config_path = Path("config/logging.json")
            setup_logging(str(logging_config_path) if logging_config_path.exists() else None)
            self.logger = logging.getLogger(__name__)
            
            self.logger.info("=== Iniciando SRM Gestão PDV ===")
            
            # 3. Inicializar banco de dados
            db_config = self.config_manager.get('database', 'local_db', 'data/pos_local.db')
            self.database_manager = DatabaseManager(db_config)
            
            # 4. Verificar configurações essenciais
            if not self._check_essential_configs():
                return False
            
            self.logger.info("Aplicação inicializada com sucesso")
            return True
            
        except Exception as e:
            error_msg = f"Erro na inicialização: {str(e)}"
            print(error_msg)  # Print direto pois logger pode não estar configurado
            if self.logger:
                self.logger.error(error_msg, exc_info=True)
            return False
    
    def _check_essential_configs(self) -> bool:
        """
        Verifica se configurações essenciais estão presentes
        
        Returns:
            True se configurações OK
        """
        # Verifica configuração da API
        api_url = self.config_manager.get('api', 'base_url')
        if not api_url:
            self.logger.error("URL da API não configurada")
            return False
        
        # Verifica se pode conectar na API (opcional - pode funcionar offline)
        self.logger.info(f"API configurada: {api_url}")
        
        return True
    
    def create_gui(self) -> None:
        """
        Cria interface gráfica principal
        """
        self.root = tk.Tk()
        
        # Configurações da janela principal
        ui_config = self.config_manager.get('ui', 'window.main', {})
        
        self.root.title(ui_config.get('title', 'SRM Gestão - PDV'))
        self.root.geometry(f"{ui_config.get('width', 1200)}x{ui_config.get('height', 800)}")
        
        if ui_config.get('centered', True):
            self._center_window()
        
        # Por enquanto, interface básica de teste
        self._create_test_interface()
    
    def _center_window(self) -> None:
        """Centraliza janela na tela"""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")
    
    def _create_test_interface(self) -> None:
        """
        Cria interface básica de teste
        (será substituída pela interface completa)
        """
        # Frame principal
        main_frame = tk.Frame(self.root, padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Título
        title_label = tk.Label(
            main_frame,
            text="SRM Gestão - Cliente Python",
            font=("Arial", 24, "bold")
        )
        title_label.pack(pady=(0, 20))
        
        # Informações da aplicação
        info_frame = tk.Frame(main_frame)
        info_frame.pack(fill=tk.X, pady=10)
        
        tk.Label(info_frame, text="Status da Aplicação:", font=("Arial", 12, "bold")).pack(anchor=tk.W)
        tk.Label(info_frame, text="✓ Configurações carregadas", fg="green").pack(anchor=tk.W)
        tk.Label(info_frame, text="✓ Banco de dados inicializado", fg="green").pack(anchor=tk.W)
        tk.Label(info_frame, text="✓ Logging configurado", fg="green").pack(anchor=tk.W)
        
        # Informações do banco
        db_info = self.database_manager.get_database_info()
        db_frame = tk.Frame(main_frame)
        db_frame.pack(fill=tk.X, pady=10)
        
        tk.Label(db_frame, text="Banco de Dados:", font=("Arial", 12, "bold")).pack(anchor=tk.W)
        tk.Label(db_frame, text=f"• Arquivo: {db_info['file_path']}", font=("Arial", 9)).pack(anchor=tk.W)
        tk.Label(db_frame, text=f"• Tamanho: {db_info['file_size_mb']} MB", font=("Arial", 9)).pack(anchor=tk.W)
        tk.Label(db_frame, text=f"• Tabelas: {db_info['table_count']}", font=("Arial", 9)).pack(anchor=tk.W)
        
        # Botões de teste
        buttons_frame = tk.Frame(main_frame)
        buttons_frame.pack(fill=tk.X, pady=20)
        
        tk.Button(
            buttons_frame,
            text="Testar Conectividade API",
            command=self._test_api_connection,
            padx=20,
            pady=10
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        tk.Button(
            buttons_frame,
            text="Ver Logs",
            command=self._show_logs,
            padx=20,
            pady=10
        ).pack(side=tk.LEFT, padx=(0, 10))
        
        tk.Button(
            buttons_frame,
            text="Configurações",
            command=self._show_settings,
            padx=20,
            pady=10
        ).pack(side=tk.LEFT)
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("Pronto")
        status_bar = tk.Label(
            self.root,
            textvariable=self.status_var,
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def _test_api_connection(self) -> None:
        """Testa conexão com a API"""
        self.status_var.set("Testando API...")
        self.root.update()
        
        try:
            from api.client import APIClient
            
            api_config = self.config_manager.get('api')
            client = APIClient(
                base_url=api_config.get('base_url'),
                timeout=api_config.get('timeout', 10)
            )
            
            if client.health_check():
                messagebox.showinfo("Sucesso", "API está acessível!")
                self.status_var.set("API: Conectada")
            else:
                messagebox.showwarning("Atenção", "API não está acessível. Funcionando em modo offline.")
                self.status_var.set("API: Offline")
                
        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao testar API: {str(e)}")
            self.status_var.set("API: Erro")
    
    def _show_logs(self) -> None:
        """Exibe janela com logs recentes"""
        logs_window = tk.Toplevel(self.root)
        logs_window.title("Logs da Aplicação")
        logs_window.geometry("800x600")
        
        # Text widget com scrollbar
        text_frame = tk.Frame(logs_window)
        text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        text_widget = tk.Text(text_frame, wrap=tk.WORD)
        scrollbar = tk.Scrollbar(text_frame, orient=tk.VERTICAL, command=text_widget.yview)
        text_widget.configure(yscrollcommand=scrollbar.set)
        
        text_widget.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Carrega logs recentes
        try:
            log_file = Path("logs/app.log")
            if log_file.exists():
                with open(log_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    # Mostra últimas 100 linhas
                    recent_logs = ''.join(lines[-100:])
                    text_widget.insert(tk.END, recent_logs)
                    text_widget.see(tk.END)  # Scroll para o final
            else:
                text_widget.insert(tk.END, "Arquivo de log não encontrado.")
        except Exception as e:
            text_widget.insert(tk.END, f"Erro ao carregar logs: {str(e)}")
    
    def _show_settings(self) -> None:
        """Exibe janela de configurações"""
        settings_window = tk.Toplevel(self.root)
        settings_window.title("Configurações")
        settings_window.geometry("600x500")
        
        # Notebook para abas
        try:
            from tkinter import ttk
            notebook = ttk.Notebook(settings_window)
            notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            # Aba API
            api_frame = ttk.Frame(notebook)
            notebook.add(api_frame, text="API")
            
            api_config = self.config_manager.get('api', default={})
            
            tk.Label(api_frame, text="URL da API:").pack(anchor=tk.W, pady=(10, 5))
            api_url_var = tk.StringVar(value=api_config.get('base_url', ''))
            tk.Entry(api_frame, textvariable=api_url_var, width=50).pack(fill=tk.X, padx=10)
            
            # Aba Equipamentos
            equipment_frame = ttk.Frame(notebook)
            notebook.add(equipment_frame, text="Equipamentos")
            
            equipment_config = self.config_manager.get('equipment', default={})
            
            scales_enabled = tk.BooleanVar(value=equipment_config.get('scales', {}).get('enabled', False))
            tk.Checkbutton(equipment_frame, text="Balança Habilitada", variable=scales_enabled).pack(anchor=tk.W, pady=10)
            
            printers_enabled = tk.BooleanVar(value=equipment_config.get('printers', {}).get('enabled', False))
            tk.Checkbutton(equipment_frame, text="Impressora Habilitada", variable=printers_enabled).pack(anchor=tk.W)
            
        except ImportError:
            # Fallback se ttk não disponível
            tk.Label(settings_window, text="Configurações serão implementadas na versão completa").pack(pady=50)
    
    def run(self) -> None:
        """
        Executa a aplicação
        """
        if not self.initialize():
            sys.exit(1)
        
        self.create_gui()
        
        # Handler para fechamento da aplicação
        self.root.protocol("WM_DELETE_WINDOW", self._on_closing)
        
        # Inicia loop principal
        self.logger.info("Interface iniciada - entrando no loop principal")
        self.root.mainloop()
    
    def _on_closing(self) -> None:
        """Handler para fechamento da aplicação"""
        try:
            self.logger.info("Encerrando aplicação...")
            
            # Desconecta equipamentos, salva dados, etc.
            if self.database_manager:
                # Pode fazer backup final aqui se necessário
                pass
            
            self.logger.info("Aplicação encerrada")
            
        except Exception as e:
            print(f"Erro ao encerrar: {e}")
        finally:
            self.root.destroy()


def main():
    """
    Função principal de entrada
    """
    try:
        app = SRMPOSApp()
        app.run()
    except KeyboardInterrupt:
        print("\nAplicação interrompida pelo usuário")
        sys.exit(0)
    except Exception as e:
        print(f"Erro fatal: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()