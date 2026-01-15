"use strict";const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async register(req, res) {
    try {
      const { nome, sobrenome, email, senha } = req.body;

      console.log("📩 Dados recebidos no Register:", req.body);

      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ error: "E-mail já está em uso." });
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      const newUser = await User.create({
        nome,
        sobrenome,
        email,
        senha: hashedPassword,
        cargo: "user",
        foto_perfil: null
      });

      console.log("✅ Usuário criado:", newUser.toJSON());

      return res.status(201).json({ message: "Usuário registrado com sucesso!" });

    } catch (error) {
      console.error("❌ Erro no register:", error);
      return res.status(500).json({ error: "Erro ao registrar usuário." });
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
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
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
      const { nome, sobrenome, cargo } = req.body;
      const { id } = req.params;

      await User.update(
        { nome, sobrenome, cargo },
        { where: { id } }
      );

      return res.json({ message: "Usuário atualizado!" });

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

      await User.update(
        { foto_perfil: req.file.filename },
        { where: { id } }
      );

      return res.json({
        message: "Foto de perfil atualizada!",
        file: req.file.filename
      });

    } catch (error) {
      console.error("❌ Erro no upload:", error);
      return res.status(500).json({ error: "Erro ao atualizar foto." });
    }
  },

  async me(req, res) {
    try {
      const user = await User.findByPk(req.userId);

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
