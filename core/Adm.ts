'use server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function getTodosUsuarios(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) throw new Error('Erro ao buscar usuários')
    return await res.json()
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return []
  }
}

export async function criarOuAtualizarUsuario(data: any, token: string) {
  const isUpdate = !!data.id
  const url = isUpdate
    ? `${BASE_URL}/usuarios/${data.id}`
    : `${BASE_URL}/usuarios`

  const method = isUpdate ? 'PUT' : 'POST'

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) throw new Error('Erro ao salvar usuário')
    return await res.json()
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
    throw error
  }
}

export async function deletarUsuario(id: number, token: string) {
  try {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error('Erro ao deletar usuário')
    return true
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return false
  }
}
