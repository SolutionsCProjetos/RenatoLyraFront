'use server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string

export interface SolicitanteData {
  nomeCompleto?: string
  cpf: string
  email?: string
  senha: string
  telefoneContato?: string
  titulo?: string
  cep?: string
  endereco?: string
  bairro?: string
  num?: string
  zona?: string
  pontoReferencia?: string
  secaoEleitoral?: string
  indicadoPor: string;
  meio: string;
  zonaEleitoral?: string;
}

// Tipos para as respostas
interface LoginSuccessResponse {
  message: string
  solicitante: {
    id: number
    nomeCompleto: string
    cpf: string
    email?: string
    telefoneContato?: string
    adm: boolean
    [key: string]: any
  }
  token: string
}

interface LoginErrorResponse {
  error: true
  message: string
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse

export async function registrarSolicitante(data: SolicitanteData): Promise<LoginSuccessResponse> {
  try {
    const response = await fetch(`${BASE_URL}/solicitantes/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })

    const json = await response.json()

    if (!response.ok) {
      const message = json?.message || json?.error || 'Erro ao registrar solicitante'
      throw new Error(message)
    }

    return json
  } catch (err) {
    console.error('Erro no registro:', err)
    if (err instanceof Error) throw new Error(err.message)
    throw new Error('Erro inesperado no registro')
  }
}

export async function loginSolicitante({
  email,
  senha,
}: {
  email: string
  senha: string
}): Promise<LoginResponse> {
  try {
    const response = await fetch(`${BASE_URL}/solicitantes/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha }),
    })

    const json = await response.json()
    
    if (!response.ok) {
      // Trata especificamente o caso de senha incorreta
      if (response.status === 401 && json.message === 'Senha incorreta') {
        return {
          error: true,
          message: json.message
        }
      }
      // Outros erros
      return {
        error: true,
        message: json.message || json.error || 'Credenciais inválidas'
      }
    }
    
    return json as LoginSuccessResponse
  } catch (err: any) {
    console.error('Erro no login:', err)
    return {
      error: true,
      message: 'Erro ao conectar com o servidor'
    }
  }
}

export async function updateSolicitante(id: number, data: any): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/solicitantes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const json = await response.json()

    if (!response.ok) {
      const message = json?.message || json?.error || 'Erro ao atualizar solicitante'
      throw new Error(message)
    }

    return json
  } catch (err) {
    console.error('Erro ao atualizar solicitante:', err)
    if (err instanceof Error) throw new Error(err.message)
    throw new Error('Erro inesperado ao atualizar solicitante')
  }
}

