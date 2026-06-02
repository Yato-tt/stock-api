const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '..', '.env')
});
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.DB_DIALECT === 'postgres';

const sharedDefine = {
  timestamps: true,
  underscored: true,
};

let sequelize;

if (usePostgres) {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('DATABASE_URL não configurada');
    process.exit(1);
  }

  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      connectTimeout: 60000
    },
    logging: false,
    define: sharedDefine,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  });

} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
      define: sharedDefine,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
