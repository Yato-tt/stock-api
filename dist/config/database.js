"use strict";const path = require('path');
require('dotenv').config({
    // Volta dois diretórios (de dist/config para STOCK-API)
    path: path.resolve(__dirname, '..', '..', '.env')
});
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    define: {
      timestamps: true,
      underscored: true,
  },
  }
);

module.exports = sequelize;
