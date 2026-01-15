"use strict";const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },

  sobrenome: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },

  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },

  cargo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "user"
  },

  foto_perfil: {
    type: DataTypes.STRING,
    allowNull: true
  }

}, {
  tableName: "users",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = User;
