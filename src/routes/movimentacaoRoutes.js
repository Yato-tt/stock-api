const express = require('express');
const router = express.Router();

const movimentacaoController = require('../controllers/movimentacaoController.js');
const auth = require('../middlewares/authMiddleware.js');

// /produto/:produto_id DEVE vir antes de /:id
// senão o Express captura "produto" como sendo o :id
router.get('/produto/:produto_id', auth, movimentacaoController.listaPorProduto);
router.get('/', auth, movimentacaoController.lista);
router.get('/:id', auth, movimentacaoController.buscarPorId);
router.post('/', auth, movimentacaoController.registrar);

module.exports = router;
