const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const auth = require('../middleware/authToken'); // Middleware de autenticação
const jwt = require('jsonwebtoken');
const SECRET = 'seusegredo';

// Rota protegida - NÃO retorna a senha
router.get('/', auth, async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nome', 'email'] // Não retorna senha!
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuários', detalhes: err.message });
  }
});

// Cadastro de usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos' });
    }
    // Opcional: checar se email já existe
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    const novoUsuario = await Usuario.create({ nome, email, senha });
    res.json({ id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar usuário', detalhes: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log(`Tentativa de login para: ${email}`);
    
    // Adicione logs antes da consulta ao banco
    console.log('Iniciando consulta ao banco de dados...');
    
    const usuario = await Usuario.findOne({ where: { email } });
    
    console.log('Consulta concluída:', usuario ? 'Usuário encontrado' : 'Usuário não encontrado');
    
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// Dashboard protegido
router.get('/dashboard', auth, (req, res) => {
  res.json({
    mensagem: 'Bem-vindo ao dashboard!',
    dados: {
      info: 'Aqui estão dados protegidos visíveis apenas para usuários autenticados.'
    }
  });
});

module.exports = router;