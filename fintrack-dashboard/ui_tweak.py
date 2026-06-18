import streamlit as st
from services.api_client import ApiClient
from services.cache_service import CacheService
from services.currency_service import CurrencyService, CURRENCIES
from ui.styles import apply_global_css as _apply_css
from ui.navigation import render_sidebar

_api_client = ApiClient()
_cache = CacheService()
_currency_service = CurrencyService(_api_client, _cache)


def apply_global_css():
    _apply_css()
    render_sidebar(_api_client, _currency_service)


def get_currency():
    return _currency_service.get_currency_symbol()


def get_currency_code():
    return _currency_service.get_currency_code()


def get_rate():
    return _currency_service.get_rate()


def fmt_money(amount):
    return _currency_service.fmt_money(amount)


def fmt_html_money(amount):
    return _currency_service.fmt_html_money(amount)


def get_currency_string():
    return _currency_service.get_currency_string()


def set_currency_string(symbol):
    return _currency_service.set_currency_string(symbol)


def check_api_status():
    return _api_client.check_status()


def render_connection_status():
    from ui.navigation import _render_connection_status
    _render_connection_status(_api_client)


def render_currency_selector():
    from ui.navigation import _render_currency_selector
    _render_currency_selector(_currency_service)


def get_api_client():
    return _api_client


CURRENCIES = CURRENCIES
