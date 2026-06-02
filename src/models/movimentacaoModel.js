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
    field: 'produto_id',
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'empresa_id',
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  tipo: {
    type: DataTypes.STRING,
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
    field: 'quantidade_anterior',
  },
  quantidade_posterior: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantidade_posterior',
  },
}, {
  tableName: 'movimentacoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Movimentacao;
