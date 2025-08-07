'use client'

import { useEffect, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { updateSolicitante } from './action'
import { getToken } from '../../utils/auth'
import { getLideres } from '../../core/Liderers'

interface EditarRegistroProps {
  item: any
  setClose: () => void
}

interface Lider {
  id: number;
  nome: string;
  bairro: string;
}

interface FormState {
  nome: string;
  cpf: string;
  titulo: string;
  telefone: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  zona: string;
  pontoReferencia: string;
  secao: string;
  indicadoPor: string;
  zonaEleitoral: string;
  observacoes: string;
  liderNome: string;
  liderId: string;
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
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function maskCEP(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
}

export default function RegistroPage({ item, setClose }: EditarRegistroProps) {
  const [focused, setFocused] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [liderDropdownOpen, setLiderDropdownOpen] = useState(false)
  const [lideres, setLideres] = useState<Lider[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState<FormState>({
    nome: '',
    cpf: '',
    titulo: '',
    telefone: '',
    email: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    zona: '',
    pontoReferencia: '',
    secao: '',
    indicadoPor: '',
    zonaEleitoral: '',
    observacoes: '',
    liderNome: '',
    liderId: ''
  })

  useEffect(() => {
    const token = getToken()
    if (token) {
      getLideres(token)
        .then(data => {
          setLideres(data)
          setLoading(false)
        })
        .catch(err => {
          console.error("Erro ao buscar líderes", err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (item && !loading && lideres.length > 0) {
      const liderSelecionado = lideres.find(l => l.id.toString() === item.liderId?.toString())
      
      setForm({
        nome: item.nomeCompleto ?? '',
        cpf: maskCPF(item.cpf ?? ''),
        titulo: item.titulo ?? '',
        telefone: item.telefoneContato ?? '',
        email: item.email ?? '',
        cep: maskCEP(item.cep ?? ''),
        endereco: item.endereco ?? '',
        numero: item.num?.toString() ?? '',
        bairro: item.bairro ?? '',
        zona: item.zona ?? '',
        pontoReferencia: item.pontoReferencia ?? '',
        secao: item.secaoEleitoral ?? '',
        indicadoPor: item.indicadoPor ?? '',
        zonaEleitoral: item.zonaEleitoral ?? '',
        observacoes: item.observacoes ?? '',
        liderNome: liderSelecionado ? `${liderSelecionado.nome} - ${liderSelecionado.bairro}` : '',
        liderId: item.liderId?.toString() ?? ''
      })
    }
  }, [item, loading, lideres])

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    let newValue = value

    if (name === 'cpf') newValue = maskCPF(value)
    if (name === 'cep') newValue = maskCEP(value)

    if (name === 'cep') {
      const cleanCep = newValue.replace(/\D/g, '')
      setForm(prev => ({ ...prev, cep: newValue }))

      if (cleanCep.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
          const data = await res.json()
          if (!data.erro) {
            setForm(prev => ({
              ...prev,
              endereco: data.logradouro ?? '',
              bairro: data.bairro ?? ''
            }))
          }
        } catch (err) {
          console.error('Erro ao buscar CEP:', err)
        }
      }
    } else {
      setForm(prev => ({ ...prev, [name]: newValue }))
    }
  }

  const handleLiderSelect = (lider: Lider) => {
    setForm(prev => ({
      ...prev,
      liderId: lider.id.toString(),
      liderNome: `${lider.nome} - ${lider.bairro}`
    }))
    setLiderDropdownOpen(false)
  }

  const handleSubmit = async () => {
    const token = getToken()
    if (!token) {
      alert('Sessão expirada. Faça login novamente.')
      return
    }

    const camposObrigatorios: (keyof typeof form)[] = ['nome', 'cpf', 'telefone', 'email']
    const faltando = camposObrigatorios.filter(campo => !form[campo].trim())

    if (faltando.length > 0) {
      setErrors(faltando)
      alert('Preencha todos os campos obrigatórios.')
      return
    }

    if (form.cpf && !isValidCPF(form.cpf)) {
      alert('CPF inválido')
      return
    }

    setErrors([])

    const payload = {
      nomeCompleto: form.nome,
      cpf: form.cpf.replace(/\D/g, ''),
      titulo: form.titulo,
      telefoneContato: form.telefone,
      email: form.email,
      cep: form.cep.replace(/\D/g, ''),
      endereco: form.endereco,
      num: form.numero,
      bairro: form.bairro,
      zona: form.zona,
      pontoReferencia: form.pontoReferencia,
      secaoEleitoral: form.secao,
      indicadoPor: form.indicadoPor,
      zonaEleitoral: form.zonaEleitoral,
      observacoes: form.observacoes,
      liderId: form.liderId
    }

    try {
      await updateSolicitante(item.id, payload, token)
      setClose()
    } catch (err) {
      console.error('Erro ao atualizar solicitante:', err)
      alert('Erro ao atualizar')
    }
  }

  const isError = (campo: string) => errors.includes(campo)

  const camposPessoais = [
    ['*Nome completo:', 'nome'],
    ['*CPF:', 'cpf'],
    ['Título de Eleitor:', 'titulo'],
    ['*Telefone:', 'telefone'],
    ['*E-mail:', 'email'],
    ['Seção Eleitoral:', 'secao'],
    ['Indicado Por:', 'indicadoPor'],
    ['Zona eleitoral:', 'zonaEleitoral']
  ] as const

  const camposEndereco = [
    ['Cep:', 'cep'],
    ['Endereço:', 'endereco'],
    ['Número:', 'numero'],
    ['Bairro:', 'bairro'],
    ['Ponto Referência:', 'pontoReferencia']
  ] as const

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#b5e4f1] px-4 py-8">
        <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#b5e4f1] px-4 py-8">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-[#007cb2] border-b border-black pb-1 mb-4">Solicitante</h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {camposPessoais.map(([label, name]) => (
              <div key={name}>
                <label className="text-sm font-medium">{label}</label>
                <input
                  name={name}
                  value={form[name as keyof FormState] ?? ''}
                  onChange={handleChange}
                  className={`w-full border ${isError(name) ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
                />
              </div>
            ))}

            <div className="relative">
              <label className="text-sm font-medium">Líder:</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.liderNome ?? ''}
                  readOnly
                  onClick={() => setLiderDropdownOpen(!liderDropdownOpen)}
                  className={`w-full border ${isError('liderNome') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none cursor-pointer`}
                  placeholder="Selecione um líder"
                />
                <FaChevronDown
                  className={`absolute right-3 top-3 text-[#007cb2] pointer-events-none transition-transform ${liderDropdownOpen ? 'rotate-180' : ''}`}
                  size={14}
                />
              </div>

              {liderDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-[#007cb2] rounded shadow-lg">
                  {lideres.map(lider => (
                    <div
                      key={lider.id}
                      className="px-4 py-2 hover:bg-[#c4f9ff] cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleLiderSelect(lider)}
                    >
                      <div className="font-medium">{lider.nome}</div>
                      <div className="text-xs text-gray-600">{lider.bairro}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {camposEndereco.map(([label, name]) => (
              <div key={name}>
                <label className="text-sm font-medium">{label}</label>
                <input
                  name={name}
                  value={form[name as keyof FormState] ?? ''}
                  onChange={handleChange}
                  className={`w-full border ${isError(name) ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
                />
              </div>
            ))}

            <div className="relative">
              <label className="text-sm font-medium">Zona:</label>
              <select
                name="zona"
                value={form.zona ?? ''}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full appearance-none border ${isError('zona') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 pr-10 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              >
                <option value="">Selecione</option>
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
              </select>
              <FaChevronDown
                className={`absolute right-3 top-[35px] text-[#007cb2] pointer-events-none transition-transform duration-200 ${focused || form.zona ? 'rotate-180' : ''}`}
                size={14}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Observações</h3>
          <textarea
            name="observacoes"
            value={form.observacoes ?? ''}
            onChange={handleChange}
            rows={3}
            placeholder="Digite informações adicionais, anotações ou histórico..."
            className="w-full border border-[#007cb2] rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={setClose}
            className="bg-gray-100 border border-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-200 transition"
          >
            Voltar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#007cb2] text-white px-6 py-2 rounded hover:bg-[#00689c] transition"
          >
            Gravar
          </button>
        </div>
      </div>
    </div>
  )
}
