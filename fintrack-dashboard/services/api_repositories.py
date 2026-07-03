from services.ports import (
    IHttpClient, ITransactionRepository, IBudgetRepository,
    IGoalRepository, IStatsRepository, IExchangeRateRepository
)

class ApiTransactionRepository(ITransactionRepository):
    def __init__(self, http_client: IHttpClient):
        self.http = http_client

    def get_transactions(self, month: str = "", category: str = "", type_: str = "") -> list:
        params = {}
        if month: params["month"] = month
        if category: params["category"] = category
        if type_: params["type"] = type_
        return self.http.get("/transactions", params)

    def create_transaction(self, data: dict) -> dict:
        return self.http.post("/transactions", data)

    def update_transaction(self, id: str, data: dict) -> dict:
        return self.http.patch(f"/transactions/{id}", data)

    def delete_transaction(self, id: str) -> dict:
        return self.http.delete(f"/transactions/{id}")

    def bulk_delete_transactions(self, ids: list[str]) -> dict:
        return self.http.post("/transactions/bulk-delete", {"ids": ids})


class ApiBudgetRepository(IBudgetRepository):
    def __init__(self, http_client: IHttpClient):
        self.http = http_client

    def get_budgets(self, month: str = "") -> list:
        params = {}
        if month: params["month"] = month
        return self.http.get("/budgets", params)

    def get_budget_status(self, month: str) -> list:
        return self.http.get("/budgets/status", {"month": month})

    def create_budget(self, data: dict) -> dict:
        return self.http.post("/budgets", data)

    def update_budget(self, id: str, data: dict) -> dict:
        return self.http.patch(f"/budgets/{id}", data)

    def delete_budget(self, id: str) -> dict:
        return self.http.delete(f"/budgets/{id}")

    def bulk_delete_budgets(self, ids: list[str]) -> dict:
        return self.http.post("/budgets/bulk-delete", {"ids": ids})


class ApiGoalRepository(IGoalRepository):
    def __init__(self, http_client: IHttpClient):
        self.http = http_client

    def get_goals(self) -> list:
        return self.http.get("/goals")

    def create_goal(self, data: dict) -> dict:
        return self.http.post("/goals", data)

    def deposit_to_goal(self, id: str, amount: float) -> dict:
        return self.http.patch(f"/goals/{id}/deposit", {"amount": amount})

    def delete_goal(self, id: str) -> dict:
        return self.http.delete(f"/goals/{id}")

    def bulk_delete_goals(self, ids: list[str]) -> dict:
        return self.http.post("/goals/bulk-delete", {"ids": ids})


class ApiStatsRepository(IStatsRepository):
    def __init__(self, http_client: IHttpClient):
        self.http = http_client

    def get_summary(self, month: str) -> dict:
        return self.http.get("/stats/summary", {"month": month})

    def get_category_stats(self, month: str) -> dict:
        return self.http.get("/stats/by-category", {"month": month})

    def get_trends(self, months: int = 6) -> list:
        return self.http.get("/stats/trends", {"months": str(months)})

    def get_top_expenses(self, month: str, limit: int = 5) -> list:
        return self.http.get("/stats/top-expenses", {"month": month, "limit": str(limit)})

    def get_heatmap(self, month: str) -> dict:
        return self.http.get("/stats/heatmap", {"month": month})


class ApiExchangeRateRepository(IExchangeRateRepository):
    def __init__(self, http_client: IHttpClient):
        self.http = http_client

    def get_exchange_rates(self) -> dict:
        return self.http.get("/exchange-rates")
