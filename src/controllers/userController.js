const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {

  async listAll(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['senha'] } // Segurança: não retorna o hash da senha
      });
      return res.json(users);
    } catch (error) {
      console.error("❌ Erro no listAll:", error);
      return res.status(500).json({ error: "Erro ao buscar usuários." });
    }
  },

  async register(req, res) {
    try {
      const { nome, sobrenome, email, senha } = req.body;

      console.log("📩 Dados recebidos no Register:", { nome, sobrenome, email, senha: senha ? '***' : 'AUSENTE' });

      const erros = [];

      if (!nome || String(nome).trim().length === 0) {
        erros.push('Nome é obrigatório');
      }

      if (!sobrenome || String(sobrenome).trim().length === 0) {
        erros.push('Sobrenome é obrigatório');
      }

      if (!email || String(email).trim().length === 0) {
        erros.push('E-mail é obrigatório');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          erros.push('E-mail inválido');
        }
      }

      if (!senha || String(senha).trim().length === 0) {
        erros.push('Senha é obrigatória');
      } else if (String(senha).length < 6) {
        erros.push('Senha deve ter no mínimo 6 caracteres');
      }

      if (erros.length > 0) {
        console.log("❌ Validação falhou:", erros);
        return res.status(400).json({ error: erros.join(', ') });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log("❌ Email já cadastrado:", email);
        return res.status(400).json({ error: "E-mail já está em uso." });
      }

      const hashedPassword = await bcrypt.hash(senha, 10);
      console.log("✅ Senha hasheada com sucesso");

      const newUser = await User.create({
        nome: String(nome).trim(),
        sobrenome: String(sobrenome).trim(),
        email: String(email).trim().toLowerCase(),
        senha: hashedPassword,
        cargo: "user",
        empresa_id: 1,
        foto_perfil: null
      });

      console.log("✅ Usuário criado com ID:", newUser.id);

      return res.status(201).json({
        message: "Usuário registrado com sucesso!",
        user: {
          id: newUser.id,
          nome: newUser.nome,
          sobrenome: newUser.sobrenome,
          email: newUser.email,
          cargo: newUser.cargo
        }
      });
    } catch (error) {
      console.error("❌ Erro no register:", error);
      return res.status(500).json({ error: "Erro ao registrar usuário: " + error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      const validPassword = await bcrypt.compare(senha, user.senha);

      if (!validPassword) {
        return res.status(401).json({ error: "Senha incorreta." });
      }

      const token = jwt.sign(
        { id: user.id, empresa_id: user.empresa_id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Login realizado com sucesso!",
        token,
        user
      });

    } catch (error) {
      console.error("❌ Erro no login:", error);
      return res.status(500).json({ error: "Erro ao fazer login." });
    }
  },

  async update(req, res) {
    try {
      const { nome, sobrenome, cargo, senha } = req.body;
      const { id } = req.params;

      const updateData = {};

      if (nome) updateData.nome = nome;
      if (sobrenome) updateData.sobrenome = sobrenome;
      if (cargo) updateData.cargo = cargo;

      // ✅ Só atualiza senha se foi enviada
      if (senha) {
        updateData.senha = await bcrypt.hash(senha, 10);
      }

      await User.update(updateData, { where: { id } });

      // Buscar usuário atualizado
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['senha'] }
      });

      return res.json({
        message: "Usuário atualizado!",
        user: updatedUser
      });
    } catch (error) {
      console.error("❌ Erro no update:", error);
      return res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      await User.destroy({ where: { id } });

      return res.json({ message: "Usuário excluído!" });

    } catch (error) {
      console.error("❌ Erro no delete:", error);
      return res.status(500).json({ error: "Erro ao excluir usuário." });
    }
  },

  async uploadFotoPerfil(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada." });
      }

      const fotoPath = `uploads/profiles/${req.file.filename}`;

      await User.update(
        { foto_perfil: fotoPath },
        { where: { id } }
      );

      // ✅ BUSCAR USUÁRIO ATUALIZADO
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['senha'] }
      });

      return res.json({
        message: "Foto de perfil atualizada!",
        user: updatedUser // ✅ RETORNAR USUÁRIO COMPLETO
      });
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      return res.status(500).json({ error: "Erro ao atualizar foto." });
    }
  },

  async me(req, res) {
    try {
      // const user = await User.findByPk(req.userId);

      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['senha'] }
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      return res.json(user);

    } catch (error) {
      console.error("❌ Erro no me:", error);
      return res.status(500).json({ error: "Erro ao buscar usuário." });
    }
  }
};
