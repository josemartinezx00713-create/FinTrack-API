import sqlite3
import json
from datetime import datetime
from services.ports import ICacheRepository
from models.exceptions import ErrorPersistencia

CACHE_DB = "cache_fintrack.db"
BASE_CURRENCY = "NIO"


class CacheService(ICacheRepository):
    def __init__(self, db_path: str = CACHE_DB):
        self.db_path = db_path
        self._init_cache()

    def _init_cache(self):
        db = sqlite3.connect(self.db_path)
        db.execute("""
            CREATE TABLE IF NOT EXISTS exchange_rates (
                base_currency TEXT NOT NULL,
                target_currency TEXT NOT NULL,
                rate REAL NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                PRIMARY KEY (base_currency, target_currency)
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS cached_transactions (
                month TEXT NOT NULL,
                data TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                PRIMARY KEY (month)
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS cached_budgets (
                month TEXT NOT NULL,
                data TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                PRIMARY KEY (month)
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS cached_goals (
                data TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        db.commit()
        db.close()

    def get_rate(self, base: str, target: str) -> float | None:
        try:
            db = sqlite3.connect(self.db_path)
            row = db.execute(
                "SELECT rate, updated_at FROM exchange_rates WHERE base_currency=? AND target_currency=?",
                (base, target)
            ).fetchone()
            db.close()
            if row:
                updated = datetime.fromisoformat(row[1])
                age_hours = (datetime.now() - updated).total_seconds() / 3600
                if age_hours < 24:
                    return row[0]
        except Exception:
            pass
        return None

    def cache_rates(self, base: str, rates: dict):
        try:
            db = sqlite3.connect(self.db_path)
            db.execute("BEGIN")
            for target, rate in rates.items():
                db.execute(
                    "INSERT OR REPLACE INTO exchange_rates (base_currency, target_currency, rate, updated_at) VALUES (?, ?, ?, datetime('now'))",
                    (base, target, rate)
                )
            db.commit()
            db.close()
        except Exception:
            pass

    def get_cached_transactions(self, month: str = "") -> list:
        try:
            db = sqlite3.connect(self.db_path)
            if month:
                row = db.execute(
                    "SELECT data FROM cached_transactions WHERE month = ?",
                    (month,)
                ).fetchone()
            else:
                row = db.execute(
                    "SELECT data FROM cached_transactions ORDER BY updated_at DESC LIMIT 1"
                ).fetchone()
            db.close()
            if row:
                return json.loads(row[0])
        except Exception:
            pass
        return []

    def cache_transactions(self, transactions: list, month: str):
        try:
            db = sqlite3.connect(self.db_path)
            db.execute(
                "INSERT OR REPLACE INTO cached_transactions (month, data, updated_at) VALUES (?, ?, datetime('now'))",
                (month, json.dumps(transactions))
            )
            db.commit()
            db.close()
        except Exception as e:
            raise ErrorPersistencia(f"No se pudo cachear transacciones: {e}")

    def get_cached_budgets(self, month: str = "") -> list:
        try:
            db = sqlite3.connect(self.db_path)
            if month:
                row = db.execute(
                    "SELECT data FROM cached_budgets WHERE month = ?",
                    (month,)
                ).fetchone()
            else:
                row = db.execute(
                    "SELECT data FROM cached_budgets ORDER BY updated_at DESC LIMIT 1"
                ).fetchone()
            db.close()
            if row:
                return json.loads(row[0])
        except Exception:
            pass
        return []

    def cache_budgets(self, budgets: list, month: str):
        try:
            db = sqlite3.connect(self.db_path)
            db.execute(
                "INSERT OR REPLACE INTO cached_budgets (month, data, updated_at) VALUES (?, ?, datetime('now'))",
                (month, json.dumps(budgets))
            )
            db.commit()
            db.close()
        except Exception as e:
            raise ErrorPersistencia(f"No se pudo cachear presupuestos: {e}")

    def get_cached_goals(self) -> list:
        try:
            db = sqlite3.connect(self.db_path)
            row = db.execute(
                "SELECT data FROM cached_goals ORDER BY updated_at DESC LIMIT 1"
            ).fetchone()
            db.close()
            if row:
                return json.loads(row[0])
        except Exception:
            pass
        return []

    def cache_goals(self, goals: list):
        try:
            db = sqlite3.connect(self.db_path)
            db.execute(
                "INSERT OR REPLACE INTO cached_goals (data, updated_at) VALUES (?, datetime('now'))",
                (json.dumps(goals),)
            )
            db.commit()
            db.close()
        except Exception as e:
            raise ErrorPersistencia(f"No se pudo cachear metas: {e}")
