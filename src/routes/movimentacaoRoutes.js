const express = require('express');
const router = express.Router();

const movimentacaoController = require('../controllers/movimentacaoController.js');
const auth = require('../middlewares/authMiddleware.js');

router.get('/', auth, movimentacaoController.lista);
router.get('/:id', auth, movimentacaoController.buscarPorId);
router.get('/produto/:produto_id', auth, movimentacaoController.listaPorProduto);
router.post('/', auth, movimentacaoController.registrar);

module.exports = router;
