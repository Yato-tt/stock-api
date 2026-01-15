const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

const sequelize = require('./config/database');

require('./models');
const userRoute = require('./routes/userRoutes');
const produtoRoute = require('./routes/produtoRoutes');

const port = 3000;
const localIP = '192.168.3.203';

const allowedOrigins = [
  'http://localhost:5173',
  `http://${localIP}:5173`,
  'http://127.0.0.1:5173',
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
  `http://${localIP}:${port}`
];

app.use(cors({
  origin: allowedOrigins,
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

const uploadDirs = [
  'uploads',
  'uploads/profiles',
  'uploads/produtos'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Pasta criada: ${dir}`);
  }
});

sequelize.sync().then(() => {
  app.listen(port, () => { console.log(`App: http://${localIP}:${port}`); });
});

