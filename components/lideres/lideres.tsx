'use client'

import { useEffect, useState } from 'react'
import { FaChevronDown, FaFileExcel, FaFilePdf } from 'react-icons/fa'
import { getToken } from '../../utils/auth'
import { buscarLideres } from './action'
import { utils, writeFile } from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import LiderModal from '../LideresModal/lideresModal'

interface ILider {
    id: number
    nome: string
    bairro: string
}

const ITEMS_PER_PAGE = 20

export default function ListaLideres() {
    const [data, setData] = useState<ILider[]>([])
    const [filteredData, setFilteredData] = useState<ILider[]>([])
    const [selected, setSelected] = useState<ILider | null>(null)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const fetchData = async () => {
        try {
            const token = getToken()
            if (!token) {
                alert('Sessão expirada. Faça login novamente.')
                return
            }

            const result = await buscarLideres(token)
            setData(result)
            setFilteredData(result)
        } catch (err) {
            alert('Erro ao buscar líderes')
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        const filtered = data.filter(item =>
            item.nome.toLowerCase().includes(search.toLowerCase()) ||
            item.bairro.toLowerCase().includes(search.toLowerCase())
        )
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
            Nome: item.nome,
            Bairro: item.bairro
        }))

        const worksheet = utils.json_to_sheet(dataToExport)
        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, 'Lideres')
        writeFile(workbook, 'lideres.xlsx')
    }

    const exportToPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('Relatório de Líderes', 14, 15)

        const headers = [['ID', 'Nome', 'Bairro']]
        const pdfData = filteredData.map(item => [
            item.id.toString(),
            item.nome,
            item.bairro
        ])

        autoTable(doc, {
            head: headers,
            body: pdfData,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [28, 125, 135] }
        })

        doc.save('lideres.pdf')
    }

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#17686f]">Lista de Líderes</h2>
                <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                    Total de Registros: {data.length}
                </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou bairro..."
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
                    <button
                    onClick={() => setSelected({ id: 0, nome: '', bairro: '' })}
                    className="bg-[#007cb2] text-white px-6 py-2 rounded hover:bg-[#00689c] transition"
                >
                    Novo Líder
                </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-md">
                <table className="min-w-full text-sm text-left border-collapse">
                    <thead className="bg-[#1c7d87] text-white">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Nome</th>
                            <th className="px-4 py-3">Bairro</th>
                            <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(item => (
                            <tr key={item.id} className="even:bg-[#c4f9ff]">
                                <td className="px-4 py-3">{item.id}</td>
                                <td className="px-4 py-3 font-medium">{item.nome}</td>
                                <td className="px-4 py-3">{item.bairro}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => setSelected(item)}
                                        className="text-[#007cb2] hover:underline"
                                    >
                                        Editar
                                    </button>

                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center text-gray-500 py-4">
                                    Nenhum líder encontrado.
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
                <LiderModal
                    data={selected}
                    onClose={() => setSelected(null)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    )
}
