// CONTROLADORES DE RUTA
// Creamos una instancia para importar la función Router de Express
const blogsRouter = require('express').Router()
// Importamos el modelo Blog
const Blog = require('../models/blog')

// Rutas
// Controladores de Ruta
// Obtener todos los blogs  
  blogsRouter.get('/', (request, response, next) => {
    Blog.find({}).then(blogs => {
      response.json(blogs)
    })
    .catch(error => next(error))
  })

  // Obtener la informacion de los blogs
  blogsRouter.get('/info', (request, response, next) => {
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
blogsRouter.post('/', (request, response, next) => {
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
blogsRouter.get('/:id', (request, response, next) => {
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
blogsRouter.put('/:id', (request, response, next) => {
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
blogsRouter.delete('/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
  .then (result => {
    response.status(202).end()
  })
  .catch(error => next(error))
})

// Exportar el modulo
module.exports = blogsRouter