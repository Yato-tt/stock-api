const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

module.exports = (req, res, next) => {
  // Suporta token via header Authorization (padrão) ou query param ?token=
  // O query param é necessário para EventSource, que não suporta headers customizados
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length !== 2)          return res.status(401).json({ message: 'Token inválido!' });
    if (!/^Bearer$/i.test(parts[0])) return res.status(401).json({ message: 'Token mal formatado' });
    token = parts[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ message: 'Token não encontrado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded;
    req.userEmail = decoded.email;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
