// Modelo para representar a los usuarios
// Importa el modulo Mongoose para interactuar con la base de datos
const mongoose = require('mongoose')

// Esquema para representar a los usuarios
const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  // Matriz ID con los identificadores de Usuarios
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
})

// Configura cómo se debe transformar el usuario cuando se convierta a formato JSON (por ejemplo, al enviarla a través de una API).
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)
module.exports = User