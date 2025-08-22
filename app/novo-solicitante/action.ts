// 'use server'

// import * as Register from '../../core/Register'

// import type { SolicitanteData } from '../../core/Register'

// export async function registrarSolicitante(data: SolicitanteData) {
//   return Register.registrarSolicitante(data)
// }

'use server'

import * as Register from '../../core/Register'
import type { SolicitanteData } from '../../core/Register'

type MaybePrismaError = {
  code?: string
  meta?: Record<string, unknown>
  message?: string
}

function mapPrismaError(err: unknown): string {
  const e = err as MaybePrismaError;

  switch (e?.code) {
    case 'P2002':
      return 'Já existe um cadastro com este CPF/E-mail.'
    case 'P2000':
      // opcional: usar meta para detalhar qual coluna
      const col = typeof e.meta?.['column_name'] === 'string' ? ` (${e.meta!['column_name']})` : ''
      return `Um campo excedeu o tamanho permitido${col}.`
    case 'P2025':
      return 'Registro não encontrado para atualizar.'
    default:
      return 'Erro interno ao salvar solicitante.'
  }
}

export async function registrarSolicitante(data: SolicitanteData) {
  try {
    const result = await Register.registrarSolicitante(data)
    return { ok: true, data: result }
  } catch (err) {
    console.error('Erro ao registrar solicitante:', err)
    return { ok: false, error: mapPrismaError(err) }
  }
}


