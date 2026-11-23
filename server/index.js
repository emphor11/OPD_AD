require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directory for uploaded referral/report photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to requests if needed in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Basic Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'CareQueue API & Socket Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const adminRoutes = require('./routes/admin.routes');
const opdRoutes = require('./routes/opd.routes');
const tokenRoutes = require('./routes/token.routes');
const bedRoutes = require('./routes/bed.routes');
const admissionRoutes = require('./routes/admission.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const medicineRoutes = require('./routes/medicine.routes');
const setupSocket = require('./socket/index');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/opd', opdRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medicines', medicineRoutes);

// Setup Socket.io Rooms and Handshake
setupSocket(io);

// Connect to Database
connectDB();

// Initialize Daily Cron Maintenance Jobs
const startCronJobs = require('./jobs/closeSessions');
startCronJobs();

// Start Server if executed directly
const PORT = process.env.PORT || 5001;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Server] CareQueue backend running on port ${PORT}`);
  });
}

module.exports = { app, server, io };
