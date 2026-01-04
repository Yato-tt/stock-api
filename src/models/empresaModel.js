const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empresa = sequelize.define("Empresa", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
}, {
  tableName: "empresas"
});

module.exports = Empresa;
