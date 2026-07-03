import streamlit as st
from services.ports import (
    ITransactionRepository, IBudgetRepository, IGoalRepository,
    IStatsRepository, ITransactionCache, IBudgetCache, IGoalCache
)
from models.exceptions import ApiCaidaError, DatosNoEncontradosError

class DataFetcherService:
    def __init__(
        self,
        api_tx: ITransactionRepository,
        api_budget: IBudgetRepository,
        api_goal: IGoalRepository,
        api_stats: IStatsRepository,
        local_repo, # LocalRepository
        cache_tx: ITransactionCache,
        cache_budget: IBudgetCache,
        cache_goal: IGoalCache
    ):
        self.api_tx = api_tx
        self.api_budget = api_budget
        self.api_goal = api_goal
        self.api_stats = api_stats
        self.local_repo = local_repo
        self.cache_tx = cache_tx
        self.cache_budget = cache_budget
        self.cache_goal = cache_goal

    # --- Transactions ---
    def get_transactions(self, month: str = "", category: str = "", type_: str = "") -> list:
        try:
            data = self.api_tx.get_transactions(month, category, type_)
            self.cache_tx.cache_transactions(data, month)
            return data
        except ApiCaidaError:
            try:
                data = self.local_repo.get_transactions(month, category, type_)
                st.warning("Usando datos locales (API no disponible)")
                return data
            except DatosNoEncontradosError:
                return []
                
    def create_transaction(self, payload: dict):
        return self.api_tx.create_transaction(payload)
        
    def update_transaction(self, id: str, payload: dict):
        return self.api_tx.update_transaction(id, payload)
        
    def delete_transaction(self, id: str):
        return self.api_tx.delete_transaction(id)
        
    def bulk_delete_transactions(self, ids: list[str]):
        return self.api_tx.bulk_delete_transactions(ids)

    # --- Budgets ---
    def get_budgets(self, month: str = "") -> list:
        try:
            data = self.api_budget.get_budgets(month)
            self.cache_budget.cache_budgets(data, month)
            return data
        except ApiCaidaError:
            try:
                data = self.local_repo.get_budgets(month)
                st.warning("Usando datos locales (API no disponible)")
                return data
            except DatosNoEncontradosError:
                return []
                
    def get_budget_status(self, month: str) -> list:
        try:
            return self.api_budget.get_budget_status(month)
        except ApiCaidaError:
            try:
                data = self.local_repo.get_budget_status(month)
                st.warning("Usando datos locales (API no disponible)")
                return data
            except DatosNoEncontradosError:
                return []
                
    def create_budget(self, payload: dict):
        return self.api_budget.create_budget(payload)
        
    def update_budget(self, id: str, payload: dict):
        return self.api_budget.update_budget(id, payload)
        
    def delete_budget(self, id: str):
        return self.api_budget.delete_budget(id)

    # --- Goals ---
    def get_goals(self) -> list:
        try:
            data = self.api_goal.get_goals()
            self.cache_goal.cache_goals(data)
            return data
        except ApiCaidaError:
            try:
                data = self.local_repo.get_goals()
                st.warning("Usando datos locales (API no disponible)")
                return data
            except DatosNoEncontradosError:
                return []
                
    def create_goal(self, payload: dict):
        return self.api_goal.create_goal(payload)
        
    def deposit_to_goal(self, id: str, amount: float):
        return self.api_goal.deposit_to_goal(id, amount)
        
    def delete_goal(self, id: str):
        return self.api_goal.delete_goal(id)

    # --- Stats ---
    def get_summary(self, month: str) -> dict | None:
        try:
            data = self.api_stats.get_summary(month)
            # Try caching transactions behind the scenes if possible
            try:
                txns = self.api_tx.get_transactions(month)
                if txns:
                    self.cache_tx.cache_transactions(txns, month)
            except Exception:
                pass
            return data
        except ApiCaidaError:
            try:
                data = self.local_repo.get_summary(month)
                st.warning("Usando datos locales (API no disponible)")
                return data
            except DatosNoEncontradosError:
                return None
        except DatosNoEncontradosError:
            return None

    def get_category_stats(self, month: str) -> dict:
        try:
            return self.api_stats.get_category_stats(month)
        except ApiCaidaError:
            try:
                return self.local_repo.get_category_stats(month)
            except DatosNoEncontradosError:
                return {}

    def get_trends(self, months: int = 6) -> list:
        try:
            return self.api_stats.get_trends(months)
        except ApiCaidaError:
            try:
                return self.local_repo.get_trends(months)
            except DatosNoEncontradosError:
                return []

    def get_top_expenses(self, month: str, limit: int = 5) -> list:
        try:
            return self.api_stats.get_top_expenses(month, limit)
        except ApiCaidaError:
            try:
                return self.local_repo.get_top_expenses(month, limit)
            except DatosNoEncontradosError:
                return []
