// Importa el modelo 'Blog' desde el archivo '../models/blog'
// Este modelo define la estructura de los documentos en la colección correspondiente en MongoDB.
const Blog = require('../models/blog')
// Este modelo define la estructura de los documentos en la colección correspondiente en MongoDB (User).
const User = require('../models/user')

// Define un arreglo de prueba inicial para los blogs
const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  },
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