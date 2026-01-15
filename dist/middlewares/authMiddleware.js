"use strict";const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

require('dotenv').config();

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não encontrado'});

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Token inválido!'});

  const [ scheme, token ] = parts;
  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ message: 'Token mal formatado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido ou expirado. . .' });
  }
}
