const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  // Store io on global so API routes can emit
  global.io = io

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`Socket ${socket.id} joined conversation:${conversationId}`)
    })

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`)
    })

    // User presence — join their personal room for notifications
    socket.on('join_user', (userId) => {
      socket.join(`user:${userId}`)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })

  const port = process.env.PORT || 3000
  httpServer.listen(port, () => {
    console.log(`> WhyNot ready on http://localhost:${port}`)
  })
})
