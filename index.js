// Importación de Módulos
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Blog = require('./models/blog')
const blog = require('./models/blog')

// Middlewares globales
app.use(express.static('dist'))
app.use(cors());
app.use(express.json());



// Middleware para registrar información sobre cada solicitud al servidor.
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method) // Muestra el método HTTP (GET, POST, etc.).
    console.log('Path:  ', request.path)   // Muestra la ruta de la solicitud.
    console.log('Body:  ', request.body)   // Muestra el cuerpo de la solicitud.
    console.log('---')
    next() // Pasa el control al siguiente middleware.
  }
  // Middleware global
  app.use(requestLogger);



// Controladores de Ruta
// Obtener todos los blogs  
  app.get('/api/blogs', (request, response, next) => {
    Blog.find({}).then(blogs => {
      response.json(blogs)
    })
    .catch(error => next(error))
  })

  // Obtener la informacion de los blogs
  app.get('/info', (request, response, next) => {
    const date = new Date()

    Blog.countDocuments()
    .then((count) => {
      response.send(`
        <p>There are ${count} blogs</p>
        <p>${date}</p>
        `)
    })
    .catch(error => next(error))
  })

// Agregar nuevo blog
app.post('/api/blogs', (request, response, next) => {
  const { title, author, url } = request.body;

  if (!title || !author || !url) {
    return response.status(400).json({ error: 'Title, author, and URL are required.' });
  }

  const blog = new Blog({
    title,
    author,
    url,
    like: 0,
  });

  blog
    .save()
    .then(savedBlog => {
      response.status(201).json(savedBlog);
    })
    .catch(error => next(error))
});

// Obtener un blog por ID específico
app.get('/api/blogs/:id', (request, response, next) => {
  Blog.findById(request.params.id).then(blog =>{
    if (blog) {
    response.status(200).json(blog);
  } else {
    response.status(404).json({error: 'Blog no encontrado'});
  }
  })
  .catch(error => next(error))
});

// Actualizar un blog (parcial o completamente)
app.put('/api/blogs/:id', (request, response, next) => {
  const { title, author, url, like } = request.body;

  // Crear un objeto solo con los campos definidos
  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (author !== undefined) updateFields.author = author;
  if (url !== undefined) updateFields.url = url;
  if (like !== undefined) updateFields.like = like;

  // Verificar que hay algo para actualizar
  if (Object.keys(updateFields).length === 0) {
    return response.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
  }

  Blog.findByIdAndUpdate(
    request.params.id,
    { $set: updateFields }, // Solo actualiza los campos proporcionados
    {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Aplica las validaciones del esquema
      context: 'query', // Contexto necesario para las validaciones en actualizaciones
    }
  )
    .then((updatedBlog) => {
      if (updatedBlog) {
        response.json(updatedBlog);
      } else {
        response.status(404).json({ error: 'Blog no encontrado' });
      }
    })
    .catch(error => next(error))
});

// Eliminar un blog
app.delete('/api/blogs/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
  .then (result => {
    response.status(202).end()
  })
  .catch(error => next(error))
})

  // Middleware para manejar solicitudes a endpoints desconocidos.
  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' }) // Devuelve un error 404 si la ruta no existe.
  }

// Manejo de errores Sentry
const errorHandler = (error, request, response, next) => {
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);

  // Manejo de errores por tipo
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'ID malformateado' });
  } 

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  if (error.code === 11000) {
    // Error por índice duplicado en MongoDB
    return response.status(409).json({ error: 'El valor ya existe. No se permiten duplicados.' });
  }

  if (error.name === 'MongoServerError') {
    return response.status(500).json({ error: 'Error del servidor de base de datos' });
  }

  // Errores genéricos
  return response.status(500).json({ error: 'Error interno del servidor' });

  next(error)
};


// Middleware global para manejar endpoints desconocidos
app.use(unknownEndpoint);
// Middleware para manehar errores
app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

  
  
