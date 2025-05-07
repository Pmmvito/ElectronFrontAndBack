import React, { useRef, useEffect, useState } from 'react';

type LoginProps = {
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginSenha: string;
  setLoginSenha: (senha: string) => void;
  onLogin: (e: React.FormEvent) => Promise<void>;
  onVoltarCadastro?: () => void;
};

const Login: React.FC<LoginProps> = ({
  loginEmail,
  setLoginEmail,
  loginSenha,
  setLoginSenha,
  onLogin,
  onVoltarCadastro
}) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Foca no campo de email ao montar o componente
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null); // Limpa o erro antes de tentar logar
    try {
      await onLogin(e); // Chama a função de login passada como prop
    } catch {
      setErro("Erro ao fazer login. Verifique suas credenciais."); // Define a mensagem de erro
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1 className="login-title">Login</h1>
        {erro && <p className="login-error">{erro}</p>} {/* Exibe o erro acima do formulário */}
        <div>
          <label>
            Email:
            <input
              ref={emailInputRef}
              name="email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
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
              value={loginSenha}
              onChange={(e) => setLoginSenha(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit" className="login-button">Entrar</button>
      </form>
      {onVoltarCadastro && (
        <button type="button" onClick={onVoltarCadastro} className="login-button">
          Quero me cadastrar
        </button>
      )}
    </div>
  );
};

export default Login;