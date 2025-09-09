"""
Gerenciador de banco de dados local SQLite
"""

import sqlite3
import logging
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path
from contextlib import contextmanager

logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    Gerenciador do banco de dados local SQLite
    
    Fornece funcionalidades para:
    - Conexão com SQLite
    - Execução de queries
    - Migrations
    - Cache local
    - Sincronização offline
    """
    
    def __init__(self, db_path: str = "data/pos_local.db"):
        self.db_path = Path(db_path)
        self._ensure_database_directory()
        self._init_database()
    
    def _ensure_database_directory(self) -> None:
        """Garante que o diretório do banco de dados existe"""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
    
    def _init_database(self) -> None:
        """Inicializa o banco de dados com as tabelas necessárias"""
        with self.get_connection() as conn:
            # Habilita foreign keys
            conn.execute("PRAGMA foreign_keys = ON")
            
            # Configura WAL mode para melhor performance
            conn.execute("PRAGMA journal_mode = WAL")
            
            # Cria as tabelas
            self._create_tables(conn)
    
    def _create_tables(self, conn: sqlite3.Connection) -> None:
        """
        Cria as tabelas necessárias
        
        Args:
            conn: Conexão com o banco
        """
        # Tabela de produtos (cache da API)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                sku TEXT UNIQUE,
                barcode TEXT,
                price DECIMAL(10,2) NOT NULL,
                cost DECIMAL(10,2),
                wholesale_price DECIMAL(10,2),
                stock_quantity INTEGER DEFAULT 0,
                min_stock INTEGER,
                max_stock INTEGER,
                category_id INTEGER,
                category_name TEXT,
                brand TEXT,
                weight DECIMAL(8,3),
                requires_weighing BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                is_service BOOLEAN DEFAULT FALSE,
                has_variants BOOLEAN DEFAULT FALSE,
                tax_rate DECIMAL(5,2),
                image_url TEXT,
                notes TEXT,
                last_sold_at TEXT,
                times_sold INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                synced_at TEXT
            )
        """)
        
        # Tabela de clientes (cache da API)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                document TEXT UNIQUE,
                document_type TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                zip_code TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                is_vip BOOLEAN DEFAULT FALSE,
                discount_rate DECIMAL(5,2),
                credit_limit DECIMAL(10,2),
                notes TEXT,
                last_purchase_at TEXT,
                total_purchases DECIMAL(12,2) DEFAULT 0,
                purchases_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                synced_at TEXT
            )
        """)
        
        # Tabela de sessões de caixa
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cashier_sessions (
                id INTEGER PRIMARY KEY,
                session_number TEXT UNIQUE,
                user_id INTEGER NOT NULL,
                user_name TEXT,
                terminal_id TEXT,
                opened_at TEXT NOT NULL,
                closed_at TEXT,
                opening_cash DECIMAL(10,2) NOT NULL,
                total_sales DECIMAL(12,2) DEFAULT 0,
                total_cash_sales DECIMAL(12,2) DEFAULT 0,
                total_card_sales DECIMAL(12,2) DEFAULT 0,
                total_pix_sales DECIMAL(12,2) DEFAULT 0,
                total_other_sales DECIMAL(12,2) DEFAULT 0,
                sales_count INTEGER DEFAULT 0,
                cancelled_sales_count INTEGER DEFAULT 0,
                closing_cash DECIMAL(10,2),
                expected_cash DECIMAL(10,2),
                cash_difference DECIMAL(10,2),
                status TEXT DEFAULT 'open',
                opening_notes TEXT,
                closing_notes TEXT,
                synced BOOLEAN DEFAULT FALSE,
                sync_error TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabela de vendas
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY,
                sale_number TEXT UNIQUE,
                customer_id INTEGER,
                customer_name TEXT,
                customer_document TEXT,
                subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
                discount_amount DECIMAL(12,2) DEFAULT 0,
                discount_percentage DECIMAL(5,2),
                tax_amount DECIMAL(12,2) DEFAULT 0,
                total_amount DECIMAL(12,2) NOT NULL,
                payment_method TEXT NOT NULL,
                amount_paid DECIMAL(12,2) NOT NULL,
                change_amount DECIMAL(12,2) DEFAULT 0,
                status TEXT DEFAULT 'pending',
                cashier_session_id INTEGER,
                user_id INTEGER,
                user_name TEXT,
                fiscal_document_number TEXT,
                fiscal_document_type TEXT,
                notes TEXT,
                synced BOOLEAN DEFAULT FALSE,
                sync_error TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cashier_session_id) REFERENCES cashier_sessions(id)
            )
        """)
        
        # Tabela de itens de venda
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sale_items (
                id INTEGER PRIMARY KEY,
                sale_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                product_sku TEXT,
                quantity INTEGER NOT NULL,
                weight DECIMAL(8,3),
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(12,2) NOT NULL,
                discount_amount DECIMAL(10,2) DEFAULT 0,
                discount_percentage DECIMAL(5,2),
                tax_rate DECIMAL(5,2),
                tax_amount DECIMAL(10,2),
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
            )
        """)
        
        # Tabela de configurações locais
        conn.execute("""
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Índices para melhor performance
        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id)")
        
        conn.commit()
    
    @contextmanager
    def get_connection(self):
        """
        Context manager para conexões com o banco
        
        Yields:
            Conexão SQLite
        """
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row  # Permite acesso por nome de coluna
        
        try:
            yield conn
        except Exception as e:
            conn.rollback()
            logger.error(f"Erro no banco de dados: {e}")
            raise
        finally:
            conn.close()
    
    def execute_query(
        self,
        query: str,
        params: Tuple[Any, ...] = (),
        fetch: bool = False
    ) -> Optional[List[sqlite3.Row]]:
        """
        Executa uma query no banco
        
        Args:
            query: Query SQL
            params: Parâmetros da query
            fetch: Se deve retornar resultados
            
        Returns:
            Resultados se fetch=True, None caso contrário
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            
            if fetch:
                return cursor.fetchall()
            else:
                conn.commit()
                return None
    
    def execute_many(self, query: str, params_list: List[Tuple[Any, ...]]) -> None:
        """
        Executa múltiplas queries com diferentes parâmetros
        
        Args:
            query: Query SQL
            params_list: Lista de parâmetros
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany(query, params_list)
            conn.commit()
    
    def get_setting(self, key: str, default: Any = None) -> Any:
        """
        Obtém uma configuração local
        
        Args:
            key: Chave da configuração
            default: Valor padrão
            
        Returns:
            Valor da configuração
        """
        result = self.execute_query(
            "SELECT value FROM app_settings WHERE key = ?",
            (key,),
            fetch=True
        )
        
        if result:
            return result[0]['value']
        return default
    
    def set_setting(self, key: str, value: Any) -> None:
        """
        Define uma configuração local
        
        Args:
            key: Chave da configuração
            value: Valor a definir
        """
        self.execute_query(
            """
            INSERT OR REPLACE INTO app_settings (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            """,
            (key, str(value))
        )
    
    def backup_database(self, backup_path: Optional[str] = None) -> str:
        """
        Cria backup do banco de dados
        
        Args:
            backup_path: Caminho do backup (opcional)
            
        Returns:
            Caminho do arquivo de backup
        """
        if not backup_path:
            import datetime
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"{self.db_path.stem}_backup_{timestamp}.db"
        
        backup_path = Path(backup_path)
        
        with self.get_connection() as source:
            backup = sqlite3.connect(str(backup_path))
            source.backup(backup)
            backup.close()
        
        logger.info(f"Backup criado: {backup_path}")
        return str(backup_path)
    
    def vacuum(self) -> None:
        """Executa VACUUM para otimizar o banco"""
        with self.get_connection() as conn:
            conn.execute("VACUUM")
        logger.info("VACUUM executado no banco de dados")
    
    def get_database_info(self) -> Dict[str, Any]:
        """
        Obtém informações sobre o banco de dados
        
        Returns:
            Dicionário com informações do banco
        """
        with self.get_connection() as conn:
            # Tamanho do arquivo
            file_size = self.db_path.stat().st_size if self.db_path.exists() else 0
            
            # Número de tabelas
            tables_result = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
            table_count = len(tables_result)
            
            # Contagem de registros por tabela
            table_counts = {}
            for table_row in tables_result:
                table_name = table_row[0]
                if not table_name.startswith('sqlite_'):
                    count_result = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()
                    table_counts[table_name] = count_result[0]
            
            return {
                'file_path': str(self.db_path),
                'file_size_bytes': file_size,
                'file_size_mb': round(file_size / 1024 / 1024, 2),
                'table_count': table_count,
                'record_counts': table_counts
            }