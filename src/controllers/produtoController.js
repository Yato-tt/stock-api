const Produtos = require('../models/produtoModel.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  async create(req, res) {
    try {
      const { nome, descricao, preco, quantidade, empresa_id, fornecedor_id } = req.body;

      const erros = [];

      const nomeCheck = nome ? String(nome).trim().toLowerCase() : '';
      const descCheck = descricao ? String(descricao).trim() : '';
      const precoCheck = preco !== undefined ? parseFloat(preco) : NaN;
      const qtdCheck = quantidade !== undefined ? parseInt(quantidade) : NaN;

      if (!nomeCheck) {
        erros.push('O campo nome é obrigatório');
      } else if (nomeCheck.length < 3 || nomeCheck.length > 100) {
        erros.push('O campo nome deve conter entre 6 e 100 caracteres');
      }

      if (descCheck) {
        if (descCheck.length < 3 || descCheck.length > 255) {
          erros.push('O campo deve conter entre 6 e 255 caracteres');
        }
      }

      if (preco === undefined || preco === null || String(preco).trim() === '') {
        erros.push('O campo preço é obrigatório');
      } else if (Number.isNaN(precoCheck) || precoCheck < 0) {
        erros.push('O preço deve ser um valor válido! (Maior ou igual a zero)');
      }

      if (quantidade === undefined || quantidade === null || String(quantidade).trim() === '') {
        erros.push('O campo quantidade é obrigatório');
      } else if (!Number.isInteger(qtdCheck) || qtdCheck < 0) {
        erros.push('A quantidade deve ser superior ou igual a zero!');
      }

      if (erros.length > 0) {
        return res.status(400).json({ erros });
      }

      const produtoExist = await Produtos.findOne({ where: {nome: nome } });
      if (produtoExist) {
        return res.status(400).json({ message: 'Produto já cadastrado!' });
      }

      const produtos = await Produtos.create({ nome: nomeCheck, descricao: descCheck, preco: precoCheck, quantidade: qtdCheck, empresa_id, fornecedor_id });
      res.status(201).json(produtos);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao cadastrar produto: ', error: e.message });
    }
  },

  async lista(req, res) {
    try {
      // const produtos = await Produtos.findAll({ attributes: ['id', 'nome', 'descricao', 'preco', 'quantidade']});

      const produtos = await Produtos.findAll({
        where: { empresa_id: req.user.empresa_id },
        attributes: ['id', 'nome', 'descricao', 'preco', 'quantidade', 'foto']
      });

      res.json(produtos);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao carregar produtos: ', e });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produtos.findOne({
        where: {
          id,
          empresa_id: req.user.empresa_id
        },
        attributes: ['id', 'nome', 'descricao', 'preco', 'quantidade', 'foto', 'empresa_id', 'fornecedor_id']
      });

      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (e) {
      res.status(500).json({ message: 'Erro ao buscar produto: ', e });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, quantidade } = req.body;

      const produto = await Produtos.findByPk(id);

      if (!produto) {
        return res.status(400).json({ message: 'Produto não encontrado' });
      }

      if (produto.empresa_id !== req.user.empresa_id) {
        return res.status(403).json({ message: 'Você não tem permissão para editar este produto' });
      }

      if (nome) produto.nome = String(nome).trim().toLowerCase();
      if (descricao) produto.descricao = String(descricao).trim().toLowerCase();
      if (preco !== undefined) produto.preco = parseFloat(preco);
      if (quantidade !== undefined) produto.quantidade = parseInt(quantidade);

      await produto.save();

      res.status(200).json({ message: 'Dados atualizados com sucesso' });

    } catch (e) {
      res.status(500).json({ message: 'Erro ao atualizar item: ', e });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produtos.findByPk(id);

      if (!produto) {
        return res.status(400).json({ message: 'Produto não encontrado' });
      }

      if (produto.empresa_id !== req.user.empresa_id) {
        return res.status(403).json({ message: 'Você não tem permissão para excluir este produto' });
      }

      await produto.destroy();

      res.status(200).json({ message: 'Produto excluído!' });

    } catch (e) {
      res.status(500).json({ message: 'Erro ao deletar produto: ', e });
    }
  },

  async uploadFoto(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'Nenhuma imagem enviada' });
      }

      const produto = await Produtos.findByPk(id);
      if (!produto) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      if (produto.empresa_id !== req.user.empresa_id) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: 'Você não tem permissão para alterar este produto' });
      }

      if (produto.foto) {
        const oldFotoPath = path.join(__dirname, '..', produto.foto);
        if (fs.existsSync(oldFotoPath)) {
          fs.unlinkSync(oldFotoPath);
        }
      }

      produto.foto = req.file.path;
      await produto.save();

      res.status(200).json({
        message: 'Foto do produto atualizada com sucesso!',
        foto: produto.foto
      });

    } catch (error) {
      console.error('Erro no uploadFoto:', error);
      res.status(500).json({
        message: 'Erro ao fazer upload da foto',
        error: error.message
      });
    }
  }

};
