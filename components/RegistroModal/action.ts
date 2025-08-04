'use server'

import * as Solicitante from '../../core/Solicitante'

export async function registrarSolicitante(dados: any, token: string) {
  return Solicitante.registrarComId(dados, token)
}
