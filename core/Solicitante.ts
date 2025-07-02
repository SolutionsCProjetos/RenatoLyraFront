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
