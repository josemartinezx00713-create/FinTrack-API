export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "FinTrack API",
    version: "1.0.0",
    description: "API RESTful para el sistema de gestión financiera FinTrack. Esta API permite administrar transacciones (ingresos y gastos), establecer y monitorear presupuestos mensuales, gestionar metas de ahorro y consultar métricas avanzadas y estadísticas detalladas sobre el flujo de dinero."
  },
  paths: {
    "/transactions": {
      get: {
        summary: "Listar transacciones",
        description: "Obtiene una lista de todas las transacciones, con la capacidad de filtrar por mes, categoría o tipo de transacción.",
        parameters: [
          { name: "month", in: "query", schema: { type: "string" }, description: "Filtrar por mes (Formato: YYYY-MM)" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Filtrar por categoría (ej. 'Alimentación')" },
          { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] }, description: "Filtrar por tipo: ingreso (income) o gasto (expense)" },
          { name: "limit", in: "query", schema: { type: "integer" }, description: "Máximo de registros a devolver (paginación)" },
          { name: "offset", in: "query", schema: { type: "integer" }, description: "Número de registros a saltar (paginación)" }
        ],
        responses: {
          "200": { description: "Lista de transacciones devuelta exitosamente" }
        }
      },
      post: {
        summary: "Crear transacción",
        description: "Registra una nueva transacción de ingreso o gasto en el sistema.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number", description: "El monto de la transacción" },
                  type: { type: "string", enum: ["income", "expense"], description: "Tipo de transacción" },
                  category: { type: "string", description: "Categoría de la transacción" },
                  description: { type: "string", description: "Nota o descripción breve" },
                  date: { type: "string", description: "Fecha de la transacción (Formato: YYYY-MM-DD)" },
                  currency: { type: "string", description: "Divisa utilizada (ej. MXN, USD)" }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Transacción creada exitosamente" } }
      }
    },
    "/transactions/{id}": {
      patch: {
        summary: "Actualizar transacción",
        description: "Modifica parcialmente los datos de una transacción existente usando su ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID único de la transacción a actualizar" }],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } }
        },
        responses: { "200": { description: "Transacción actualizada correctamente" } }
      },
      delete: {
        summary: "Eliminar transacción",
        description: "Borra una transacción de forma permanente usando su ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID único de la transacción a eliminar" }],
        responses: { "200": { description: "Transacción eliminada correctamente" } }
      }
    },
    "/stats/summary": {
      get: {
        summary: "Obtener resumen general",
        description: "Devuelve los totales de ingresos, gastos y el balance neto para un mes específico.",
        parameters: [{ name: "month", in: "query", schema: { type: "string" }, description: "Mes a consultar (Formato: YYYY-MM)" }],
        responses: { "200": { description: "Resumen estadístico devuelto exitosamente" } }
      }
    },
    "/stats/by-category": {
      get: {
        summary: "Gastos agrupados por categoría",
        description: "Devuelve la suma total de gastos agrupados por cada una de las categorías para un mes determinado, ideal para gráficos de pastel.",
        parameters: [{ name: "month", in: "query", schema: { type: "string" }, description: "Mes a consultar (Formato: YYYY-MM)" }],
        responses: { "200": { description: "Datos agrupados devueltos exitosamente" } }
      }
    },
    "/stats/trends": {
      get: {
        summary: "Tendencias históricas",
        description: "Devuelve el historial de gastos e ingresos de los últimos meses, permitiendo visualizar la evolución financiera a lo largo del tiempo.",
        parameters: [{ name: "months", in: "query", schema: { type: "string" }, description: "Número límite de meses en el pasado a consultar (por defecto: 6)" }],
        responses: { "200": { description: "Datos de tendencias devueltos exitosamente" } }
      }
    },
    "/stats/top-expenses": {
      get: {
        summary: "Gastos principales",
        description: "Obtiene una lista de las transacciones individuales con los montos más altos (los mayores gastos) de un mes en particular.",
        parameters: [
          { name: "month", in: "query", schema: { type: "string" }, description: "Mes a consultar (Formato: YYYY-MM)" },
          { name: "limit", in: "query", schema: { type: "string" }, description: "Cantidad máxima de transacciones a devolver (por defecto: 5)" }
        ],
        responses: { "200": { description: "Top de gastos devuelto exitosamente" } }
      }
    },
    "/stats/heatmap": {
      get: {
        summary: "Mapa de calor de actividad diaria",
        description: "Proporciona datos que muestran en qué días de la semana se realizan más gastos durante un mes específico.",
        parameters: [{ name: "month", in: "query", schema: { type: "string" }, description: "Mes a consultar (Formato: YYYY-MM)" }],
        responses: { "200": { description: "Datos de actividad diaria devueltos exitosamente" } }
      }
    },
    "/budgets": {
      get: {
        summary: "Listar presupuestos",
        description: "Devuelve todos los límites presupuestarios definidos, opcionalmente filtrados por un mes específico.",
        parameters: [{ name: "month", in: "query", schema: { type: "string" }, description: "Mes a consultar (Formato: YYYY-MM)" }],
        responses: { "200": { description: "Lista de presupuestos obtenida exitosamente" } }
      },
      post: {
        summary: "Crear nuevo presupuesto",
        description: "Define un límite máximo de gasto para una categoría específica en un mes determinado.",
        requestBody: {
          content: { "application/json": { schema: {
            type: "object",
            properties: {
              category: { type: "string", description: "Categoría objetivo del presupuesto" },
              limitAmount: { type: "number", description: "Monto máximo permitido" },
              month: { type: "string", description: "Mes de validez del presupuesto (Formato: YYYY-MM)" }
            }
          } } }
        },
        responses: { "201": { description: "Presupuesto creado con éxito" } }
      }
    },
    "/budgets/status": {
      get: {
        summary: "Estado de alcance de presupuestos",
        description: "Cruza la información de los presupuestos definidos y las transacciones reales para mostrar qué porcentaje del límite se ha consumido en un mes.",
        parameters: [{ name: "month", in: "query", required: true, schema: { type: "string" }, description: "Mes a calcular (Formato: YYYY-MM)" }],
        responses: { "200": { description: "Estado de ejecución presupuestal devuelto exitosamente" } }
      }
    },
    "/budgets/{id}": {
      patch: {
        summary: "Actualizar presupuesto",
        description: "Modifica información o límite de un presupuesto usando su ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID del presupuesto" }],
        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "Presupuesto actualizado correctamente" } }
      },
      delete: {
        summary: "Eliminar presupuesto",
        description: "Borra permanentemente un presupuesto establecido.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID del presupuesto" }],
        responses: { "200": { description: "Presupuesto eliminado correctamente" } }
      }
    },
    "/goals": {
      get: {
        summary: "Listar metas de ahorro",
        description: "Devuelve una lista de todos los objetivos y metas de ahorro configurados en el sistema.",
        responses: { "200": { description: "Metas de ahorro obtenidas exitosamente" } }
      },
      post: {
        summary: "Crear meta de ahorro",
        description: "Añade un nuevo objetivo financiero al cual aportar dinero periódicamente.",
        requestBody: {
          content: { "application/json": { schema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nombre o propósito de la meta (ej. 'Comprar Laptop')" },
              target: { type: "number", description: "Monto total objetivo a alcanzar" },
              current: { type: "number", description: "Dinero ahorrado inicialmente" },
              deadline: { type: "string", description: "Fecha límite deseada (Formato: YYYY-MM-DD)" }
            }
          } } }
        },
        responses: { "201": { description: "Meta de ahorro registrada exitosamente" } }
      }
    },
    "/goals/{id}/deposit": {
      patch: {
        summary: "Depositar fondos a meta",
        description: "Añade un monto específico de dinero al ahorro acumulado de una meta existente.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID de la meta de ahorro" }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { amount: { type: "number", description: "Monto a depositar" } } } } } },
        responses: { "200": { description: "Depósito registrado y meta actualizada" } }
      }
    },
    "/goals/{id}": {
      delete: {
        summary: "Eliminar meta de ahorro",
        description: "Borra permanentemente una meta financiera del sistema.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID de la meta de ahorro" }],
        responses: { "200": { description: "Meta eliminada correctamente" } }
      }
    }
  }
};
