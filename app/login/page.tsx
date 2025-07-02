'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginSolicitante } from './action'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
  if (!email || !password) {
    setErrorMessage('Preencha todos os campos!');
    return;
  }

  setLoading(true);
  setErrorMessage('');

  try {
    const response = await loginSolicitante({ email, senha: password });

    // Verifique se a resposta é um erro
    if ('error' in response) {
      setPassword('');
      setErrorMessage(response.message);
      return;
    }

    // Agora o TypeScript sabe que response é do tipo LoginSuccessResponse
    localStorage.setItem('token', response.token);
    localStorage.setItem('solicitante', JSON.stringify(response.solicitante));
    router.push('/dashboard');
  } catch (err: any) {
    setPassword('');
    setErrorMessage('Erro inesperado ao tentar login.');
  } finally {
    setLoading(false);
  }
};

  const handleRegisterRedirect = () => {
    window.location.href = '/register'
  }

  const handleForgotPassword = () => {
    window.location.href = '/esqueci-senha' // ajuste a rota se necessário
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#b5e4f1] px-4">
      <div className="bg-white shadow-md rounded-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#007cb2]">Entrar</h2>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Email ou CPF</label>
          <input
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-[#007cb2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
            placeholder="seu@email.com ou CPF"
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1 text-gray-700">Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`w-full px-4 py-2 border ${
              errorMessage ? 'border-red-500' : 'border-[#007cb2]'
            } rounded-lg focus:outline-none focus:ring-2 ${
              errorMessage ? 'focus:ring-red-500' : 'focus:ring-[#007cb2]'
            }`}
            placeholder="********"
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
          )}
        </div>

        <div className="text-right mb-6">
          <button
            onClick={handleForgotPassword}
            className="text-sm text-[#007cb2] hover:underline"
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#007cb2] text-white py-2 rounded-lg font-semibold hover:bg-[#00689c] transition disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Não tem conta?</span>{' '}
          <button
            onClick={handleRegisterRedirect}
            className="text-[#007cb2] hover:underline font-medium"
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  )
}
