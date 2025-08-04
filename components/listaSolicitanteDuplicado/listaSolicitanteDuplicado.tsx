'use client'

import { useEffect, useState } from 'react'
import { FaChevronDown, FaFileExcel, FaFilePdf } from 'react-icons/fa'
import { getToken } from '../../utils/auth'
import RegistroModal from '../RegistroModal/RegistroModal'
import { buscarDuplicados } from './action'
import { utils, writeFile } from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable, { UserOptions } from 'jspdf-autotable'

const ITEMS_PER_PAGE = 20

interface ISolicitante {
  id: number
  nomeCompleto?: string
  telefoneContato?: string
  titulo?: string
  zona?: string
  cpf?: string
  email?: string
  cep?: string
  endereco?: string
  num?: string
  bairro?: string
  pontoReferencia?: string
  secaoEleitoral?: string
  indicadoPor?: string
}

export default function ListaSolicitantesDuplicados() {
  const [data, setData] = useState<ISolicitante[]>([])
  const [filteredData, setFilteredData] = useState<ISolicitante[]>([])
  const [selected, setSelected] = useState<ISolicitante | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [focusedSelect, setFocusedSelect] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken()
        if (!token) {
          alert('Sessão expirada. Faça login novamente.')
          return
        }

        const result = await buscarDuplicados(token)
        setData(result.duplicados)
        setFilteredData(result.duplicados)
      } catch (err) {
        alert('Erro ao buscar duplicados')
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const filtered = data.filter(item => {
      const nome = item.nomeCompleto?.toLowerCase() || ''
      const cpf = item.cpf?.toLowerCase() || ''
      const email = item.email?.toLowerCase() || ''
      const telefone = item.telefoneContato?.toLowerCase() || ''

      return (
        nome.includes(search.toLowerCase()) ||
        cpf.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase()) ||
        telefone.includes(search.toLowerCase())
      )
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [search, data])

  const handleClear = () => {
    setSearch('')
    setFilteredData(data)
    setCurrentPage(1)
  }

  const exportToExcel = () => {
    const dataToExport = filteredData.map(item => ({
      ID: item.id,
      Nome: item.nomeCompleto || '-',
      CPF: item.cpf || '-',
      Email: item.email || '-',
      Telefone: item.telefoneContato || '-',
      Endereço: `${item.endereco || ''} ${item.num || ''}, ${item.bairro || ''}`,
      'Indicado Por': item.indicadoPor || '-'
    }))

    const worksheet = utils.json_to_sheet(dataToExport)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Solicitantes Duplicados')
    writeFile(workbook, 'solicitantes_duplicados.xlsx')
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const title = 'Relatório de Solicitantes Duplicados'

    doc.setFontSize(16)
    doc.text(title, 14, 15)

    const headers = [['ID', 'Nome', 'CPF', 'Email', 'Telefone', 'Indicado Por']]
    const pdfData = filteredData.map(item => [
      item.id.toString(),
      item.nomeCompleto || '-',
      item.cpf || '-',
      item.email || '-',
      item.telefoneContato || '-',
      item.indicadoPor || '-'
    ])

    const tableConfig: UserOptions = {
      head: headers,
      body: pdfData,
      startY: 20,
      theme: 'grid',
      headStyles: {
        fillColor: [28, 125, 135]
      }
    }

    autoTable(doc, tableConfig)
    doc.save('solicitantes_duplicados.pdf')
  }

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#17686f]">Solicitantes Duplicados ou Sem CPF</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
            Total de Registros: {data.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome, CPF, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-[#007cb2] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#007cb2] w-full lg:w-96"
          />
          <button
            onClick={handleClear}
            className="bg-gray-100 border border-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-200 transition"
          >
            Limpar
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
          >
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input
                type="text"
                placeholder="Filtrar por CPF"
                className="border border-[#007cb2] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#007cb2] w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
              <div className="relative">
                <select
                  onFocus={() => setFocusedSelect('zona')}
                  onBlur={() => setFocusedSelect('')}
                  className="w-full appearance-none border border-[#007cb2] rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
                >
                  <option value="">Todas</option>
                  <option value="1">Zona 1</option>
                  <option value="2">Zona 2</option>
                  <option value="3">Zona 3</option>
                </select>
                <FaChevronDown
                  className={`absolute right-3 top-3.5 text-[#007cb2] pointer-events-none transition-transform duration-200 ${focusedSelect === 'zona' ? 'rotate-180' : ''}`}
                  size={14}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indicado por</label>
              <input
                type="text"
                placeholder="Filtrar por indicado"
                className="border border-[#007cb2] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#007cb2] w-full"
              />
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-[#1c7d87] text-white">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Indicado Por</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(item => (
              <tr key={item.id} className="even:bg-[#c4f9ff]">
                <td className="px-4 py-3 text-gray-700">{item.id}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{item.nomeCompleto || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{item.cpf || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{item.email || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{item.telefoneContato || '-'}</td>
                <td className="px-4 py-3 text-gray-700">{item.indicadoPor || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelected(item)}
                    className="text-[#007cb2] hover:underline"
                  >
                    Criar
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-4">
                  Nenhum solicitante encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center items-center gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="px-3 py-1 rounded bg-[#007cb2] text-white hover:bg-[#00689c] disabled:bg-gray-400"
        >
          Anterior
        </button>
        <span className="text-gray-700">Página {currentPage} de {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 rounded bg-[#007cb2] text-white hover:bg-[#00689c] disabled:bg-gray-400"
        >
          Próxima
        </button>
      </div>

      {selected && (
        <RegistroModal
          data={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}