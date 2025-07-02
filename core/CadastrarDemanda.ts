'use server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function criarDemanda(data: any, token: string) {
  try {
    const response = await fetch(`${BASE_URL}/demandas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        protocolo: data.protocolo,
        setor: data.setor,
        prioridade: data.prioridade,
        status: data.status,
        dataSolicitacao: data.dataSolicitacao ? `${data.dataSolicitacao}T00:00:00` : null,
        dataTermino: data.dataTermino ? `${data.dataTermino}T00:00:00` : null,
        solicitant: data.solicitant,
        nomeCompleto: data.nomeCompleto,
        cpf: data.cpf,
        reincidencia: data.reincidencia,
        meioSolicitacao: data.meioSolicitacao,
        anexarDocumentos: data.anexarDocumentos,
        envioCobranca1: data.envioCobranca1,
        envioCobranca2: data.envioCobranca2,
        envioParaResponsavel: data.envioParaResponsavel,
        observacoes: data.observacoes,
        solicitantId: data.solicitantId
      })
    })

    if (!response.ok) {
      const msg = await response.text()
      console.error('Erro no response:', msg)
      throw new Error('Erro ao criar demanda')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro no core/Demanda.ts:', error)
    throw error
  }
}

export async function getProximoProtocolo(token: string) {
  try {
    const res = await fetch(`${BASE_URL}/demandas/proximo-protocolo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Erro ao buscar próximo protocolo')
    const data = await res.json()
    return data.protocolo
  } catch (err) {
    console.error('Erro ao gerar protocolo:', err)
    throw err
  }
}


export async function editarDemanda(data: any, token: string) {
  try {
    const response = await fetch(`${BASE_URL}/demandas/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const msg = await response.text();
      console.error('Erro no response:', msg);
      throw new Error('Erro ao editar demanda');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao editar demanda:', error);
    throw error;
  }
}


export async function listarSetores(token: string) {
  try {
    const response = await fetch(`${BASE_URL}/demandas/setores`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar setores')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro em listarSetores:', error)
    throw error
  }
}


export async function listarUsuarios(token: string) {
  try {
    const response = await fetch(`${BASE_URL}/solicitantes`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar usuários')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro em listarUsuarios:', error)
    throw error
  }
}
