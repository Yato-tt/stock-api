const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const produtoController = require('../controllers/produtoController.js');
const auth = require('../middlewares/authMiddleware.js');

const storageProdutos = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/produtos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'produto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProduto = multer({
  storage: storageProdutos,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  }
});

router.get('/', auth, produtoController.lista);
router.get('/:id', auth, produtoController.buscarPorId);
router.post('/', auth, produtoController.create);
router.put('/edit/:id', auth, produtoController.update);
router.delete('/delete/:id', auth, produtoController.delete);
router.post('/upload-photo/:id', auth, uploadProduto.single('foto'), produtoController.uploadFoto);

module.exports = router;
