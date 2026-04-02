import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Routes
import authRoutes from './routes/authRoutes.js';
import helperRoutes from './routes/helperRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // allow all origins for dev
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a personal room based on User/Helper ID
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    // Helper sends location update
    socket.on('location_update', ({ helperId, userId, location }) => {
        // Relay to the specific user tracking this helper
        io.to(userId).emit('helper_location', { helperId, location });
    });

    // Booking status update
    socket.on('booking_update', ({ bookingId, userId, helperId, status }) => {
        // Notify both parties
        io.to(userId).emit('booking_status', { bookingId, status });
        io.to(helperId).emit('booking_status', { bookingId, status });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
