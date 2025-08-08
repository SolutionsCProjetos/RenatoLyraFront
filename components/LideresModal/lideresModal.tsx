'use client'

import { useState } from 'react'
import { atualizarLider, criarLider } from './action'
import { getToken } from '../../utils/auth'

interface ILider {
  id?: number
  nome: string
  bairro: string
}

interface Props {
  data?: ILider | null
  onClose: () => void
  onSuccess: () => void
}

export default function LiderModal({ data, onClose, onSuccess }: Props) {
  const [nome, setNome] = useState(data?.nome || '')
  const [bairro, setBairro] = useState(data?.bairro || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!nome.trim() || !bairro.trim()) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    const token = getToken()
    if (!token) {
      setError('Sessão expirada. Faça login novamente.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = { nome: nome.trim(), bairro: bairro.trim() }

      if (data?.id && data.id !== 0) {
        await atualizarLider(data.id, payload, token)
      } else {
        await criarLider(payload, token)
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erro ao salvar líder:', err)
      setError('Erro ao salvar líder. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
        <h2 className="text-xl font-semibold text-[#17686f] mb-4">
          {data?.id && data.id !== 0 ? 'Editar Líder' : 'Novo Líder'}
        </h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
            placeholder="Digite o nome do líder"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
          <input
            type="text"
            value={bairro}
            onChange={e => setBairro(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
            placeholder="Digite o bairro"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#007cb2] text-white px-4 py-2 rounded hover:bg-[#00689c] transition"
            disabled={loading}
          >
            {loading ? 'Salvando...' : data?.id && data.id !== 0 ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
