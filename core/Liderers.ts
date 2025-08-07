'use server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Buscar todos os líderes
export async function getLideres(token: string) {
  try {
    const response = await fetch(`${BASE_URL}/lideres`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`Erro ao buscar líderes: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Erro em getLideres:', error)
    throw error
  }
}

// Criar novo líder
export async function registrarLider(dados: { nome: string; bairro: string }, token: string) {
  try {
    const response = await fetch(`${BASE_URL}/lideres`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    })

    const json = await response.json()

    if (!response.ok) throw new Error(json.message || json.error || 'Erro ao registrar líder')

    return json
  } catch (error) {
    console.error('Erro em registrarLider:', error)
    throw error
  }
}

// Editar líder existente
export async function editarLider(id: number, dados: { nome: string; bairro: string }, token: string) {
  try {
    const response = await fetch(`${BASE_URL}/lideres/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    })

    const json = await response.json()

    if (!response.ok) throw new Error(json.message || json.error || 'Erro ao editar líder')

    return json
  } catch (error) {
    console.error('Erro em editarLider:', error)
    throw error
  }
}
