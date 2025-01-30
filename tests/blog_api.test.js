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

// Importamos el módulo 'jsonwebtoken' para generar y verificar tokens JWT
const jwt = require('jsonwebtoken')

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
  await api
    .get('/api/blogs') // Realiza una solicitud HTTP GET a la URL /api/blogs.
    .expect(200) // Espera un código de estado HTTP 200
    .expect('Content-Type', /application\/json/) // Verifica que el encabezado 'Content-Type' sea JSON.
})

// Prueba que verifica que la propiedad de identificador único de las publicaciones del blog se llame id, de manera predeterminada
test('check that the identifier property is "id" instead of "_id"', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach(blog => {
    assert.ok(blog.id) // Comprueba que "id" está definido
    assert.strictEqual(blog._id, undefined) // Comprueba que "_id" no está presente
  })
})

// Prueba que verifica que se devuelvan todos los blogs
test('all blogs are returned', async () => {
  // Hace una solictud HTTP GET para la URL /api/blogs
  const response = await api.get('/api/blogs')
  // Verifica si el numero de blogs devueltos sea igual al numero de blogs iniciales
  assert.strictEqual(response.body.length, helper.initialBlogs.length) // Utiliza la lista de blogs de prueba en el modulo Helper
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





// Prueba para actualizar un blog
test('a blog can be updated', async () => {
  // Obtiene los blogs iniciales
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  // Define los nuevos valores de 'likes'
  const updatedBlog = {
    like: blogToUpdate.like + 1,
  }

  // Realiza la solicitud PUT para actualizar el blog
  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200) // Espera un estado OK (200)
    .expect('Content-Type', /application\/json/)

  // Verifica que la actualización se refleje en la base de datos
  const blogsAtEnd = await helper.blogsInDb()
  const modifiedBlog = blogsAtEnd.find(b => b.id === blogToUpdate.id)

  assert.strictEqual(modifiedBlog.like, blogToUpdate.like + 1)
})

// Prueba que verifica que si la propiedad likes falta en la solicitud, tendrá el valor 0 por defecto.
test('if likes is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog with no likes',
    author: 'admin',
    url: 'localhost',
  }

  // Realiza una solicitud POST para crear un nuevo blog
  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) // Usa el token en los encabezados
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // Obtiene todos los blogs después de la inserción
  const blogsAtEnd = await helper.blogsInDb()

  // Verifica que el número de blogs haya aumentado en 1
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  // Verifica que el nuevo blog tenga likes = 0
  const addedBlog = blogsAtEnd.find(b => b.title === newBlog.title)
  assert.strictEqual(addedBlog.like, 0)
})

// Prueba que verifica si faltan las propiedades title o url de los datos solicitados, el backend responde a la solicitud con el código de estado 400 Bad Request.
test('if title, author, or url are missing, respond with 400 Bad Request', async () => {
  // Array de los posibles escenarios que deben dar error
  const missingProperties = [
    { title: '', author: 'admin', url: 'localhost' }, // Falta 'title'
    { title: 'Blog with no title', author: '', url: 'localhost' }, // Falta 'author'
    { title: 'Blog with no url', author: 'admin', url: '' }, // Falta 'url'
  ]

  // Iterar sobre todos los escenarios posibles
  for (let props of missingProperties) {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Usa el token en los encabezados
      .send(props)
      .expect(400) // Espera un código de estado 400
      .expect('Content-Type', /application\/json/) // Verifica que el tipo de contenido sea JSON

    // Verifica que la respuesta tenga un mensaje de error
    assert.ok(response.body.error)
  }
})

test('deletion of a blog', async () => {
  let token = null

  const passwordHash = await bcrypt.hash('12345', 10)
  const user = await new User({ username: 'name', passwordHash }).save()

  const userForToken = { username: 'name', id: user.id }
  token = jwt.sign(userForToken, process.env.SECRET)

  const newBlog = {
    title: 'some blog',
    author: 'some author',
    url: 'https://www.example.com',
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  return token
})






after(async () => {
  await mongoose.connection.close() // Cierra la conexión a la base de datos MongoDB.
})

