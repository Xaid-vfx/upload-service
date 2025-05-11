require('dotenv').config();
const express = require('express');
const deployRoutes = require('./routes/deploy');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/', deployRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST http://localhost:${PORT}/deploy`);
  // console.log(`  GET  http://localhost:${PORT}/deploy/:id/status`);
}); 