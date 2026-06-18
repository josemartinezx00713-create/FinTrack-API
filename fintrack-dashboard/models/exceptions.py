class ApiCaidaError(Exception):
    """Error cuando la API remota no responde o falla."""
    def __init__(self, message="La API no está disponible. Usando datos locales."):
        self.message = message
        super().__init__(self.message)


class DatosNoEncontradosError(Exception):
    """Error cuando no hay datos disponibles ni en API ni en caché local."""
    def __init__(self, message="No se encontraron datos para esta consulta."):
        self.message = message
        super().__init__(self.message)


class ErrorPersistencia(Exception):
    """Error al leer o escribir en el almacenamiento local."""
    def __init__(self, message="Error en el almacenamiento local de datos."):
        self.message = message
        super().__init__(self.message)
