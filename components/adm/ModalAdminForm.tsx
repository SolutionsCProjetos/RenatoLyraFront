'use client'

import { useEffect, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'

interface ModalAdminFormProps {
  user: any
  onClose: () => void
  onSave: (user: any) => void
  resetPasswordMode?: boolean // 👈 isso resolve
}


const setores = [
  { id: 1, nome: 'FINANCEIRO' },
  { id: 3, nome: 'SUPORTE' },
  { id: 6, nome: 'EMPREGABILIDADE' },
  { id: 7, nome: 'DEMANDAS' },
  { id: 8, nome: 'Animal' },
  { id: 9, nome: 'Saúde' },
  { id: 10, nome: 'Educação' },
  { id: 11, nome: 'Cadastro Eleitoral' },
  { id: 12, nome: 'Esportes' },
  { id: 13, nome: 'Abastecimento de Água Zona Rural' },
  { id: 14, nome: 'Primeiro Título' },
  { id: 15, nome: 'Transferência de Título' },
  { id: 16, nome: 'Saneamento' }
]

const tipos = ['Administrador', 'Supervisor']

export default function ModalAdminForm({ user, onClose, onSave }: ModalAdminFormProps) {
  const [focusedSelect, setFocusedSelect] = useState('')
  const [formMode, setFormMode] = useState<'default' | 'recovery'>('default')

  const [form, setForm] = useState({
    nome: '',
    email: '',
    empresa: '',
    tipo: 'Supervisor',
    setorId: '',
    setorAtual: '',
    novaSenha: ''
  })

  useEffect(() => {
    if (user) {
      const setorInfo = setores.find(s => s.id === Number(user.setorId))
      setForm(prev => ({
        ...prev,
        nome: user.nome || '',
        email: user.email || '',
        empresa: user.empresa || '',
        tipo: user.rule === 1 ? 'Administrador' : 'Supervisor',
        setorId: '',
        setorAtual: setorInfo?.nome || `ID ${user.setorId} (não mapeado)`
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = () => {
    if (formMode === 'recovery') {
      if (!form.novaSenha || form.novaSenha.length < 6) {
        alert('Informe uma nova senha com pelo menos 6 caracteres.')
        return
      }
      onSave({ id: user?.id, novaSenha: form.novaSenha })
      return
    }

    if (!form.nome.trim() || !form.email.trim()) {
      alert('Preencha nome e e-mail.')
      return
    }

    const updated = {
      ...user,
      nome: form.nome,
      email: form.email,
      empresa: form.empresa,
      rule: form.tipo === 'Administrador' ? 1 : 0,
      setorId: form.setorId ? parseInt(form.setorId) : user?.setorId,
      senha: form.novaSenha || undefined,
    }

    onSave(updated)
  }

  const renderSelect = (
    name: string,
    value: string,
    options: { id: number, nome: string }[] | string[]
  ) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocusedSelect(name)}
        onBlur={() => setFocusedSelect('')}
        className="w-full appearance-none bg-white border border-[#007cb2] rounded px-3 py-2 pr-8 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
      >
        <option value="">Selecione</option>
        {(options as any[]).map(opt =>
          typeof opt === 'string'
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.id} value={opt.id}>{opt.nome}</option>
        )}
      </select>
      <FaChevronDown
        className={`absolute right-3 top-3.5 text-[#007cb2] pointer-events-none transition-transform duration-200 ${focusedSelect === name ? 'rotate-180' : ''}`}
        size={14}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-[#007cb2] border-b border-gray-300 pb-2 mb-6">
          {user ? `Editar Usuário: ${user.nome}` : 'Novo Usuário'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formMode === 'default' ? (
            <>
              <div>
                <label className="text-sm font-medium block mb-1">Tipo de Usuário:</label>
                {renderSelect('tipo', form.tipo, tipos)}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Nome:</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full border border-[#007cb2] rounded px-3 py-2 focus:ring-2 focus:ring-[#007cb2] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Novo setor:</label>
                {renderSelect('setorId', form.setorId, setores)}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Setor atual:</label>
                <input
                  name="setorAtual"
                  value={form.setorAtual}
                  disabled
                  className="w-full bg-gray-100 border border-[#007cb2] rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Empresa:</label>
                <input
                  name="empresa"
                  value={form.empresa}
                  onChange={handleChange}
                  className="w-full border border-[#007cb2] rounded px-3 py-2 focus:ring-2 focus:ring-[#007cb2] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">E-mail:</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-[#007cb2] rounded px-3 py-2 focus:ring-2 focus:ring-[#007cb2] focus:outline-none"
                />
              </div>

              {!user?.id && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-1">Senha:</label>
                  <input
                    type="password"
                    name="novaSenha"
                    value={form.novaSenha}
                    onChange={handleChange}
                    className="w-full border border-[#007cb2] rounded px-3 py-2 focus:ring-2 focus:ring-[#007cb2] focus:outline-none"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Nova senha:</label>
              <input
                type="password"
                name="novaSenha"
                value={form.novaSenha}
                onChange={handleChange}
                className="w-full border border-[#007cb2] rounded px-3 py-2 focus:ring-2 focus:ring-[#007cb2] focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="bg-[#007cb2] text-white px-5 py-2 rounded hover:bg-[#00689c] transition"
          >
            {formMode === 'recovery' ? 'Salvar Nova Senha' : user ? 'Atualizar' : 'Cadastrar'}
          </button>

          {formMode === 'default' && user?.id && (
            <button
              onClick={() => setFormMode('recovery')}
              className="bg-[#004d66] text-white px-5 py-2 rounded hover:bg-[#003f56] transition"
            >
              Recuperar senha
            </button>
          )}

          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
