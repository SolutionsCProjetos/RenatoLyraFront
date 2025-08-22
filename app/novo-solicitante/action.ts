// 'use server'

// import * as Register from '../../core/Register'

// import type { SolicitanteData } from '../../core/Register'

// export async function registrarSolicitante(data: SolicitanteData) {
//   return Register.registrarSolicitante(data)
// }

'use server'

import * as Register from '../../core/Register'
import type { SolicitanteData } from '../../core/Register'

// Tipos auxiliares
type MaybePrismaError = {
  code?: string
  meta?: Record<string, unknown>
  message?: string
  name?: string
}

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

type CoreEnvelope<T = unknown> = { ok: boolean; error?: string; data?: T }

function isCoreEnvelope<T = unknown>(x: unknown): x is CoreEnvelope<T> {
  return !!x && typeof x === 'object' && 'ok' in (x as any) && typeof (x as any).ok === 'boolean'
}

const SHOW_DETAILS =
  process.env.SHOW_DETAILED_ERRORS === 'true' || process.env.NODE_ENV !== 'production'

function mapPrismaError(err: unknown): string {
  const e = err as MaybePrismaError

  switch (e?.code) {
    case 'P2002':
      return 'Já existe um cadastro com este CPF/E-mail.'
    case 'P2000': {
      const col =
        typeof e.meta?.['column_name'] === 'string' ? ` (${String(e.meta['column_name'])})` : ''
      return `Um campo excedeu o tamanho permitido${col}.`
    }
    case 'P2025':
      return 'Registro não encontrado para atualizar.'
  }

  if (e?.name === 'PrismaClientValidationError') {
    return SHOW_DETAILS
      ? `Validação do Prisma falhou: ${e.message ?? ''}`
      : 'Dados inválidos no envio. Verifique os campos.'
  }
  if (e?.name === 'PrismaClientUnknownRequestError') {
    return SHOW_DETAILS
      ? `Erro de requisição do Prisma: ${e.message ?? ''}`
      : 'Falha ao executar a operação no banco.'
  }

  if (e?.message) {
    return SHOW_DETAILS ? e.message : 'Erro interno ao salvar solicitante.'
  }
  return 'Erro interno ao salvar solicitante.'
}

export async function registrarSolicitante(
  data: SolicitanteData
): Promise<ActionResult<any>> {
  try {
    const result = await Register.registrarSolicitante(data)

    // Se o core retornar envelope { ok, error, data }, respeite
    if (isCoreEnvelope(result)) {
      if (!result.ok) {
        return { ok: false, error: result.error ?? 'Falha ao salvar solicitante.' }
      }
      return { ok: true, data: result.data }
    }

    // Caso o core retorne “cru” (ex.: registro criado)
    return { ok: true, data: result }
  } catch (err) {
    console.error('Erro ao registrar solicitante:', err)
    const msg = mapPrismaError(err)
    return { ok: false, error: msg }
  }
}




