const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movimentacao = sequelize.define('Movimentacao', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  produto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('entrada', 'saida'),
    allowNull: false,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantidade_anterior: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantidade_posterior: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'movimentacoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Movimentacao;
