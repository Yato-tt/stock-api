const Movimentacao = require('../models/movimentacaoModel.js');
const Produtos = require('../models/produtoModel.js');
const User = require('../models/userModel.js');
const sse = require('./sseController.js');

const TIPOS_VALIDOS  = ['entrada', 'saida', 'ajuste'];
const MOTIVOS_VALIDOS = ['compra', 'reabastecimento', 'ajuste', 'venda', 'avaria'];

module.exports = {
  async registrar(req, res) {
    try {
      const { produto_id, tipo, quantidade, motivo } = req.body;

      const erros = [];
      const tipoCheck   = tipo   ? String(tipo).trim().toLowerCase()   : '';
      const qtdCheck    = quantidade !== undefined ? parseInt(quantidade) : NaN;
      const motivoCheck = motivo  ? String(motivo).trim().toLowerCase() : null;

      if (!produto_id)                                erros.push('O campo produto é obrigatório');
      if (!tipoCheck || !TIPOS_VALIDOS.includes(tipoCheck))
                                                      erros.push('Tipo inválido');
      if (quantidade === undefined || quantidade === null || String(quantidade).trim() === '')
                                                      erros.push('O campo quantidade é obrigatório');
      else if (!Number.isInteger(qtdCheck) || qtdCheck < 0)
                                                      erros.push('A quantidade deve ser um inteiro não negativo');
      if (motivoCheck && !MOTIVOS_VALIDOS.includes(motivoCheck))
                                                      erros.push('Motivo inválido');

      if (erros.length > 0) return res.status(400).json({ erros });

      const produto = await Produtos.findOne({
        where: { id: produto_id, empresa_id: req.user.empresa_id }
      });

      if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });

      if (tipoCheck === 'saida' && produto.quantidade < qtdCheck) {
        return res.status(400).json({ message: 'Quantidade insuficiente em estoque' });
      }

      const quantidade_anterior = produto.quantidade;

      if      (tipoCheck === 'entrada') produto.quantidade += qtdCheck;
      else if (tipoCheck === 'saida')   produto.quantidade -= qtdCheck;
      else                              produto.quantidade  = qtdCheck; // ajuste

      const quantidade_posterior = produto.quantidade;
      await produto.save();

      const movimentacao = await Movimentacao.create({
        produto_id,
        empresa_id:          req.user.empresa_id,
        user_id:             req.user.id,
        tipo:                tipoCheck,
        quantidade:          qtdCheck,
        motivo:              motivoCheck,
        quantidade_anterior,
        quantidade_posterior,
      });

      // Notifica todos os outros clientes da mesma empresa
      sse.emitir(req.user.empresa_id, 'estoque', { produto_id, quantidade: produto.quantidade });

      res.status(201).json(movimentacao);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao registrar movimentação', error: e.message });
    }
  },

  async lista(req, res) {
    try {
      const movimentacoes = await Movimentacao.findAll({
        where: { empresa_id: req.user.empresa_id },
        attributes: ['id', 'tipo', 'quantidade', 'motivo', 'quantidade_anterior', 'quantidade_posterior', 'created_at'],
        include: [
          { model: Produtos, attributes: ['id', 'nome'] },
          { model: User,     attributes: ['id', 'nome', 'sobrenome'] },
        ],
        order: [['created_at', 'DESC']],
      });
      res.json(movimentacoes);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao carregar movimentações', error: e.message });
    }
  },

  async listaPorProduto(req, res) {
    try {
      const { produto_id } = req.params;

      const produto = await Produtos.findOne({
        where: { id: produto_id, empresa_id: req.user.empresa_id }
      });
      if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });

      const movimentacoes = await Movimentacao.findAll({
        where: { produto_id, empresa_id: req.user.empresa_id },
        attributes: ['id', 'tipo', 'quantidade', 'motivo', 'quantidade_anterior', 'quantidade_posterior', 'created_at'],
        include: [{ model: User, attributes: ['id', 'nome', 'sobrenome'] }],
        order: [['created_at', 'DESC']],
      });
      res.json(movimentacoes);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao carregar movimentações do produto', error: e.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const movimentacao = await Movimentacao.findOne({
        where: { id, empresa_id: req.user.empresa_id },
        attributes: ['id', 'tipo', 'quantidade', 'motivo', 'quantidade_anterior', 'quantidade_posterior', 'created_at'],
        include: [
          { model: Produtos, attributes: ['id', 'nome'] },
          { model: User,     attributes: ['id', 'nome', 'sobrenome'] },
        ],
      });

      if (!movimentacao) return res.status(404).json({ message: 'Movimentação não encontrada' });

      res.json(movimentacao);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao buscar movimentação', error: e.message });
    }
  },
};
