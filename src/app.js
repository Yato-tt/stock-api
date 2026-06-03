const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const sequelize = require('./config/database');
require('./models');
const userRoute = require('./routes/userRoutes');
const produtoRoute = require('./routes/produtoRoutes');
const movimentacaoRoute = require('./routes/movimentacaoRoutes');
const port = 3000;
const localIP = process.env.LOCAL_IP || '192.168.3.203';

const isProduction = process.env.NODE_ENV === 'production';
const isPostgres = process.env.DB_DIALECT === 'postgres';

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
      callback(new Error('Origem não permitida pelo CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'cache-control' , 'Pragma'],
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use('/', userRoute);
app.use('/produtos', produtoRoute);
app.use('/movimentacoes', movimentacaoRoute);
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    dialect: isPostgres ? 'postgres' : 'mariadb/mysql'
  });
});

// Postgres em produção: sem alter (schema gerenciado pelo Railway)
// MariaDB local: alter:true para aplicar mudanças sem recriar tabelas
const syncOptions = isPostgres ? {} : { alter: true };

sequelize.sync(syncOptions)
  .then(() => {
    const host = isProduction ? '0.0.0.0' : localIP;
    app.listen(port, host, () => {
      console.log(`App rodando: http://${host}:${port}`);
      console.log(`Banco: ${isPostgres ? 'PostgreSQL' : 'MariaDB/MySQL'}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao sincronizar banco:', err.message);
    process.exit(1);
  });
