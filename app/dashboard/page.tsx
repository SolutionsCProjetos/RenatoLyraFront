'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { FaBars, FaChevronDown } from 'react-icons/fa'
import Logo from '../../assets/img/LogoN.png'
import Image from 'next/image'
import ListaSolicitante from '../../components/listaSolicitante/ListaSolicitante'
import ListaDemandas from '../../components/listaDemandas/ListaDemandas'
import AdminPage from '../../components/adm/Admin'

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminOpen, setAdminOpen] = useState(false)
  const [activePage, setActivePage] = useState('Lista Demandas')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/')
      return
    }

    try {
      const decoded: any = jwtDecode(token)
      if (!decoded) {
        router.push('/')
        return
      }

      setIsAdmin(decoded?.adm === true)
      setUserName(decoded?.nome || '')
    } catch (err) {
      console.error('Erro ao decodificar token:', err)
      router.push('/')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('solicitante')
    router.push('/')
  }

  const menuItems = ['Lista Demandas', 'Lista Solicitantes']

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-[#17686f] text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'}`}
      >
        <div className="p-4 font-bold text-lg border-b border-white">
          <Image
            src={Logo}
            height={sidebarOpen ? 500 : 100}
            width={sidebarOpen ? 500 : 100}
            alt="Logo"
          />
        </div>

        <nav className="flex flex-col gap-2 p-2">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`text-left hover:bg-[#1c7d87] px-3 py-2 rounded transition-all w-full ${sidebarOpen ? 'text-base' : 'text-xs text-center'} ${activePage === item ? 'bg-[#1c7d87]' : ''}`}
            >
              {sidebarOpen ? item : item[0]}
            </button>
          ))}

          {isAdmin && (
            <>
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className={`flex items-center justify-between hover:bg-[#1c7d87] px-3 py-2 rounded ${sidebarOpen ? 'text-base' : 'text-xs justify-center'}`}
              >
                {sidebarOpen ? 'Administrativo' : 'A'}
                {sidebarOpen && (
                  <FaChevronDown
                    className={`ml-2 transition-transform ${adminOpen ? 'rotate-180' : ''}`}
                    size={12}
                  />
                )}
              </button>

              {adminOpen && sidebarOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 text-sm">
                  <button
                    onClick={() => setActivePage('Administrativo')}
                    className="text-left hover:underline"
                  >
                    Configurações
                  </button>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Rodapé da sidebar com nome do usuário */}
        {userName && sidebarOpen && (
          <div className="mt-auto p-4 text-sm text-white opacity-80">
            Logado como: <br />
            <span className="font-semibold">{userName}</span>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 text-[#17686f] focus:outline-none"
          >
            <FaBars size={20} />
          </button>
          <h1 className="text-lg font-semibold text-[#17686f]">Dashboard</h1>

          {/* Botão de logout */}
          <button
            onClick={handleLogout}
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Sair
          </button>
        </header>

        {/* Page content */}
        <main className="p-6">
          {activePage === 'Lista Demandas' && <ListaDemandas />}
          {activePage === 'Lista Solicitantes' && <ListaSolicitante />}
          {activePage === 'Administrativo' && isAdmin && <AdminPage />}
          {activePage === 'Administrativo' && !isAdmin && (
            <p className="text-red-600 font-semibold">Acesso não autorizado.</p>
          )}
        </main>
      </div>
    </div>
  )
}
