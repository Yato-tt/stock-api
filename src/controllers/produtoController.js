const Produtos = require('../models/produtoModel.js');
const fs = require('fs');
const path = require('path');
const sse = require('./sseController.js');

module.exports = {
  async create(req, res) {
    try {
      const { nome, descricao, preco, quantidade, fornecedor_id } = req.body;

      const erros = [];
      const nomeCheck  = nome      ? String(nome).trim().toLowerCase()  : '';
      const descCheck  = descricao ? String(descricao).trim()            : '';
      const precoCheck = preco     !== undefined ? parseFloat(preco)     : NaN;
      const qtdCheck   = quantidade !== undefined ? parseInt(quantidade) : NaN;

      if (!nomeCheck)
        erros.push('O campo nome é obrigatório');
      else if (nomeCheck.length < 3 || nomeCheck.length > 100)
        erros.push('O campo nome deve conter entre 3 e 100 caracteres');

      if (descCheck && (descCheck.length < 3 || descCheck.length > 255))
        erros.push('A descrição deve conter entre 3 e 255 caracteres');

      if (preco === undefined || preco === null || String(preco).trim() === '')
        erros.push('O campo preço é obrigatório');
      else if (Number.isNaN(precoCheck) || precoCheck < 0)
        erros.push('O preço deve ser um valor válido (maior ou igual a zero)');

      if (quantidade === undefined || quantidade === null || String(quantidade).trim() === '')
        erros.push('O campo quantidade é obrigatório');
      else if (!Number.isInteger(qtdCheck) || qtdCheck < 0)
        erros.push('A quantidade deve ser superior ou igual a zero');

      if (erros.length > 0) return res.status(400).json({ erros });

      const produtoExist = await Produtos.findOne({
        where: { nome: nomeCheck, empresa_id: req.user.empresa_id }
      });
      if (produtoExist) return res.status(400).json({ message: 'Produto já cadastrado!' });

      const produto = await Produtos.create({
        nome:          nomeCheck,
        descricao:     descCheck  || null,
        preco:         precoCheck,
        quantidade:    qtdCheck,
        empresa_id:    req.user.empresa_id,
        fornecedor_id: fornecedor_id || 1,
      });

      sse.emitir(req.user.empresa_id, 'catalogo', { acao: 'criado', produto_id: produto.id });

      res.status(201).json(produto);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao cadastrar produto', error: e.message });
    }
  },

  async lista(req, res) {
    try {
      const produtos = await Produtos.findAll({
        where: { empresa_id: req.user.empresa_id },
        attributes: ['id', 'nome', 'descricao', 'preco', 'quantidade', 'foto'],
      });
      res.json(produtos);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao carregar produtos', error: e.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const produto = await Produtos.findOne({
        where: { id, empresa_id: req.user.empresa_id },
        attributes: ['id', 'nome', 'descricao', 'preco', 'quantidade', 'foto', 'empresa_id', 'fornecedor_id'],
      });
      if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });
      res.json(produto);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao buscar produto', error: e.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, quantidade } = req.body;

      const produto = await Produtos.findByPk(id);
      if (!produto)                                   return res.status(400).json({ message: 'Produto não encontrado' });
      if (produto.empresa_id !== req.user.empresa_id) return res.status(403).json({ message: 'Sem permissão' });

      if (nome        !== undefined) produto.nome      = String(nome).trim().toLowerCase();
      if (descricao   !== undefined) produto.descricao = descricao ? String(descricao).trim().toLowerCase() : null;
      if (preco       !== undefined) produto.preco     = parseFloat(preco);
      if (quantidade  !== undefined) produto.quantidade = parseInt(quantidade);

      await produto.save();

      sse.emitir(req.user.empresa_id, 'catalogo', { acao: 'atualizado', produto_id: produto.id });

      res.status(200).json({ message: 'Dados atualizados com sucesso' });
    } catch (e) {
      res.status(500).json({ message: 'Erro ao atualizar item', error: e.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produtos.findByPk(id);
      if (!produto)                                   return res.status(400).json({ message: 'Produto não encontrado' });
      if (produto.empresa_id !== req.user.empresa_id) return res.status(403).json({ message: 'Sem permissão' });

      await produto.destroy();

      sse.emitir(req.user.empresa_id, 'catalogo', { acao: 'deletado', produto_id: parseInt(id) });

      res.status(200).json({ message: 'Produto excluído!' });
    } catch (e) {
      res.status(500).json({ message: 'Erro ao deletar produto', error: e.message });
    }
  },

  async uploadFoto(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem enviada' });

      const produto = await Produtos.findByPk(id);
      if (!produto) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      if (produto.empresa_id !== req.user.empresa_id) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Sem permissão' });
      }

      if (produto.foto) {
        const old = path.join(__dirname, '..', produto.foto);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }

      produto.foto = req.file.path;
      await produto.save();

      sse.emitir(req.user.empresa_id, 'catalogo', { acao: 'atualizado', produto_id: produto.id });

      res.status(200).json({ message: 'Foto atualizada com sucesso!', foto: produto.foto });
    } catch (e) {
      res.status(500).json({ message: 'Erro ao fazer upload da foto', error: e.message });
    }
  }
};
