import requests
import json
import sys

# Forzar salida en utf-8 en caso de Windows
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3000"

def test_api():
    print("Iniciando pruebas de la API FinTrack...")
    
    # 1. Transactions
    print("\n--- Probando Transacciones ---")
    tx_payload = {
        "amount": 150.5,
        "type": "expense",
        "category": "Comida",
        "description": "Prueba API Transaccion",
        "date": "2026-07-03",
        "currency": "C$"
    }
    r = requests.post(f"{BASE_URL}/transactions", json=tx_payload)
    assert r.status_code == 201, f"POST /transactions falló: {r.text}"
    tx = r.json()
    print("[OK] POST /transactions")
    tx_id = tx["id"]
    
    r = requests.get(f"{BASE_URL}/transactions")
    assert r.status_code == 200, "GET /transactions falló"
    print("[OK] GET /transactions")
    
    r = requests.patch(f"{BASE_URL}/transactions/{tx_id}", json={"amount": 200.0})
    assert r.status_code == 200, "PATCH /transactions falló"
    print("[OK] PATCH /transactions")
    
    r = requests.delete(f"{BASE_URL}/transactions/{tx_id}")
    assert r.status_code == 200, "DELETE /transactions falló"
    print("[OK] DELETE /transactions")

    # 2. Budgets
    print("\n--- Probando Presupuestos ---")
    bg_payload = {
        "category": "Comida",
        "limitAmount": 5000.0,
        "month": "2026-07"
    }
    r = requests.post(f"{BASE_URL}/budgets", json=bg_payload)
    assert r.status_code in [200, 201], f"POST /budgets falló: {r.text}"
    bg = r.json()
    print("[OK] POST /budgets")
    bg_id = bg["id"]
    
    r = requests.get(f"{BASE_URL}/budgets?month=2026-07")
    assert r.status_code == 200, "GET /budgets falló"
    print("[OK] GET /budgets")
    
    r = requests.patch(f"{BASE_URL}/budgets/{bg_id}", json={"limitAmount": 6000.0})
    assert r.status_code == 200, "PATCH /budgets falló"
    print("[OK] PATCH /budgets")
    
    r = requests.delete(f"{BASE_URL}/budgets/{bg_id}")
    assert r.status_code == 200, "DELETE /budgets falló"
    print("[OK] DELETE /budgets")

    # 3. Goals
    print("\n--- Probando Metas de Ahorro ---")
    gl_payload = {
        "name": "Viaje Prueba",
        "target": 1000.0,
        "deadline": "2026-12-31"
    }
    r = requests.post(f"{BASE_URL}/goals", json=gl_payload)
    assert r.status_code == 201, f"POST /goals falló: {r.text}"
    gl = r.json()
    print("[OK] POST /goals")
    gl_id = gl["id"]
    
    r = requests.get(f"{BASE_URL}/goals")
    assert r.status_code == 200, "GET /goals falló"
    print("[OK] GET /goals")
    
    r = requests.patch(f"{BASE_URL}/goals/{gl_id}/deposit", json={"amount": 100.0})
    assert r.status_code == 200, f"PATCH /goals/deposit falló: {r.text}"
    print("[OK] PATCH /goals/:id/deposit")
    
    r = requests.delete(f"{BASE_URL}/goals/{gl_id}")
    assert r.status_code == 200, "DELETE /goals falló"
    print("[OK] DELETE /goals")

    # 4. Stats
    print("\n--- Probando Estadísticas ---")
    r = requests.get(f"{BASE_URL}/stats/summary?month=2026-07")
    assert r.status_code == 200, "GET /stats/summary falló"
    print("[OK] GET /stats/summary")

    r = requests.get(f"{BASE_URL}/stats/by-category?month=2026-07")
    assert r.status_code == 200, "GET /stats/by-category falló"
    print("[OK] GET /stats/by-category")
    
    r = requests.get(f"{BASE_URL}/stats/trends?months=6")
    assert r.status_code == 200, "GET /stats/trends falló"
    print("[OK] GET /stats/trends")

    # 5. Exchange Rates
    print("\n--- Probando Tipos de Cambio ---")
    r = requests.get(f"{BASE_URL}/exchange-rates")
    assert r.status_code == 200, "GET /exchange-rates falló"
    print("[OK] GET /exchange-rates")

    print("\n[ÉXITO] Todas las pruebas de la API pasaron exitosamente!")

if __name__ == "__main__":
    try:
        test_api()
    except AssertionError as e:
        print(f"\n[FALLO] Prueba fallida: {e}")
    except Exception as e:
        print(f"\n[ERROR] Error inesperado: {e}")
