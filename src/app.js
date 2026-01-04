const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const sequelize = require('./config/database');
require('./models');
const { Empresa } = require('./models');

const userRoute = require('./routes/userRoutes');
const produtoRoute = require('./routes/produtoRoutes');

const port = process.env.PORT || 3000;
const serverHost = process.env.SERVER_HOST || 'localhost';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  `http://${serverHost}:5173`,
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
  `http://${serverHost}:${port}`
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || !isProduction) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DB_DIALECT || 'mariadb'
  });
});

if (!isProduction) {
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
}

// ✅ Inicializar banco
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida');

    const [empresa, created] = await Empresa.findOrCreate({
      where: { id: 1 },
      defaults: {
        nome: 'Empresa Padrão',
        cnpj: '00000000000000'
      }
    });

    if (created) {
      console.log('✅ Empresa padrão criada (ID: 1)');
    } else {
      console.log('✅ Empresa padrão já existe');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error.message);
  }
}

sequelize.sync({ alter: !isProduction }).then(async () => {
  // alter: true em dev, false em produção
  await initDatabase();

  app.listen(port, () => {
    console.log(`🚀 Servidor rodando em: http://${serverHost}:${port}`);
    console.log(`🌐 Cliente permitido: ${clientUrl}`);
    console.log(`📂 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
  });
});
