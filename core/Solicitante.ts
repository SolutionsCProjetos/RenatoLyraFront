'use server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function getSolicitantesPorCpf(cpf: string, token:string) {
  try {

    const response = await fetch(`${BASE_URL}/solicitantes?cpf=${cpf}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Erro ao buscar solicitantes')
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar solicitantes por CPF:', error)
    throw error
  }
}

export async function getTodosSolicitantes(token:string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solicitantes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Erro ao buscar todos os solicitantes');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar todos os solicitantes:', error);
    throw error;
  }
}

export async function registrarComId(dados: any, token: string) {
  console.log('📦 Dados para /registrar-com-id:', dados)
  console.log('🔐 Token:', token)

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solicitantes/registrarID`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(dados)
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(json.message || json.error || 'Erro ao registrar solicitante com ID')
  }

  return json
}


export async function getSolicitantesDuplicados(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solicitantes/duplicados`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar duplicados: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro em getSolicitantesDuplicados:', error)
    throw error
  }
}

