const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  // Authentication handshake middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const secret = process.env.JWT_SECRET || 'carequeue_super_secret_jwt_key_2026_delhi';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket] User ${user.name} (${user.role}) connected: ${socket.id}`);

    // Automatically join personal user room for private alerts (e.g. token called)
    socket.join(`user:${user._id}`);

    // If hospital staff, join hospital room
    if (user.role === 'staff' && user.hospitalId) {
      socket.join(`hospital:${user.hospitalId}`);
    }

    // If city admin, join city-wide monitoring room
    if (user.role === 'admin') {
      socket.join('city');
    }

    // Dynamic OPD session room subscription
    socket.on('join_session', ({ sessionId }) => {
      if (sessionId) {
        socket.join(`session:${sessionId}`);
        console.log(`[Socket] ${user.name} joined session:${sessionId}`);
      }
    });

    socket.on('leave_session', ({ sessionId }) => {
      if (sessionId) {
        socket.leave(`session:${sessionId}`);
      }
    });

    // Dynamic Admission triage & chat room subscription
    socket.on('join_admission', ({ admissionId }) => {
      if (admissionId) {
        socket.join(`admission:${admissionId}`);
        console.log(`[Socket] ${user.name} joined admission:${admissionId}`);
      }
    });

    socket.on('leave_admission', ({ admissionId }) => {
      if (admissionId) {
        socket.leave(`admission:${admissionId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
