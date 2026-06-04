const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');

const Produtos = sequelize.define('Produtos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  preco: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  foto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fornecedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName:  'produtos',
  timestamps: false,   // tabela não tem created_at/updated_at
});

module.exports = Produtos;
