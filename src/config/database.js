const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '..', '.env')
});
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.DB_DIALECT === 'postgres' || isProduction;

let sequelize;

if (usePostgres) {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL não definida para PostgreSQL');
    process.exit(1);
  }

  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  });

  console.log('🐘 Usando PostgreSQL (Supabase)');

} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      define: {
        timestamps: true,
        underscored: true,
      },
    }
  );

  console.log('🐬 Usando MySQL (Desenvolvimento)');
}

module.exports = sequelize;
