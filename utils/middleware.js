// Importación del módulo logger
const logger = require('./logger')

// Middleware: requestLogger
const requestLogger = (request, response, next) => {
  // Registra información sobre cada solicitud HTTP que llega al servidor
  logger.info('Method:', request.method) // El método HTTP (por ejemplo, GET, POST).
  logger.info('Path:  ', request.path) // La ruta de la solicitud (por ejemplo, /api/blogs).
  logger.info('Body:  ', request.body) // El cuerpo de la solicitud, si existe (útil en solicitudes POST o PUT).
  logger.info('---') // Marca el final del registro para separar solicitudes.
  next() // Llama a la siguiente función en el pipeline de middlewares
}

// Middleware: unknownEndpoint
const unknownEndpoint = (request, response) => { // Maneja solicitudes que llegan a rutas no definidas en el servidor
  response.status(404).send({ error: 'unknown endpoint' }) // send({ error: 'unknown endpoint' }): Un mensaje JSON explicando el error.
}

// Middleware: errorHandler
const errorHandler = (error, request, response, next) => { // Maneja errores que ocurren en el servidor y los registra
  logger.error(error.message) // Registra el mensaje del error

  if (error.name === 'CastError') { // Ocurre si se pasa un ID inválido (malformateado) en una consulta a la base de datos.
    return response.status(400).send({ error: 'malformatted id' }) // Devuelve un estado 400 (Solicitud incorrecta) con un mensaje JSON.
  } else if (error.name === 'ValidationError') { // Ocurre cuando un modelo de Mongoose no pasa las validaciones definidas en el esquema.
    return response.status(400).json({ error: error.message }) // Devuelve un estado 400 con el mensaje de error
  }

  next(error) // Si el error no es manejado por los casos anteriores, lo pasa al siguiente middleware de manejo de errores.
}

  // Exportación de los middlewares
module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}