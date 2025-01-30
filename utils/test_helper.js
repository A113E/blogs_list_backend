// Importa el modelo 'Blog' desde el archivo '../models/blog'
// Este modelo define la estructura de los documentos en la colección correspondiente en MongoDB.
const Blog = require('../models/blog')
// Este modelo define la estructura de los documentos en la colección correspondiente en MongoDB (User).
const User = require('../models/user')

// Define un arreglo de prueba inicial para los blogs
const initialBlogs = [
  {
    title: 'First Blog Test',
    author: 'Arto Hellas',
    url: 'https://test.com',
    like: 3
  },
  {
    title: 'Second Blog Test',
    author: 'Linda Gray',
    url: 'www.test.com',
    like: 1
  }
]



// Define una función asíncrona 'blogsInDb' que recupera todas los blogs
// actualmente almacenadas en la base de datos.
const blogsInDb = async () => {
  // Buscamos todos los blogs en la base de datos
  const blogs = await Blog.find({})

  // Mapea los documentos encontrados y los transforma a su representación JSON.
  // Esto asegura que los datos se devuelvan en un formato legible.
  return blogs.map(blog => blog.toJSON())
}


// Función para buscar todos los usuarios y convertirlos en formato JSON
const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}


// Exportar los modulos
module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb
}