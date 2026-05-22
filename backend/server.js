const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'http://localhost:*'],
    },
  },
  crossOriginResourcePolicy: false,
}));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Subscription Box Management System API' });
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/subscriptions', require('./src/routes/subscriptionRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/shipments', require('./src/routes/shipmentRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/feedback', require('./src/routes/feedbackRoutes'));
app.use('/api/preferences', require('./src/routes/preferenceRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/boxes', require('./src/routes/boxRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }
  res.status(statusCode).json({ message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
