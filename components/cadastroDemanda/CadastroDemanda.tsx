'use client'

import { useEffect, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { registrarDemanda, getProximoProtocolo, getSetores, getUsuarios } from './action'
import { getToken, parseJwt } from '../../utils/auth'

// Tipos
interface Usuario {
  id: number
  nomeCompleto: string
  cpf: string
  // Adicione outros campos conforme retornado pela API
}

interface FormState {
  protocolo: string
  setor: string
  prioridade: 'P0' | 'P1' | 'P2'
  status: string
  dataSolicitacao: string
  dataTermino: string
  solicitant: string
  meioSolicitacao: string
  anexarDocumentos: string
  envioCobranca1: string
  envioCobranca2: string
  envioParaResponsavel: string
  observacoes: string
  solicitantId: number | null
  reincidencia?: string,
  indicadoPor?: string
}

interface CadastroDemandaProps {
  setShowCreateForm: (value: boolean) => void
  editData?: any | null
  onDemandaCadastrada?: () => Promise<void> | void
}

// Funções utilitárias
function formatarNome(nome: string): string {
  if (!nome) return ''

  return nome
    .toLowerCase()
    .split(' ')
    .map(palavra =>
      palavra.length > 2  // Ignora preposições curtas
        ? palavra.charAt(0).toUpperCase() + palavra.slice(1)
        : palavra.toLowerCase()
    )
    .join(' ')
    .replace(/\s+/g, ' ')  // Remove múltiplos espaços
    .trim()
}

function formatarCPFExibicao(cpf: string): string {
  if (!cpf) return ''
  return cpf.replace(/\D/g, '')
}

function formatarUsuarioExibicao(usuario: Usuario): string {
  return `${formatarNome(usuario.nomeCompleto)} - ${formatarCPFExibicao(usuario.cpf)}`
}

function getCurrentDate(): string {
  const today = new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  })
  const [day, month, year] = today.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function formatToLocalDate(isoDate: string): string {
  if (!isoDate) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate;
  }

  const date = new Date(isoDate);
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function NovaDemandaPage({ setShowCreateForm, editData, onDemandaCadastrada }: CadastroDemandaProps) {
  const [focusedSelect, setFocusedSelect] = useState<string>('')
  const [obs, setObs] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [setoresOptions, setSetoresOptions] = useState<string[]>([])
  const [usuariosOptions, setUsuariosOptions] = useState<Usuario[]>([])
  const [form, setForm] = useState<FormState>({
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
    solicitantId: null,
    indicadoPor: '',
  })

  const token = getToken()
  if (!token) {
    console.error('Sessão expirada. Faça login novamente.')
    return null
  }

  // Carregar dados iniciais
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
        dataSolicitacao: formatToLocalDate(editData.dataSolicitacao),
        dataTermino: editData.dataTermino?.split('T')[0] || '',
        solicitant: editData.solicitant || '',
        meioSolicitacao: editData.meioSolicitacao || 'WhatsApp',
        anexarDocumentos: editData.anexarDocumentos || '',
        envioCobranca1: editData.envioCobranca1 || '',
        envioCobranca2: editData.envioCobranca2 || '',
        envioParaResponsavel: editData.envioParaResponsavel || '',
        observacoes: editData.observacoes || '',
        solicitantId: editData.solicitanteId,
        reincidencia: editData.reincidencia || '',
        indicadoPor: editData.indicadoPor || editData.solicitantes.indicadoPor || editData.solicitantes.solicitante || '',
      })
      setObs(editData.observacoes || '')
    } else {
      if (adm) {
        setForm(prev => ({ ...prev, solicitantId: null }))
      } else if (userId) {
        setForm(prev => ({ ...prev, solicitantId: userId }))
      }
    }
  }, [editData, token])

  // Carregar setores
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
  }, [token])

  // Carregar usuários (apenas para admin)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getUsuarios(token)
        setUsuariosOptions(
          users
            .map((user: { nomeCompleto: string }) => ({
              ...user,
              nomeCompleto: formatarNome(user.nomeCompleto)
            }))
            .sort((a: { nomeCompleto: string }, b: { nomeCompleto: any }) => a.nomeCompleto.localeCompare(b.nomeCompleto))
        )
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      }
    }

    if (isAdmin && !editData) {
      loadUsers()
    }
  }, [isAdmin, editData, token])

  // Mapeamento de status para exibição
  const mapEnumToDisplay = (value: string): string => {
    const mappings: Record<string, string> = {
      'N_o': 'Não',
      'Aguardando_Retorno': 'Aguardando Retorno',
      'Conclu_da': 'Concluída'
    }
    return mappings[value] || value
  }

  // Manipulador de mudanças no formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'observacoes') setObs(value)
  }

  // Submissão do formulário
  // const handleSubmit = async () => {
  //   try {
  //     const protocolo = await getProximoProtocolo(token)
  //     const payload = {
  //       ...form,
  //       protocolo,
  //       id: editData?.id || null,
  //       dataSolicitacao: form.dataSolicitacao ? `${form.dataSolicitacao}T00:00:00` : null,
  //       dataTermino: form.dataTermino ? `${form.dataTermino}T00:00:00` : null,
  //       status: form.status === 'Aguardando Retorno'
  //         ? 'Aguardando_Retorno'
  //         : form.status === 'Concluída'
  //           ? 'Conclu_da'
  //           : form.status,
  //     }

  //     await registrarDemanda(payload, token, isAdmin)

  //     if (onDemandaCadastrada) {
  //       await onDemandaCadastrada()
  //     }

  //     setShowCreateForm(false)
  //   } catch (error) {
  //     console.error('Erro ao registrar a demanda:', error)
  //     alert('Erro ao registrar a demanda.')
  //   }
  // }

   const handleSubmit = async () => {
    try {
      let protocolo = form.protocolo;

      // Só gera um novo protocolo se for criação
      if (!editData && !form.protocolo) {
        protocolo = await getProximoProtocolo(token);
      }


      const payload = {
        ...form,
        protocolo,
        id: editData?.id || null,
        dataSolicitacao: form.dataSolicitacao ? `${form.dataSolicitacao}T00:00:00` : null,
        dataTermino: form.dataTermino ? `${form.dataTermino}T00:00:00` : null,
        status:
          form.status === 'Aguardando Retorno'
            ? 'Aguardando_Retorno'
            : form.status === 'Concluída'
              ? 'Conclu_da'
              : form.status,
      };

      await registrarDemanda(payload, token, isAdmin);

      if (onDemandaCadastrada) {
        await onDemandaCadastrada();
      }

      setShowCreateForm(false);
    } catch (error) {
      console.error('Erro ao registrar a demanda:', error);
      alert('Erro ao registrar a demanda.');
    }
  };

  // Componente de select reutilizável
  const renderSelect = (
    name: string,
    value: string,
    options: string[],
    disabled = false
  ) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocusedSelect(name)}
        onBlur={() => setFocusedSelect('')}
        disabled={disabled}
        className={`w-full appearance-none border border-[#007cb2] rounded px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#007cb2] ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'
          }`}
      >
        {options.map(opt => (
          <option key={opt} value={opt === 'Selecione' ? '' : opt}>
            {mapEnumToDisplay(opt)}
          </option>
        ))}
      </select>
      <FaChevronDown
        className={`absolute right-3 top-3.5 pointer-events-none transition-transform duration-200 ${focusedSelect === name ? 'rotate-180' : ''
          } ${disabled ? 'text-gray-400' : 'text-[#007cb2]'}`}
        size={14}
      />
    </div>
  )

  // Componente de input reutilizável
  const renderInput = (
    name: string,
    value: string,
    type = 'text',
    readOnly = false,
    disabled = false
  ) => (
    <input
      type={type}
      name={name}
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
      disabled={disabled}
      className={`w-full border border-[#007cb2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007cb2] ${disabled || readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800'
        }`}
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
              {renderSelect('status', form.status, ['Pendente', 'Aguardando Retorno', 'Cancelada', 'Concluída'], !isAdmin)}
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
              <label className="text-sm font-medium block mb-1">Indicado Por:</label>
              {renderInput('indicadoPor', form.indicadoPor || '', 'text', false, !isAdmin)}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Solicitante:</label>
              {isAdmin ? (
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={form.solicitant}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, solicitant: e.target.value }))
                      }}
                      onFocus={() => setFocusedSelect('solicitant')}
                      onBlur={() => setTimeout(() => setFocusedSelect(''), 200)}
                      placeholder="Digite nome ou CPF..."
                      className="w-full border border-[#007cb2] rounded px-3 py-2 pr-8 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
                    />
                    <FaChevronDown
                      className={`absolute right-3 top-3 text-[#007cb2] pointer-events-none transition-transform ${focusedSelect === 'solicitant' ? 'rotate-180' : ''
                        }`}
                      size={14}
                    />
                  </div>

                  {focusedSelect === 'solicitant' && (
                    <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-[#007cb2] rounded shadow-lg custom-select-dropdown">
                      {usuariosOptions
                        .filter(user => {
                          const searchTerm = form.solicitant.toLowerCase()
                          const nome = user.nomeCompleto.toLowerCase()
                          const cpf = user.cpf.replace(/\D/g, '')
                          return nome.includes(searchTerm) || cpf.includes(searchTerm)
                        })
                        .map(user => (
                          <div
                            key={user.id}
                            className="px-4 py-2 hover:bg-[#c4f9ff] cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              setForm(prev => ({
                                ...prev,
                                solicitant: formatarNome(user.nomeCompleto),
                                solicitantId: user.id
                              }))
                              setFocusedSelect('')
                            }}
                          >
                            {formatarUsuarioExibicao(user)}
                          </div>
                        ))}
                    </div>
                  )}
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
              {renderSelect('reincidencia', form.reincidencia || '', ['N_o', 'Sim'], !isAdmin)}
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

