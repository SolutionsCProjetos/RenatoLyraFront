'use client'

import { useEffect, useState } from 'react'
import ModalAdminForm from './ModalAdminForm'
import {
    getTodosUsuarios,
    criarOuAtualizarUsuario,
    deletarUsuario
} from './action'
import { getToken } from '../../utils/auth'

const ITEMS_PER_PAGE = 10

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([])
    const [filtered, setFiltered] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [resetPasswordMode, setResetPasswordMode] = useState(false)
    const token = getToken();

    if (!token) {
       console.error('Sessão expirada. Faça login novamente.');
        return;
    }

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true)
            const lista = await getTodosUsuarios(token)
            setUsers(lista)
            setFiltered(lista)
            setLoading(false)
        }
        loadUsers()
    }, [])

    useEffect(() => {
        const filteredUsers = users.filter(
            u =>
                u.nome.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
        )
        setFiltered(filteredUsers)
        setCurrentPage(1)
    }, [search, users])

    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

    const handleEdit = (user: any) => {
        setSelectedUser(user)
        setResetPasswordMode(false)
        setShowModal(true)
    }

    const handleResetPassword = (user: any) => {
        setSelectedUser(user)
        setResetPasswordMode(true)
        setShowModal(true)
    }

    const handleDelete = async (id: number) => {
        const confirmed = confirm('Tem certeza que deseja deletar este usuário?')
        if (!confirmed) return

        const success = await deletarUsuario(id, token)
        if (success) {
            setUsers(prev => prev.filter(user => user.id !== id))
        } else {
            alert('Erro ao deletar usuário.')
        }
    }

    const handleNew = () => {
        setSelectedUser(null)
        setResetPasswordMode(false)
        setShowModal(true)
    }

    const handleSave = async (updatedUser: any) => {
        try {
            const result = await criarOuAtualizarUsuario(updatedUser, token)
            if (updatedUser.id) {
                // Atualização
                setUsers(prev => prev.map(u => (u.id === result.id ? result : u)))
            } else {
                // Criação
                setUsers(prev => [...prev, result])
            }
            setShowModal(false)
        } catch (error) {
            alert('Erro ao salvar usuário.')
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-[#17686f] mb-6">Admin</h2>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-[#007cb2] rounded px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#007cb2]"
                    />
                    <button
                        onClick={() => setSearch('')}
                        className="bg-gray-100 border border-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-200 transition"
                    >
                        Limpar
                    </button>
                </div>
                <button
                    onClick={handleNew}
                    className="bg-[#007cb2] text-white px-6 py-2 rounded hover:bg-[#00689c] transition"
                >
                    Novo
                </button>
            </div>

            {loading ? (
                <p className="text-center py-10 text-gray-600">Carregando usuários...</p>
            ) : (
                <div className="overflow-x-auto rounded-md">
                    <table className="min-w-full text-sm text-left border-collapse">
                        <thead className="bg-[#1c7d87] text-white">
                            <tr>
                                <th className="px-4 py-3">Nome</th>
                                <th className="px-4 py-3">E-mail</th>
                                <th className="px-4 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(user => (
                                <tr key={user.id} className="even:bg-[#c4f9ff]">
                                    <td className="px-4 py-3">{user.nome}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3 text-center space-x-3">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-[#007cb2] hover:underline"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Deletar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center text-gray-500 py-4">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paginação */}
            <div className="mt-6 flex justify-center items-center gap-3">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1 rounded bg-[#007cb2] text-white hover:bg-[#00689c] disabled:bg-gray-400"
                >
                    Anterior
                </button>

                <span className="text-gray-700">Página {currentPage} de {totalPages}</span>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1 rounded bg-[#007cb2] text-white hover:bg-[#00689c] disabled:bg-gray-400"
                >
                    Próxima
                </button>
            </div>

            {showModal && (
                <ModalAdminForm
                    user={selectedUser}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    resetPasswordMode={resetPasswordMode}
                />
            )}
        </div>
    )
}
