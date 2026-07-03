import requests
import random
from datetime import datetime, timedelta
import sys

# Forzar salida en utf-8 en caso de Windows
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3000"

# Categorías realistas
INCOME_CATS = ["Salario", "Freelance", "Rendimientos", "Ventas"]
EXPENSE_CATS = ["Alimentación", "Vivienda", "Transporte", "Servicios", "Ocio", "Salud", "Educación", "Ropa"]

def get_random_date(start_date, end_date):
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    return start_date + timedelta(days=random_number_of_days)

def clear_all():
    print("Limpiando datos antiguos...")
    for endpoint in ["transactions", "budgets", "goals"]:
        res = requests.get(f"{BASE_URL}/{endpoint}")
        if res.status_code == 200:
            items = res.json()
            if items:
                ids = [item["id"] for item in items]
                requests.post(f"{BASE_URL}/{endpoint}/bulk-delete", json={"ids": ids})

def seed_data():
    clear_all()
    print("Generando datos realistas...")
    
    today = datetime.now()
    start_date = today - timedelta(days=180) # Últimos 6 meses
    
    # 1. Transacciones (Ingresos y Gastos)
    print("  -> Creando transacciones...")
    # Iterar hasta llegar al mes actual (0 a 6 o 7 iteraciones)
    current_date = start_date
    while current_date <= today:
        # Salario fijo
        requests.post(f"{BASE_URL}/transactions", json={
            "amount": random.uniform(15000, 25000),
            "type": "income",
            "category": "Salario",
            "description": "Pago mensual",
            "date": current_date.replace(day=random.randint(1, 5)).strftime("%Y-%m-%d"),
            "currency": "C$"
        })
        
        # Ingreso extra ocasional
        if random.random() > 0.5:
            requests.post(f"{BASE_URL}/transactions", json={
                "amount": random.uniform(2000, 8000),
                "type": "income",
                "category": random.choice(["Freelance", "Ventas"]),
                "description": "Trabajo extra",
                "date": current_date.replace(day=random.randint(10, 25)).strftime("%Y-%m-%d"),
                "currency": "C$"
            })
            
        # 15-25 gastos por mes
        for _ in range(random.randint(15, 25)):
            cat = random.choice(EXPENSE_CATS)
            amount = random.uniform(50, 800)
            if cat == "Vivienda":
                amount = random.uniform(3000, 6000)
            elif cat == "Servicios":
                amount = random.uniform(500, 1500)
                
            # No generar fechas en el futuro para el mes actual
            max_day = 28
            if current_date.year == today.year and current_date.month == today.month:
                max_day = max(1, today.day)
            
            requests.post(f"{BASE_URL}/transactions", json={
                "amount": round(amount, 2),
                "type": "expense",
                "category": cat,
                "description": f"Gasto en {cat.lower()}",
                "date": current_date.replace(day=random.randint(1, max_day)).strftime("%Y-%m-%d"),
                "currency": "C$"
            })
            
        current_date += timedelta(days=30)

    # Añadir algunas transacciones explicitamente con la fecha de HOY
    print("  -> Añadiendo gastos del día de hoy...")
    for _ in range(3):
        cat = random.choice(["Alimentación", "Transporte", "Ocio"])
        requests.post(f"{BASE_URL}/transactions", json={
            "amount": round(random.uniform(50, 300), 2),
            "type": "expense",
            "category": cat,
            "description": "Gastos de hoy",
            "date": today.strftime("%Y-%m-%d"),
            "currency": "C$"
        })

    # 2. Presupuestos para el mes actual
    print("  -> Creando presupuestos...")
    current_month_str = today.strftime("%Y-%m")
    budgets = {
        "Alimentación": 6000.0,
        "Ocio": 2500.0,
        "Transporte": 1500.0,
        "Vivienda": 5500.0
    }
    for cat, limit in budgets.items():
        requests.post(f"{BASE_URL}/budgets", json={
            "category": cat,
            "limitAmount": limit,
            "month": current_month_str
        })
        
    # Presupuestos mes anterior para que haya historial
    last_month = (today.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
    for cat, limit in budgets.items():
        requests.post(f"{BASE_URL}/budgets", json={
            "category": cat,
            "limitAmount": limit,
            "month": last_month
        })

    # 3. Metas de ahorro
    print("  -> Creando metas de ahorro...")
    goals_data = [
        {"name": "Fondo de Emergencia", "target": 50000.0, "current": 25000.0, "deadline": (today + timedelta(days=180)).strftime("%Y-%m-%d")},
        {"name": "Vacaciones", "target": 15000.0, "current": 4500.0, "deadline": (today + timedelta(days=90)).strftime("%Y-%m-%d")},
        {"name": "Nueva Laptop", "target": 25000.0, "current": 24000.0, "deadline": (today + timedelta(days=30)).strftime("%Y-%m-%d")}
    ]
    
    for g in goals_data:
        # Se crean con current = 0 y luego se hace un deposito
        res = requests.post(f"{BASE_URL}/goals", json={
            "name": g["name"],
            "target": g["target"],
            "deadline": g["deadline"]
        })
        if res.status_code == 201:
            gid = res.json()["id"]
            if g["current"] > 0:
                requests.patch(f"{BASE_URL}/goals/{gid}/deposit", json={"amount": g["current"]})

    print("\n¡Base de datos poblada con éxito con datos realistas!")

if __name__ == "__main__":
    seed_data()
