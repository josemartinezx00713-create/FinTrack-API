import os
import requests
from typing import Any, Optional
from services.ports import IHttpClient
from models.exceptions import ApiCaidaError, DatosNoEncontradosError

API_URL = os.environ.get("FINTRACK_API_URL", "http://localhost:3000")

class HttpClient(IHttpClient):
    def __init__(self, base_url: str = API_URL):
        self.base_url = base_url

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def get(self, path: str, params: Optional[dict] = None) -> Any:
        try:
            r = requests.get(self._url(path), params=params, timeout=10)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.ConnectionError:
            raise ApiCaidaError()
        except requests.exceptions.Timeout:
            raise ApiCaidaError("La API no respondió a tiempo.")
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                raise DatosNoEncontradosError()
            raise ApiCaidaError(f"Error HTTP {e.response.status_code}")

    def post(self, path: str, json: dict) -> Any:
        try:
            r = requests.post(self._url(path), json=json, timeout=10)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.ConnectionError:
            raise ApiCaidaError()
        except requests.exceptions.Timeout:
            raise ApiCaidaError("La API no respondió a tiempo.")

    def patch(self, path: str, json: dict) -> Any:
        try:
            r = requests.patch(self._url(path), json=json, timeout=10)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.ConnectionError:
            raise ApiCaidaError()
        except requests.exceptions.Timeout:
            raise ApiCaidaError("La API no respondió a tiempo.")

    def delete(self, path: str) -> Any:
        try:
            r = requests.delete(self._url(path), timeout=10)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.ConnectionError:
            raise ApiCaidaError()
        except requests.exceptions.Timeout:
            raise ApiCaidaError("La API no respondió a tiempo.")

    def check_status(self) -> bool:
        try:
            r = requests.get(self._url("/"), timeout=3)
            return r.status_code == 200
        except Exception:
            return False
