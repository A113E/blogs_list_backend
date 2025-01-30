// Importa el módulo 'test' de Node.js, que proporciona funciones para definir y gestionar pruebas unitarias.
const { test, after, beforeEach } = require('node:test')

// Importa el módulo 'node:assert' para realizar afirmaciones en las pruebas.
const assert = require('node:assert')

// Importa la biblioteca de Mongoose, que se utiliza para interactuar con MongoDB.
// Aquí se usa para cerrar la conexión después de las pruebas.
const mongoose = require('mongoose')

// Importa la biblioteca Supertest, que permite enviar solicitudes HTTP a la aplicación para pruebas.
// Esto facilita la verificación de respuestas de la API.
const supertest = require('supertest')

// Importa la instancia principal de tu aplicación (Express app) desde otro archivo.
// Esta instancia se usa para enviar solicitudes durante las pruebas.
const app = require('../app')

// Importa un archivo auxiliar que contiene funciones y datos para pruebas.
const helper = require('../utils/test_helper')

// Crea una instancia de Supertest basada en la aplicación importada.
// `api` es un objeto que permite enviar solicitudes HTTP a la aplicación Express sin necesidad de iniciar un servidor real.
const api = supertest(app)

// Importamos bcrypt para el manejo de contraseñas (hashing)
const bcrypt = require('bcrypt')

// Importa el modelo 'Blog', que representa los documentos de la colección de blogs en MongoDB.
const Blog = require('../models/blog')
const User = require('../models/user')

// Define una variable global para el token
let token = ''

beforeEach(async () => {
  // Borra todos los documentos existentes en la colección 'Blog'.
  // Deja la colección vacía para garantizar un entorno de prueba limpio.
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  // Crea un nuevo usuario para autenticarse
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()

  // Obtén el token de autenticación para futuras pruebas
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  token = loginResponse.body.token
})

// Prueba que realiza una solicitud HTTP GET a la URL /api/blogs. Verifica que la aplicación de la lista de blogs devuelva la cantidad correcta de publicaciones de blog en formato JSON
test('blogs are returned', async () => {
  // Realiza una solicitud GET para obtener los blogs, incluyendo el token en los encabezados.
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Agrega el token aquí
    .expect(200) // Espera un código de estado HTTP 200
    .expect('Content-Type', /application\/json/) // Verifica que el encabezado 'Content-Type' sea JSON.

  // Verifica que la cantidad de blogs devueltos es la misma que la cantidad inicial de blogs
  const blogsAtEnd = await helper.blogsInDb() // Obtiene los blogs desde la base de datos
  assert.strictEqual(response.body.length, blogsAtEnd.length) // Asegúrate de que la cantidad coincida
  
  // Si deseas verificar el contenido de los blogs, puedes hacer algo como:
  response.body.forEach(blog => {
    assert.ok(blog.title) // Verifica que cada blog tenga un título
    assert.ok(blog.author) // Verifica que cada blog tenga un autor
    assert.ok(blog.url) // Verifica que cada blog tenga una URL
  })
})




// Prueba que verifica que la adición de un blog funcione con un token de autenticación
test('a blog can be added with valid token', async () => {
  const newBlog = {
    title: 'Blog for test only',
    author: 'admin',
    url: 'localhost',
  }
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Usa el token en los encabezados
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
})

// Prueba que verifica que si no se proporciona un token, se obtiene un código de estado 401 Unauthorized
test('blog creation fails with 401 Unauthorized if no token is provided', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'admin',
    url: 'localhost',
  }

  // Realiza la solicitud sin el token
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401) // Espera un código de estado 401
    .expect('Content-Type', /application\/json/)

  // Verifica que el mensaje de error es adecuado
  assert.strictEqual(response.body.error, 'token missing')
})





after(async () => {
  await mongoose.connection.close() // Cierra la conexión a la base de datos MongoDB.
})

