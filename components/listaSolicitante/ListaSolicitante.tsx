'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EditarRegistro from '../editarRegistro/EditarRegistro'
import { getToken, parseJwt } from '../../utils/auth'
import { getSolicitantesPorCpf, getTodosSolicitantes } from './action'

interface ISolicitante {
  id: number
  solicitante?: string
  nomeCompleto?: string
  telefoneContato?: string
  titulo?: string
  zona?: string
}

export default function ListaSolicitante() {
  const router = useRouter()
  const [data, setData] = useState<ISolicitante[]>([])
  const [filteredData, setFilteredData] = useState<ISolicitante[]>([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<ISolicitante | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const ITEMS_PER_PAGE = 20

  const fetchSolicitantes = async () => {
    const token = getToken()
    if (!token) return router.push('/')

    const user = parseJwt(token)
    if (!user) return router.push('/')

    const { cpf, adm } = user
    setIsAdmin(adm)

    try {
      const res = adm
        ? await getTodosSolicitantes(token)
        : await getSolicitantesPorCpf(cpf, token)

      setData(res)
      setFilteredData(res)
    } catch (err) {
      alert('Erro ao carregar dados')
    }
  }

  useEffect(() => {
    fetchSolicitantes()
  }, [])

  useEffect(() => {
    const filtered = data.filter(item =>
      item.nomeCompleto?.toLowerCase().includes(search.toLowerCase()) ||
      item.solicitante?.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [search, data])

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleClose = async () => {
    setSelectedItem(null)
    await fetchSolicitantes() // Recarrega os dados atualizados
  }

  const handleNew = () => {
      window.location.href = "/novo-solicitante";
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#17686f]">
          Lista de Solicitantes
        </h2>
        {isAdmin && (
          <span className="text-xs px-3 py-1 bg-green-100 text-green-700 border border-green-400 rounded-full">
            Administrador
          </span>
        )}
      </div>

      {selectedItem ? (
        <EditarRegistro item={selectedItem} setClose={handleClose} />
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por nome ou solicitante..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-[#007cb2] rounded px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
            />
            <button
              onClick={() => {
                setSearch('')
                setFilteredData(data)
              }}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Limpar
            </button>
            {isAdmin && (
            <button
              onClick={handleNew}
              className="bg-[#007cb2] text-white px-6 py-2 rounded hover:bg-[#00689c] transition"
            >
             Novo Solicitante
            </button>
             )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-[#1c7d87] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Id</th>
                  <th className="px-4 py-2 text-left">Solicitante</th>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Contato</th>
                  <th className="px-4 py-2 text-left">Zona</th>
                  <th className="px-4 py-2 text-left">Título</th>
                  <th className="px-4 py-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map(item => (
                  <tr key={item.id} className="even:bg-[#c4f9ff]">
                    <td className="px-4 py-2">{item.id}</td>
                    <td className="px-4 py-2">{item.solicitante}</td>
                    <td className="px-4 py-2">{item.nomeCompleto}</td>
                    <td className="px-4 py-2">{item.telefoneContato}</td>
                    <td className="px-4 py-2">{item.zona}</td>
                    <td className="px-4 py-2">{item.titulo}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-4">
                      Nenhum registro encontrado
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
            <span className="text-gray-700">
              Página {currentPage} de {Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
            </span>
            <button
              disabled={currentPage === Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / ITEMS_PER_PAGE)))}
              className="px-3 py-1 rounded bg-[#007cb2] text-white hover:bg-[#00689c] disabled:bg-gray-400"
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  )
}
