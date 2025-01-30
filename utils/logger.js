// Módulo para las las impresiones a la consola
// Creamos una instancia para todos los tipos de impresiones
const logger = {
  // Este objeto contiene varias funciones (info, debug, warn, error) que representan diferentes niveles de logs.

  // Función INFO
  info: (message) => {
    console.log(`[INFO] ${message}`) // Salida: [INFO] Server running on port 3001
  },

  // Función DEBUG
  debug: (message) => {
    console.log(`[DEBUG] ${message}`) // Salida: [DEBUG] Database connection string: mongodb://localhost/test
  },

  // Función WARN
  warn: (message) => {
    console.log(`[WARN] ${message}`) // Salida: [WARN] Deprecated API endpoint accessed.
  },

  // Función ERROR
  error: (message) => {
    console.log(`[ERROR] ${message}`) // Salida: [ERROR] Failed to connect to the database.
  },
}

// Exportar el módulo
module.exports = logger