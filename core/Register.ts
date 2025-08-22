// 'use server'

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string

// export interface SolicitanteData {
//   nomeCompleto?: string
//   cpf: string
//   email?: string
//   senha: string
//   telefoneContato?: string
//   titulo?: string
//   cep?: string
//   endereco?: string
//   bairro?: string
//   num?: string
//   zona?: string
//   pontoReferencia?: string
//   secaoEleitoral?: string
//   indicadoPor: string;
//   meio: string;
//   zonaEleitoral?: string;
//   observacoes?: string;
//   liderNome?: string;
// }

// // Tipos para as respostas
// interface LoginSuccessResponse {
//   message: string
//   solicitante: {
//     id: number
//     nomeCompleto: string
//     cpf: string
//     email?: string
//     telefoneContato?: string
//     adm: boolean
//     [key: string]: any
//   }
//   token: string
// }

// interface LoginErrorResponse {
//   error: true
//   message: string
// }

// export type LoginResponse = LoginSuccessResponse | LoginErrorResponse

// export async function registrarSolicitante(data: SolicitanteData): Promise<LoginSuccessResponse> {
//   try {
//     const response = await fetch(`${BASE_URL}/solicitantes/register`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(data),
//     })

//     const json = await response.json()

//     if (!response.ok) {
//       const message = json?.message || json?.error || 'Erro ao registrar solicitante'
//       throw new Error(message)
//     }

//     return json
//   } catch (err) {
//     console.error('Erro no registro:', err)
//     if (err instanceof Error) throw new Error(err.message)
//     throw new Error('Erro inesperado no registro')
//   }
// }

// export async function loginSolicitante({
//   email,
//   senha,
// }: {
//   email: string
//   senha: string
// }): Promise<LoginResponse> {
//   try {
//     const response = await fetch(`${BASE_URL}/solicitantes/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ email, senha }),
//     })

//     const json = await response.json()
    
//     if (!response.ok) {
//       // Trata especificamente o caso de senha incorreta
//       if (response.status === 401 && json.message === 'Senha incorreta') {
//         return {
//           error: true,
//           message: json.message
//         }
//       }
//       // Outros erros
//       return {
//         error: true,
//         message: json.message || json.error || 'Credenciais inválidas'
//       }
//     }
    
//     return json as LoginSuccessResponse
//   } catch (err: any) {
//     console.error('Erro no login:', err)
//     return {
//       error: true,
//       message: 'Erro ao conectar com o servidor'
//     }
//   }
// }

// export async function updateSolicitante(id: number, data: any): Promise<any> {
//   try {
//     const response = await fetch(`${BASE_URL}/solicitantes/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(data)
//     })

//     const json = await response.json()

//     if (!response.ok) {
//       const message = json?.message || json?.error || 'Erro ao atualizar solicitante'
//       throw new Error(message)
//     }

//     return json
//   } catch (err) {
//     console.error('Erro ao atualizar solicitante:', err)
//     if (err instanceof Error) throw new Error(err.message)
//     throw new Error('Erro inesperado ao atualizar solicitante')
//   }
// }




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
  // opcionais de verdade
  indicadoPor?: string
  meio: string // <- obrigatório conforme seu form
  zonaEleitoral?: string
  observacoes?: string
  liderNome?: string
  liderId?: number | string
}

// ---------- Tipos auxiliares ----------
type CoreResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string }

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

// ---------- REGISTRAR (agora retorna envelope, sem throw) ----------
export async function registrarSolicitante(data: SolicitanteData): Promise<CoreResult<any>> {
  try {
    const response = await fetch(`${BASE_URL}/solicitantes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // opcional: normalizar liderId para número
      body: JSON.stringify({
        ...data,
        liderId:
          data.liderId === '' || data.liderId == null
            ? undefined
            : Number(data.liderId),
      }),
    })

    // tenta ler JSON (mas não falha se não for JSON)
    let json: any = null
    try {
      json = await response.json()
    } catch {
      json = null
    }

    if (!response.ok) {
      // pega a msg que teu backend manda (error/message/detalhe)
      const message =
        json?.error ||
        json?.message ||
        (json?.detalhe ? `Erro: ${json.detalhe}` : null) ||
        `Erro HTTP ${response.status}`
      return { ok: false, error: String(message) }
    }

    return { ok: true, data: json }
  } catch (err: any) {
    console.error('Erro no registro:', err)
    // erro de rede/time-out/etc.
    return { ok: false, error: 'Falha ao conectar com o servidor' }
  }
}

// ---------- LOGIN (inalterado) ----------
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })

    const json = await response.json()

    if (!response.ok) {
      if (response.status === 401 && json.message === 'Senha incorreta') {
        return { error: true, message: json.message }
      }
      return {
        error: true,
        message: json.message || json.error || 'Credenciais inválidas',
      }
    }

    return json as LoginSuccessResponse
  } catch (err: any) {
    console.error('Erro no login:', err)
    return { error: true, message: 'Erro ao conectar com o servidor' }
  }
}

// ---------- UPDATE (mantido com throw, se quiser também pode virar envelope) ----------
export async function updateSolicitante(id: number, data: any): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/solicitantes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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



