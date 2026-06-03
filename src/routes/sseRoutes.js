const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware.js');
const sseController = require('../controllers/sseController.js');

router.get('/', auth, sseController.conectar);

module.exports = router;
