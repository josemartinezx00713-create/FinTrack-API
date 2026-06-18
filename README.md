# FinTrack: Sistema Integral de Análisis Financiero Premium

FinTrack es una solución _Full-Stack_ moderna para la gestión y el análisis de finanzas personales. Su diseño combina una potente interfaz inmersiva estilo "Dark Premium" (construida sobre **Streamlit**) con un motor robusto de almacenamiento local mediante una API REST (**Hono.js**) y conversiones de divisa en tiempo real soportadas por servicios en la nube.

---

##  Arquitectura del Sistema

El proyecto opera bajo un ecosistema bifurcado en dos ejes principales que se comunican de forma ininterrumpida por comandos HTTP.

### 1. El Backend (Motor: `fintrack-api`)
Construido utilizando **Hono.js** para ultra-bajo tiempo de respuesta emparejado con persistencia **SQLite** (`fintrack.db`), con esquema tipado, índices y constraints CHECK. Opera de manera centralizada en el puerto `3000`.

**Endpoints Principales:**
* `GET /stats/summary`: Calcula el balance neto mensual, tasas de ahorro e ingresos absolutos para los KPIs globales.
* `GET /stats/trends`: Realiza agregaciones matemáticas de los últimos 6 meses para predecir y contrastar gastos e ingresos.
* `GET /stats/by-category` y `top-expenses`: Realiza agrupaciones de diccionario y ordenamiento reverso para encontrar los eslabones más caros del presupuesto.
* `CRUD /transactions, /budgets, /goals`: Gestiona las inserciones (`POST`), alteraciones específicas (`PATCH`), obtenciones filtradas (`GET`) y limpiezas (`DELETE`).
* `POST /transactions/bulk-delete`, `/budgets/bulk-delete`, `/goals/bulk-delete`: Eliminación múltiple en una sola operación.
* `GET /exchange-rates`, `POST /exchange-rates/refresh`: Tasas de cambio en vivo con caché SQLite.

### 2. El Frontend (Cliente: `fintrack-dashboard`)
Aplicación web robusta propulsada por **Streamlit 1.33.0**, inyectada intensivamente con código de hoja de estilos en cascada (**CSS**) y scripts de Maquetado puro HTML para superar los límites estéticos propios del framework y alcanzar un look vanguardista "Negro Ónix".

---

##  Características y Capacidades de Análisis de la UI

### Panel Principal Interactívo (Dashboard)
El centro de mando neurálgico que analiza y resume.
* **KPIs Diferenciales:** Calcula tu avance con etiquetas de tipo *'Delta'* (ej. `+15% vs Mes Anterior`), cambiando a rojo o verde automáticamente si incumples o aventajas el balance del mes pasado.
* **Geometría Financiera (Plotly):** Produce gráficos de Dona de distribución interactiva con gradientes, además de renderizar ondas estilo _Splines_ para evidenciar curvas de tendencias visuales libres de líneas de cuadrícula sucias.
* **Extracción Top de Gastos:** Escupe al vuelo un Top orgánico inyectado directamente en el esqueleto HTML donde se simulan barras de progreso porcentual y se abrevian los nombres automáticamente para no saturar la vista.

### Gestor Multi-Divisa Interconectado (API Externa)
En lugar de depender de registros manuales en distintas monedas, el sistema rastrea **tiempo vivo**.
* Consumo desde **Exchange Rate API (`open.er-api.com`)**.
* Actualiza a la orden las tasas de conversión relativas a la moneda nativa `USD`.
* La interfaz cachea el resultado en memoria por 60 minutos o detecta un cambio forzado en tus 'preferencias de usuario' (JSON interno de metadatos) para reasterializar por completo toda la interfaz instantáneamente (Euros, Pesos Mexicanos, Yenes, Reales Brasileños, etc).

### Gestión Reactiva de Tablas sin Dataframes Crudos
El sistema emplea un rediseño de usabilidad *Interactiva* que anula las pantallas atiborradas de listados de base de datos planos.  Para **Transacciones, Presupuestos y Metas**, los módulos integran lógicas condicionales cruzadas usando la función de Casillas Ocultas:  
La información de BD (como el *ID* de transacción o los *montos crudos*) transcurre empaquetada pero **invisible** para el ojo humano, sirviendo únicamente como llaves matemáticas al activar dinámicamente cuadros de Actualización / Borrado nativo ("Acción Condicional").

### Motor Exportador de Clase Empresarial (Reportes `XlsxWriter`)
FinTrack no exporta simples CSVs separados por comas que se desvanecen en la ambiguedad de los datos.
* Al pedir el _descargable_, el sistema lanza peticiones masivas al Backend para recuperar historiales y analíticas de forma paralela.
* Emplea `XlsxWriter` para configurar a nivel milimétrico libros de Microsoft Excel multi-hojas.
* **Inteligencia en Tablas**: Redacta las transacciones crudas en la primera página insertando anchos de columna automatizados y celdas con protección de símbolos numéricos (evitando errores parseando dólares a texto).
* **Gráficas Nativas Inyectadas**: Incrusta un panel de lectura de Dashboard nativamente reconocible por MS Office con gráficos de barras de Balance Financiero y Donas con el reporte de categorías sin necesidad del código Python vivo.

---

##  Tecnologías Centrales

| Capa | Herramienta | Aplicación |
| :--- | :--- | :--- |
| **Routing / DB** | Node.js, Hono.js, SQLite (better-sqlite3) | Lectura C.R.U.D de alta velocidad con índices y ACID |
| **Front UI** | Python, Streamlit, HTML/CSS | Interfaz Web Reactiva Dark Premium, CSS Injection |
| **Data Viz** | Plotly | Generación de Cartografía y Analíticas de Gráficas |
| **Exportación** | Pandas, XlsxWriter | Tablas Pivot, Generación Binaria de Documentos Excel Múltiples y Gráficos Nativos |
| **Forex Fetch** | Python `requests` -> REST / Hono.js fetch | Obtención API del _Exchange Rate_ con caché SQLite de 3 niveles |
| **Validación** | Zod (TypeScript) | Schemas de validación en todos los endpoints POST/PATCH |
| **Cache** | SQLite local (frontend) | Caché offline-first para tasas de cambio (24h de validez) |
