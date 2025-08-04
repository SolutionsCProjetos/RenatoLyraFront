'use client'

import { useState } from 'react'
import { getToken } from '../../utils/auth'
import { registrarSolicitante } from './action'
import { toast } from 'sonner'

interface RegistroModalProps {
  data: Partial<{
    id: number
    nomeCompleto: string
    cpf: string
    titulo: string
    telefoneContato: string
    email: string
    cep: string
    endereco: string
    num: string
    bairro: string
    zona: string
    pontoReferencia: string
    secaoEleitoral: string
    indicadoPor: string
  }>
  onClose: () => void
}

function isValidCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i)
  let rev = 11 - (sum % 11)
  if (rev >= 10) rev = 0
  if (rev !== parseInt(cpf.charAt(9))) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i)
  rev = 11 - (sum % 11)
  if (rev >= 10) rev = 0
  return rev === parseInt(cpf.charAt(10))
}

function maskCPF(value: string) {
  return value.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function maskPhone(value: string) {
  return value.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

function maskCEP(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
}

function maskTitulo(value: string) {
  return value.replace(/\D/g, '')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4}) (\d{4})(\d)/, '$1 $2 $3')
    .slice(0, 14)
}

export default function RegistroModal({ data, onClose }: RegistroModalProps) {
  const [form, setForm] = useState({
    nome: data.nomeCompleto || '',
    cpf: maskCPF(data.cpf || ''),
    titulo: maskTitulo(data.titulo || ''),
    telefone: maskPhone(data.telefoneContato || ''),
    email: data.email || '',
    cep: maskCEP(data.cep || ''),
    endereco: data.endereco || '',
    numero: data.num || '',
    bairro: data.bairro || '',
    zona: data.zona || '',
    pontoReferencia: data.pontoReferencia || '',
    secao: data.secaoEleitoral || '',
    senha: '',
    indicadoPor: data.indicadoPor || '',
    meio: ''
  })

  const [erro, setErro] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let newValue = value
    if (name === 'cpf') newValue = maskCPF(value)
    if (name === 'telefone') newValue = maskPhone(value)
    if (name === 'cep') newValue = maskCEP(value)
    if (name === 'titulo') newValue = maskTitulo(value)

    setForm(prev => ({ ...prev, [name]: newValue }))
  }

  const handleSubmit = async () => {
    if (!form.nome || !form.cpf || !form.telefone || !form.email || !form.senha || !form.zona || !form.secao) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    if (!isValidCPF(form.cpf)) {
      setErro('CPF inválido.')
      return
    }

    if (form.titulo.replace(/\D/g, '').length !== 12) {
      setErro('Título de eleitor inválido.')
      return
    }

    try {
      const token = getToken()

      const payload = {
        id: data.id,
        nomeCompleto: form.nome,
        cpf: form.cpf,
        titulo: form.titulo,
        telefoneContato: form.telefone,
        email: form.email,
        cep: form.cep,
        endereco: form.endereco,
        num: form.numero,
        bairro: form.bairro,
        zona: form.zona,
        pontoReferencia: form.pontoReferencia,
        secaoEleitoral: form.secao,
        senha: form.senha,
        indicadoPor: form.indicadoPor,
        meio: form.meio
      }

      await registrarSolicitante(payload, token!)

      toast.success('Solicitante criado com sucesso!', {
        action: {
          label: 'Fechar',
          onClick: () => onClose()
        }
      })
      onClose()
    } catch (err) {
      toast.error('Erro ao criar solicitante', {
        description: String(err)
      })
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-[#007cb2]">Criar Solicitante</h2>

        {erro && <div className="text-red-600 mb-4 font-medium">{erro}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ name: 'nome', label: 'Nome completo *' },
            { name: 'cpf', label: 'CPF *' },
            { name: 'titulo', label: 'Título de Eleitor' },
            { name: 'secao', label: 'Seção *' },
            { name: 'telefone', label: 'Telefone *' },
            { name: 'email', label: 'Email *' },
            { name: 'senha', label: 'Senha *', type: 'password' },
            { name: 'cep', label: 'CEP' },
            { name: 'endereco', label: 'Endereço' },
            { name: 'numero', label: 'Número' },
            { name: 'bairro', label: 'Bairro' },
            { name: 'pontoReferencia', label: 'Ponto de Referência' },
            { name: 'indicadoPor', label: 'Indicado por' }
          ].map(({ name, label, type }) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">{label}</label>
              <input
                name={name}
                type={type || 'text'}
                value={(form as any)[name]}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
              />
            </div>
          ))}

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Zona *</label>
            <select
              name="zona"
              value={form.zona}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
            >
              <option value="">Selecione</option>
              <option value="Urbana">Urbana</option>
              <option value="Rural">Rural</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Por qual meio?</label>
            <select
              name="meio"
              value={form.meio}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
            >
              <option value="">Selecione</option>
              <option value="Instagram">Instagram</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#007cb2] text-white px-6 py-2 rounded hover:bg-[#006298] transition"
          >
            Gravar
          </button>
        </div>
      </div>
    </div>
  )
}
