// Importación de Módulos
const express = require('express')
const app = express()
const cors = require('cors')

// Middlewares globales
app.use(cors());
app.use(express.json());
 

let blogs = [
    {
        "id": "1",
        "title": "Blog New",
        "author": "Arto Hellas Glez",
        "url": "Pubmed,com.nm",
        "like": 3
      },
      {
        "id": "2",
        "title": "HTML is easy. Blog",
        "author": "Love Lonley",
        "url": "Pubmed.com",
        "like": 2
      },
      {
        "id": "3",
        "title": "HTML is easy",
        "author": "Alberto",
        "url": "Pubmed.com",
        "like": 2
      },
      {
        "id": "fbc2",
        "title": "Hey 2",
        "author": "me.too",
        "url": "www.com",
        "like": 2
      }
]

// Middleware para registrar información sobre cada solicitud al servidor.
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method) // Muestra el método HTTP (GET, POST, etc.).
    console.log('Path:  ', request.path)   // Muestra la ruta de la solicitud.
    console.log('Body:  ', request.body)   // Muestra el cuerpo de la solicitud.
    console.log('---')
    next() // Pasa el control al siguiente middleware.
  }

  // Middleware para manejar solicitudes a endpoints desconocidos.
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' }) // Devuelve un error 404 si la ruta no existe.
  }
 
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })
  
  app.get('/api/blogs', (request, response) => {
    response.json(blogs)
  })

  // Middlewares globales
  app.use(requestLogger);
  app.use(unknownEndpoint)
  
  const PORT = 3003
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
  
  
