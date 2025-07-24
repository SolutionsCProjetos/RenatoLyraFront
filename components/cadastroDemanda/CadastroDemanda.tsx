'use client'

import { useEffect, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { registrarDemanda, getProximoProtocolo, getSetores, getUsuarios } from './action'
import { getToken, parseJwt } from '../../utils/auth'

interface CadastroDemandaProps {
  setShowCreateForm: (value: boolean) => void
  editData?: any | null
  onDemandaCadastrada?: () => Promise<void> | void
}

export default function NovaDemandaPage({ setShowCreateForm, editData, onDemandaCadastrada }: CadastroDemandaProps) {
  const [focusedSelect, setFocusedSelect] = useState('')
  const [obs, setObs] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [setoresOptions, setSetoresOptions] = useState<string[]>([])
  const [usuariosOptions, setUsuariosOptions] = useState<any[]>([])
  const [form, setForm] = useState<any>({
    protocolo: '',
    setor: '',
    prioridade: 'P0',
    status: 'Pendente',
    dataSolicitacao: getCurrentDate(),
    dataTermino: '',
    solicitant: '',
    meioSolicitacao: 'WhatsApp',
    anexarDocumentos: '',
    envioCobranca1: '',
    envioCobranca2: '',
    envioParaResponsavel: '',
    observacoes: '',
    solicitantId: null
  })

  function getCurrentDate() {
    const today = new Date().toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })
    const [day, month, year] = today.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }



