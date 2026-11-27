const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const PRODUCTS_ROOM = 'products';

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  });

  // Reject the connection unless the client sends a valid JWT: io(url, { auth: { token } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication failed'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userType = decoded.type;
      socket.user = decoded; // { id, type }
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId || socket.user?.id;
    const userType = socket.userType || socket.user?.type;
    console.log(`User ${userId} connected (socket ${socket.id})`);

    // Extended Requirement 1: Every connected admin joins 'admins' room
    socket.join(`user:${userId}`);
    if (userType === 'admin') {
      socket.join('admins');
    }

    // The client tells us when it opens / leaves the Products page,
    // so updates only go to users who are currently looking at it
    socket.on('products:join', () => {
      socket.join(PRODUCTS_ROOM);
      console.log(`User ${userId} joined room "${PRODUCTS_ROOM}"`);
    });

    socket.on('products:leave', () => {
      socket.leave(PRODUCTS_ROOM);
      console.log(`User ${userId} left room "${PRODUCTS_ROOM}"`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected (socket ${socket.id})`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
}

module.exports = { initSocket, getIO, PRODUCTS_ROOM };
