const app = require('./app') // Importa la aplicación Express real
const config = require('./utils/config') // Importa la configuración de la variable de entorno
const logger = require('./utils/logger') // Importa el módulo para las impresiones en la consola


app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`) // Imprime un mensaje en la consola confirmando que esl puerto está corriendo
});

  
  
