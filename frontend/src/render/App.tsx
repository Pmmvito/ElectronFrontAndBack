import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from '../render/Login';

type Usuario = {
  id: number;
  nome: string;
  email: string;
  senha: string;
};

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null); // Estado para erros

  useEffect(() => {
    axios.interceptors.response.use(
      response => response,
      error => {
        return Promise.reject(error);
      }
    );
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get<Usuario[]>('http://localhost:3001/usuarios', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(() => {});
    }
  }, [token]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null); // Limpa o erro antes de tentar logar
    try {
      const res = await axios.post<{ token: string }>('http://localhost:3001/usuarios/login', {
        email: loginEmail,
        senha: loginSenha,
      });

      // Só limpa os campos após sucesso
      if (res.data && res.data.token) {
        setToken(res.data.token);
        setLoginEmail('');
        setLoginSenha('');
      }
    } catch {
      setErro('Erro ao fazer login. Verifique suas credenciais.'); // Define a mensagem de erro
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro(null); // Limpa o erro antes de tentar cadastrar
    try {
      const response = await axios.post('http://localhost:3001/usuarios/register', {
        nome,
        email,
        senha,
      });

      if (response.status === 200 || response.status === 201) {
        setNome('');
        setEmail('');
        setSenha('');
        setLoginEmail(email); // Preenche o email no login
        setMostrarLogin(true);
      }
    } catch {
      setErro('Erro ao cadastrar. Por favor, tente novamente.'); // Define a mensagem de erro
    }
  }

  return (
    <div>
      {!token ? (
        mostrarLogin ? (
          <div>
            {erro && <p style={{ color: 'red' }}>{erro}</p>} {/* Exibe o erro acima do formulário */}
            <Login
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginSenha={loginSenha}
              setLoginSenha={setLoginSenha}
              onLogin={handleLogin}
              onVoltarCadastro={() => setMostrarLogin(false)}
            />
          </div>
        ) : (
          <div>
            <h2>Cadastre-se</h2>
            {erro && <p style={{ color: 'red' }}>{erro}</p>} {/* Exibe o erro, se houver */}
            <form onSubmit={handleCadastro}>
              <div>
                <label>
                  Nome:
                  <input
                    name="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Email:
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Senha:
                  <input
                    name="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </label>
              </div>
              <button type="submit">Cadastrar</button>
            </form>
            <hr />
            <button onClick={() => setMostrarLogin(true)}>Já tenho cadastro</button>
          </div>
        )
      ) : (
        <div>
          <h1>Cadastro de Usuários</h1>
          <button onClick={() => { setToken(null); setMostrarLogin(true); }}>Sair</button>
        </div>
      )}
    </div>
  );
}

export default App;

