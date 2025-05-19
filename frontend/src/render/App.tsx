import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

// Tipos
interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface LoginData {
  email: string;
  senha: string;
}

interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:3001'
});

// Componente Login
const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({ email: '', senha: '' });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Tentando login com:', formData);
      interface LoginResponse {
        token: string;
        usuario: Usuario;
      }
      const response = await api.post<LoginResponse>('/usuarios/login', formData);
      
      // Armazenar token com mais segurança
      const { token, usuario } = response.data;
      
      // Opção 1: localStorage (menos seguro, mas funcional para Electron)
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      // Opção 2: Para aplicações Electron, usar o armazenamento seguro do Electron
      // window.electron.secureStorage.set('auth_token', token);
      // window.electron.secureStorage.set('user_info', JSON.stringify(usuario));
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro de login:', err);
      setError(err.response?.data?.erro || 'Erro ao fazer login');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-login">Entrar</button>
      </form>
      <p>
        Não tem uma conta? <Link to="/register">Cadastre-se</Link>
      </p>
    </div>
  );
};

// Componente Cadastro
const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({ nome: '', email: '', senha: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      await api.post('/usuarios/register', formData);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      setError(err.response?.data?.erro || 'Erro ao cadastrar usuário');
    }
  };

  return (
    <div className="register-container">
      <h2>Cadastro</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Cadastro realizado com sucesso! Redirecionando...</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-register">Cadastrar</button>
      </form>
      <p>
        Já tem uma conta? <Link to="/">Faça login</Link>
      </p>
    </div>
  );
};

// Componente Dashboard
const Dashboard: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [tokenValido, setTokenValido] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        console.log('Buscando usuários com token:', token);
        // Configurar o token no cabeçalho
        const response = await api.get('/usuarios', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setUsuarios(response.data as Usuario[]);
        setTokenValido(true);
      } catch (err: any) {
        console.error('Erro ao buscar usuários:', err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          setTokenValido(false);
          setError('Token inválido, não é possível ver os usuários cadastrados');
        } else {
          setError(err.response?.data?.erro || 'Erro ao buscar usuários');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Chamar API de logout
      await api.post('/usuarios/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Erro ao fazer logout na API:', err);
    } finally {
      // Limpar dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      // Para Electron securStorage:
      // window.electron.secureStorage.remove('auth_token');
      // window.electron.secureStorage.remove('user_info');
      
      navigate('/');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Painel de Usuários</h2>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {!tokenValido && (
        <div className="token-invalido">
          <p>Sua sessão expirou ou é inválida.</p>
          <Link to="/" className="btn-voltar">Voltar para Login</Link>
        </div>
      )}
      
      {tokenValido && !error && (
        <div className="usuarios-lista">
          <h3>Usuários Cadastrados</h3>
          {usuarios.length === 0 ? (
            <p className="sem-usuarios">Não há usuários cadastrados.</p>
          ) : (
            <ul>
              {usuarios.map(usuario => (
                <li key={usuario.id} className="usuario-item">
                  <div className="usuario-info">
                    <div className="usuario-nome">{usuario.nome}</div>
                    <div className="usuario-email">{usuario.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      <div className="dashboard-info">
        <p>Esta área é protegida e apenas usuários com tokens válidos podem visualizar os dados.</p>
        <p>Seu token expira automaticamente após 1 hora.</p>
      </div>
    </div>
  );
};

// Componente para verificar autenticação
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Componente principal
const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;