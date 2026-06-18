from dataclasses import dataclass
from typing import Optional


@dataclass
class Category:
    id: int
    nombre: str
    tipo: str
    icono: str = ""


@dataclass
class Transaction:
    id: str
    amount: float
    type: str
    category: str
    id_categoria: Optional[int] = None
    description: str = ""
    date: str = ""
    currency: str = "C$"
    created_at: Optional[str] = None


@dataclass
class Budget:
    id: str
    category: str
    limitAmount: float
    month: str
    id_categoria: Optional[int] = None
    created_at: Optional[str] = None


@dataclass
class BudgetStatus(Budget):
    spent: float = 0
    remaining: float = 0
    percentUsed: float = 0


@dataclass
class Goal:
    id: str
    name: str
    target: float
    current: float
    deadline: str
    created_at: Optional[str] = None


@dataclass
class MonthlySummary:
    income: float
    expense: float
    balance: float
    savingsRate: float
