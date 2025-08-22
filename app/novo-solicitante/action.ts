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
  name?: string
}

const SHOW_DETAILS =
  process.env.SHOW_DETAILED_ERRORS === 'true' || process.env.NODE_ENV !== 'production'

function mapPrismaError(err: unknown): string {
  const e = err as MaybePrismaError

  // Prisma Known
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

  // Prisma Validation / Unknown (sem code, mas com name)
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

  // Qualquer outro erro: use a message se existir, senão genérico
  if (e?.message) {
    return SHOW_DETAILS ? e.message : 'Erro interno ao salvar solicitante.'
  }

  return 'Erro interno ao salvar solicitante.'
}

export async function registrarSolicitante(data: SolicitanteData) {
  try {
    const result = await Register.registrarSolicitante(data)

    // Se o core retornar um envelope de erro, respeite-o
    if (result && typeof result === 'object' && 'ok' in result) {
      // @ts-expect-error checagem em runtime
      if (result.ok === false) {
        // @ts-expect-error checagem em runtime
        const msg = result.error || 'Falha ao salvar solicitante.'
        return { ok: false, error: String(msg) }
      }
      // sucesso envelopado
      return { ok: true, data: result.data ?? result }
    }

    // sucesso “cru”
    return { ok: true, data: result }
  } catch (err) {
    console.error('Erro ao registrar solicitante:', err)
    const msg = mapPrismaError(err)

    // Em dev, opcionalmente anexe pequenas dicas
    if (SHOW_DETAILS && (err as any)?.meta) {
      const meta = (err as any).meta
      if (meta?.column_name && !msg.includes(String(meta.column_name))) {
        return { ok: false, error: `${msg} [coluna: ${String(meta.column_name)}]` }
      }
    }
    return { ok: false, error: msg }
  }
}



