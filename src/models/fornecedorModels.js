const { DataTypes, Model }= require('sequelize');
const sequelize = require('../config/database');

const Fornecedor = sequelize.define("Fornecedor", {
  id: {
    type:DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
},{
  tableName: "fornecedores"
});

module.exports = Fornecedor;
