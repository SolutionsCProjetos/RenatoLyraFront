'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { verificarIdentidade, redefinirSenha } from './action'

export default function EsqueciSenhaPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [error, setError] = useState('')
  const [campoSenhaErro, setCampoSenhaErro] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const maskCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    return cleaned
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
      .slice(0, 14)
  }

  const handleVerificarIdentidade = async () => {
    setError('')
    setLoading(true)

    if (!email || !cpf) {
      setError('Preencha todos os campos')
      setLoading(false)
      return
    }

    try {
      await verificarIdentidade(email, cpf)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRedefinirSenha = async () => {
    setError('')
    setCampoSenhaErro('')
    setLoading(true)

    if (!novaSenha || !confirmarSenha) {
      setError('Preencha os dois campos de senha')
      setLoading(false)
      return
    }

    if (novaSenha !== confirmarSenha) {
      setCampoSenhaErro('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      await redefinirSenha(email, cpf, novaSenha)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (novaSenha && confirmarSenha && novaSenha !== confirmarSenha) {
      setCampoSenhaErro('As senhas não coincidem')
    } else {
      setCampoSenhaErro('')
    }
  }, [novaSenha, confirmarSenha])

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        router.push('/')
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [success, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#b5e4f1] px-4">
      <div className="bg-white shadow-md rounded-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#007cb2]">
          Esqueci minha senha
        </h2>

        {success ? (
          <p className="text-green-600 text-center font-medium">
            Senha redefinida com sucesso! Redirecionando para o login...
          </p>
        ) : (
          <>
            {step === 1 && (
              <>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-[#007cb2] rounded-lg"
                    placeholder="Digite seu e-mail"
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-1 text-gray-700">CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={e => setCpf(maskCpf(e.target.value))}
                    className="w-full px-4 py-2 border border-[#007cb2] rounded-lg"
                    placeholder="000.000.000-00"
                  />
                </div>
                <button
                  onClick={handleVerificarIdentidade}
                  disabled={loading}
                  className="w-full bg-[#007cb2] text-white py-2 rounded-lg font-semibold hover:bg-[#00689c] transition disabled:opacity-60"
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-4">
                  <label className="block mb-1 text-gray-700">Nova senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    className="w-full px-4 py-2 border border-[#007cb2] rounded-lg"
                    placeholder="Nova senha"
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-1 text-gray-700">Confirmar senha</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    className={`w-full px-4 py-2 border ${
                      campoSenhaErro ? 'border-red-500' : 'border-[#007cb2]'
                    } rounded-lg`}
                    placeholder="Confirme a nova senha"
                  />
                  {campoSenhaErro && (
                    <p className="text-red-500 text-sm mt-1">{campoSenhaErro}</p>
                  )}
                </div>
                <button
                  onClick={handleRedefinirSenha}
                  disabled={loading || !!campoSenhaErro || !novaSenha}
                  className="w-full bg-[#007cb2] text-white py-2 rounded-lg font-semibold hover:bg-[#00689c] transition disabled:opacity-60"
                >
                  {loading ? 'Salvando...' : 'Redefinir senha'}
                </button>
              </>
            )}

            {error && (
              <p className="text-red-500 text-sm text-center mt-4">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
