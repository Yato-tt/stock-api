const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const sequelize = require('./config/database');
require('./models');
const userRoute = require('./routes/userRoutes');
const produtoRoute = require('./routes/produtoRoutes');
const port = 3000;
const localIP = '192.168.3.203';

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  'http://localhost:5173',
  `http://${localIP}:5173`,
  'http://127.0.0.1:5173',
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
  `http://${localIP}:${port}`,
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !isProduction) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use('/', userRoute);
app.use('/produtos', produtoRoute);
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

sequelize.sync().then(() => {
  const host = isProduction ? '0.0.0.0' : localIP;
  app.listen(port, host, () => {
    console.log(`App: http://${host}:${port}`);
  });
});
