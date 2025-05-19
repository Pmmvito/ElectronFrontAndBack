const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const auth = require('../middleware/authToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Adicionando bcrypt
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
    
    // Checar se email já existe
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    
    // Criar hash da senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    
    // Criar usuário com senha criptografada
    const novoUsuario = await Usuario.create({ 
      nome, 
      email, 
      senha: senhaCriptografada 
    });
    
    res.json({ 
      id: novoUsuario.id, 
      nome: novoUsuario.nome, 
      email: novoUsuario.email 
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar usuário', detalhes: err.message });
  }
});

// Login com verificação de senha criptografada
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log(`Tentativa de login para: ${email}`);
    
    console.log('Iniciando consulta ao banco de dados...');
    
    const usuario = await Usuario.findOne({ where: { email } });
    
    console.log('Consulta concluída:', usuario ? 'Usuário encontrado' : 'Usuário não encontrado');
    
    // Verificação de senha com bcrypt
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Gerar o token JWT
    const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: '1h' });
    
    // Salvar o token no banco de dados
    await usuario.update({ token });
    
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