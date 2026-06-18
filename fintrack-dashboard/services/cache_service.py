import sqlite3
from datetime import datetime

CACHE_DB = "cache_fintrack.db"
BASE_CURRENCY = "NIO"


class CacheService:
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
