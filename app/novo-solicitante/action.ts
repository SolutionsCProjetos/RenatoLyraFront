// 'use server'

// import * as Register from '../../core/Register'

// import type { SolicitanteData } from '../../core/Register'

// export async function registrarSolicitante(data: SolicitanteData) {
//   return Register.registrarSolicitante(data)
// }

'use server'

import * as Register from '../../core/Register'
import type { SolicitanteData } from '../../core/Register'
import { Prisma } from '@prisma/client'

function mapPrismaError(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return 'Já existe um cadastro com este CPF/E-mail.'
    if (err.code === 'P2000') return 'Um campo excedeu o tamanho permitido (ex.: número ou complemento).'
    if (err.code === 'P2025') return 'Registro não encontrado para atualizar.'
  }
  return 'Erro interno ao salvar solicitante.'
}

export async function registrarSolicitante(data: SolicitanteData) {
  try {
    const result = await Register.registrarSolicitante(data)
    return { ok: true, data: result }
  } catch (err) {
    console.error('Erro ao registrar solicitante:', err) // vai pro log do server
    return { ok: false, error: mapPrismaError(err) }
  }
}
