import streamlit as st
from dataclasses import dataclass
from services.http_client import HttpClient
from services.api_repositories import (
    ApiTransactionRepository, ApiBudgetRepository,
    ApiGoalRepository, ApiStatsRepository, ApiExchangeRateRepository
)
from services.cache_service import CacheService
from services.local_repository import LocalRepository
from services.currency_service import CurrencyService, CURRENCIES
from services.data_fetcher import DataFetcherService
from ui.styles import apply_global_css as _apply_css
from ui.navigation import render_sidebar

@dataclass
class Container:
    http_client: HttpClient
    data_fetcher: DataFetcherService
    currency_service: CurrencyService


def build_container() -> Container:
    http_client = HttpClient()
    
    api_tx = ApiTransactionRepository(http_client)
    api_budget = ApiBudgetRepository(http_client)
    api_goal = ApiGoalRepository(http_client)
    api_stats = ApiStatsRepository(http_client)
    api_exchange = ApiExchangeRateRepository(http_client)
    
    cache = CacheService()
    local_repo = LocalRepository(cache, cache, cache)
    
    currency_service = CurrencyService(api_exchange, cache)
    data_fetcher = DataFetcherService(
        api_tx, api_budget, api_goal, api_stats, local_repo,
        cache, cache, cache
    )
    
    return Container(
        http_client=http_client,
        data_fetcher=data_fetcher,
        currency_service=currency_service
    )


def init_container():
    if "di_container" not in st.session_state:
        st.session_state.di_container = build_container()


def get_container() -> Container:
    init_container()
    return st.session_state.di_container


def apply_global_css():
    c = get_container()
    _apply_css()
    render_sidebar(c.http_client, c.currency_service)

def render_connection_status():
    from ui.navigation import _render_connection_status
    _render_connection_status(get_container().http_client)

def render_currency_selector():
    from ui.navigation import _render_currency_selector
    _render_currency_selector(get_container().currency_service)
