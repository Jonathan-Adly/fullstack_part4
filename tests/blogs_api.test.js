const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require ('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "Hello, World",
    author: "Jonathan Adly",
    url: "https://reactpatterns.com/",
    likes: 7,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.BlogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const contents = blogsAtEnd.map(n => n.title)
  expect(contents).toContain(
    'Hello, World'
  )
})

test ("blog posts has an id parameter", async() => {
  const blogs = await helper.BlogsInDb()
  expect(blogs[0].id).toBeDefined()
})

test ("A blog with no likes", async() => {
  const blogWithNoLikes = {
    title: "Hello, World",
    author: "Jonathan Adly",
    url: "https://reactpatterns.com/"
  }

  await api
    .post('/api/blogs')
    .send(blogWithNoLikes)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.BlogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const blog = blogsAtEnd.filter(n => n.title === "Hello, World")
  expect(blog[0].likes).toBe(0)
})

test ("A blog with no title", async() => {
  const blogWithNoTitleURL = {
    author: "Jonathan Adly",
    likes: 4
  }

  await api
    .post('/api/blogs')
    .send(blogWithNoTitleURL)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'test',
      name: 'test one',
      password: 'testpass',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'pass',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is < 3 chars', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'te',
      name: 'test one',
      password: 'testpass',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('username and password must be > 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
