// Función que retorna 1
const dummy = (blogs) => {
  return 1
}
// Funcion que suma todos los likes
const totalLikes = (blogs) => {
  const suma = (sum, blog) => sum + blog.likes
  return blogs.length === 0 ? 0 : blogs.reduce(suma, 0)
}
// Función para el blog con más likes
const favoriteBlog = (blogs) => {
  // Verificamos si la lista está vacía 
  if (blogs.length === 0) {
    return null // Si la lista está vacía, retorna null
  }
  // Método Reduce 
  return blogs.reduce((favorite, blog) => {
     return blog.likes > (favorite.likes || 0) ? blog: favorite
  }, blogs[0]) // {} Iniciamos con un array vacío
}
// Función para el autor con más likes
const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null // Retornamos null si no hay blogs
  }

  // Paso 1: Contar los blogs por autor
  const blogCounts = blogs.reduce((counts, blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
    return counts
  }, {})

  // Paso 2: Encontrar al autor con más blogs
  const mostProlific = Object.entries(blogCounts).reduce((topAuthor, [author, count]) => {
    return count > topAuthor.blogs ? { author, blogs: count } : topAuthor
  }, { author: null, blogs: 0 })

  // Paso 3: Devolver el resultado
  return mostProlific
}
// Funcion que devuelve el autor, cuyas publicaciones de blog tienen la mayor cantidad de me gusta
const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null // Retorna null si la lista de blogs está vacía
  }

  // Paso 1: Calcular los likes acumulados por autor
  const likesByAuthor = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + blog.likes
    return acc
  }, {})

  // Paso 2: Encontrar al autor con más likes
  const mostLiked = Object.entries(likesByAuthor).reduce((topAuthor, [author, likes]) => {
    return likes > topAuthor.likes ? { author, likes } : topAuthor
  }, { author: null, likes: 0 })

  // Paso 3: Devolver el resultado
  return mostLiked
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog, 
  mostBlogs, 
  mostLikes
}