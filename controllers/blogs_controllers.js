// CONTROLADORES DE RUTA
// Creamos una instancia para importar la función Router de Express
const blogsRouter = require('express').Router()
// Importamos el modelo Blog
const Blog = require('../models/blog')

// Importa la biblioteca de Mongoose, que se utiliza para interactuar con MongoDB.
// Aquí se usa para cerrar la conexión después de las pruebas.
const mongoose = require('mongoose');

// Rutas
// Controladores de Ruta
// Obtener todos los blogs (Usando la función asincrónica async) 
  blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
      response.json(blogs)
    })

  // Obtener la informacion de los blogs
blogsRouter.get('/info', async (request, response) => {
  const date = new Date();
  const count = await Blog.countDocuments();

  response.send(`
    <p>There are ${count} blogs</p>
    <p>${date}</p>
  `);
});
  
  

// Agregar nuevo blog
blogsRouter.post('/', async (request, response) => {
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

  const savedBlog = await blog.save()
  
      response.status(201).json(savedBlog)
    })

// Obtener un blog por ID específico
blogsRouter.get('/:id', async (request, response) => {
  const { id } = request.params;

  // Validar si el ID es un ObjectId válido de MongoDB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: 'malformatted id' });
  }

  const blog = await Blog.findById(id);
  if (blog) {
    response.status(200).json(blog);
  } else {
    response.status(404).json({ error: 'Blog no encontrado' });
  }
});


// Actualizar un blog (parcial o completamente)
blogsRouter.put('/:id', async (request, response) => {
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

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { $set: updateFields }, // Solo actualiza los campos proporcionados
    {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Aplica las validaciones del esquema
      context: 'query', // Contexto necesario para las validaciones en actualizaciones
    }
  )
      if (updatedBlog) {
        response.json(updatedBlog);
      } else {
        response.status(404).json({ error: 'Blog no encontrado' });
      }
    })


// Eliminar un blog
blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  })


// Exportar el modulo
module.exports = blogsRouter