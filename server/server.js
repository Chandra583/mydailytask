require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const progressRoutes = require('./routes/progressRoutes');
const streakRoutes = require('./routes/streakRoutes');
const notesRoutes = require('./routes/notesRoutes');

// Initialize express app
const app = express();

// ============================================================
// CORS Configuration - MUST BE FIRST BEFORE ANYTHING ELSE
// ============================================================
const corsOptions = {
  origin: [
    'https://mydailytasktracker.netlify.app',  // Production frontend
    'http://localhost:5173',                    // Vite local dev
    'http://localhost:3000',                    // React local dev
    'http://127.0.0.1:5173'                     // Vite local dev alt
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token']
};

// Apply CORS - MUST be before routes
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/notes', notesRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Habit Tracker API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