function formatToLocalDate(isoDate: string) {
  if (!isoDate) return '';
  
  // Se já está no formato YYYY-MM-DD, retorna sem alteração
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate;
  }

  // Para strings ISO completas (com timezone)
  const date = new Date(isoDate);
  
  // Corrige para o fuso horário local
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() + offset);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

  const token = getToken()
  if (!token) {
    console.error('Sessão expirada. Faça login novamente.')
    return
  }

  useEffect(() => {
    const decoded = parseJwt(token)
    const userId = decoded?.id
    const adm = decoded?.adm === true
    setIsAdmin(adm)

    if (editData) {
      setForm({
        protocolo: editData.protocolo || '',
        setor: editData.setor || '',
        prioridade: editData.prioridade || 'P0',
        status: editData.status || 'Pendente',
        dataSolicitacao: formatToLocalDate(editData.dataSolicitacao) || getCurrentDate(),
        dataTermino: editData.dataTermino?.split('T')[0] || '',
        solicitant: editData.solicitant || '',
        meioSolicitacao: editData.meioSolicitacao || 'WhatsApp',
        anexarDocumentos: editData.anexarDocumentos || '',
        envioCobranca1: editData.envioCobranca1 || '',
        envioCobranca2: editData.envioCobranca2 || '',
        envioParaResponsavel: editData.envioParaResponsavel || '',
        observacoes: editData.observacoes || '',
        solicitantId: editData.solicitanteId
      })
      setObs(editData.observacoes || '')
    } else {
      if (adm) {
        setForm((prev: any) => ({ ...prev, solicitantId: '' }))
        getUsuarios(token).then(setUsuariosOptions).catch(console.error)
      } else if (userId) {
        setForm((prev: any) => ({ ...prev, solicitantId: userId }))
      }
    }
  }, [editData])

  useEffect(() => {
    const loadSetores = async () => {
      try {
        const res = await getSetores(token)
        const formatarSetor = (nome: string) =>
          nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase()
        const nomes = res.map((s: any) => formatarSetor(s.setor || ''))
        setSetoresOptions(['Selecione', ...nomes])
      } catch (err) {
        console.error('Erro ao carregar setores:', err)
      }
    }
    loadSetores()
  }, [])

  const mapEnumToDisplay = (value: string) => {
    const mappings: Record<string, string> = {
      'N_o': 'Não',
      'Aguardando_Retorno': 'Aguardando Retorno',
      'Conclu_da': 'Concluída'
    }
    return mappings[value] || value
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev: any) => ({ ...prev, [name]: value }))
    if (name === 'observacoes') setObs(value)
  }

  const handleSubmit = async () => {
    try {
      const protocolo = await getProximoProtocolo(token)
      const payload = {
      ...form,
      protocolo,
      id: editData?.id || null,
      dataSolicitacao: form.dataSolicitacao ? `${form.dataSolicitacao}T00:00:00` : null,
      dataTermino: form.dataTermino ? `${form.dataTermino}T00:00:00` : null,
      status: form.status === 'Aguardando Retorno' 
        ? 'Aguardando_Retorno' 
        : form.status === 'Concluída' 
          ? 'Conclu_da' 
          : form.status,
    };
      await registrarDemanda(payload, token, isAdmin)

      if (onDemandaCadastrada) {
        await onDemandaCadastrada()
      }

      setShowCreateForm(false)
    } catch (error) {
      alert('Erro ao registrar a demanda.')
      console.error(error)
    }
  }

  const renderSelect = (name: string, value: string, options: string[], disabled = false) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocusedSelect(name)}
        onBlur={() => setFocusedSelect('')}
        disabled={disabled}
        className={`w-full appearance-none border border-[#007cb2] rounded px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#007cb2] ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'}`}
      >
        {options.map(opt => (
          <option key={opt} value={opt === 'Selecione' ? '' : opt}>
            {mapEnumToDisplay(opt)}
          </option>
        ))}
      </select>
      <FaChevronDown
        className={`absolute right-3 top-3.5 pointer-events-none transition-transform duration-200 ${focusedSelect === name ? 'rotate-180' : ''} ${disabled ? 'text-gray-400' : 'text-[#007cb2]'}`}
        size={14}
      />
    </div>
  )

  const renderInput = (name: string, value: string, type = 'text', readOnly = false, disabled = false) => (
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
      disabled={disabled}
      className={`w-full border border-[#007cb2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007cb2] ${disabled || readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'}`}
    />
  )

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#b5e4f1] px-4 py-10">
      <div className="bg-white w-full max-w-6xl p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-[#007cb2] border-b border-black pb-1 mb-6">Demanda</h2>

        <div className="mb-8">
          <h3 className="font-semibold mb-3">Dados da Demanda</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium block mb-1">Setor:</label>
              {renderSelect('setor', form.setor, setoresOptions)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Prioridade:</label>
              {renderSelect('prioridade', form.prioridade, ['P0', 'P1', 'P2'], !isAdmin)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Status:</label>
              {renderSelect('status', form.status, ['Pendente', 'Aguardando_Retorno', 'Cancelada', 'Conclu_da'], !isAdmin)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Data da Solicitação:</label>
              {renderInput('dataSolicitacao', form.dataSolicitacao, 'date', true)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Data de Término:</label>
              {renderInput('dataTermino', form.dataTermino, 'date', false, !isAdmin)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Solicitante:</label>
              {isAdmin ? (
                <div className="relative">
                  <select
                    name="solicitantId"
                    value={form.solicitantId || ''}
                    onChange={handleChange}
                    onFocus={() => setFocusedSelect('solicitantId')}
                    onBlur={() => setFocusedSelect('')}
                    className="w-full appearance-none border border-[#007cb2] rounded px-3 py-2 pr-8 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
                  >
                    <option value="">Selecione um usuário</option>
                    {usuariosOptions.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.nomeCompleto} - {user.cpf}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown
                    className={`absolute right-3 top-3.5 text-[#007cb2] pointer-events-none transition-transform duration-200 ${focusedSelect === 'solicitantId' ? 'rotate-180' : ''}`}
                    size={14}
                  />
                </div>
              ) : (
                renderInput('solicitant', form.solicitant, 'text', false, true)
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-3">Informações Extras</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium block mb-1">Reincidência:</label>
              {renderSelect('reincidencia', form.reincidencia, ['N_o', 'Sim'], !isAdmin)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Meio de Solicitação:</label>
              {renderSelect('meioSolicitacao', form.meioSolicitacao, ['WhatsApp', 'Presencial'])}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Anexar Documentos:</label>
              {renderInput('anexarDocumentos', form.anexarDocumentos, 'text', false, !isAdmin)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Envio Cobrança 1:</label>
              {renderInput('envioCobranca1', form.envioCobranca1, 'text', false, !isAdmin)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Envio Cobrança 2:</label>
              {renderInput('envioCobranca2', form.envioCobranca2, 'text', false, !isAdmin)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Envio para o Responsável:</label>
              {renderInput('envioParaResponsavel', form.envioParaResponsavel, 'text', false, !isAdmin)}
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium block mb-1">Observações:</label>
            <textarea
              name="observacoes"
              maxLength={300}
              rows={4}
              value={form.observacoes}
              onChange={handleChange}
              className="w-full border border-[#007cb2] rounded px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
              placeholder="Digite aqui..."
            />
            <div className="text-right text-sm text-gray-500">{obs.length}/300 caracteres</div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowCreateForm(false)}
            className="bg-gray-100 border border-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-200 transition"
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
