// CONTROLADORES DE RUTA
// Creamos una instancia para importar la función Router de Express
const blogsRouter = require('express').Router()
// Importamos el modelo Blog
const Blog = require('../models/blog')



// Importamos el modulo Middleware
const middleware = require('../utils/middleware')

// Importa la biblioteca de Mongoose, que se utiliza para interactuar con MongoDB.
// Aquí se usa para cerrar la conexión después de las pruebas.
const mongoose = require('mongoose')



// Rutas
// Controladores de Ruta
// Obtener todos los blogs (Usando la función asincrónica async)
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// Obtener la informacion de los blogs
blogsRouter.get('/info', async (request, response) => {
  const date = new Date()
  const count = await Blog.countDocuments()

  response.send(`
    <p>There are ${count} blogs</p>
    <p>${date}</p>
  `)
})



// Agregar nuevo blog
blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { title, author, url } = request.body

  if (!title || !author || !url) {
    return response.status(400).json({ error: 'Title, author, and URL are required.' })
  }


  const user = request.user // Usuario ya extraído por el middleware

  const blog = new Blog({
    title,
    author,
    url,
    like: 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})


// Obtener un blog por ID específico
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})


// Actualizar un blog (parcial o completamente)
blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body
  const id = request.params.id

  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, {
    new: true,
  }).populate('user', { username: 1, name: 1 })

  updatedBlog
    ? response.status(200).json(updatedBlog.toJSON())
    : response.status(404).end()
})


// Eliminar un blog
blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user // Usuario ya extraído por el middleware

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'permission denied' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})



// Exportar el modulo
module.exports = blogsRouter