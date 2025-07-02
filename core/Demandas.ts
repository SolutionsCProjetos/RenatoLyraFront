'use server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function getTodasDemandas(userId: number, isAdmin: boolean, token: string) {
  try {
    const url = isAdmin
      ? `${BASE_URL}/demandas`
      : `${BASE_URL}/demandas?id=${userId}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error('Erro ao buscar demandas')
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar demandas:', error)
    throw error
  }
}

export async function criarDemanda(payload: any, token: string) {
  try {
    const response = await fetch(`${BASE_URL}/demandas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('Erro ao criar demanda')
    return await response.json()
  } catch (error) {
    console.error('Erro ao criar demanda:', error)
    throw error
  }
}

export async function excluirDemanda(id: number, token: string) {
  try {
    const response = await fetch(`${BASE_URL}/demandas/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) throw new Error('Erro ao excluir demanda')
    return await response.json()
  } catch (error) {
    console.error('Erro ao excluir demanda:', error)
    throw error
  }
}
