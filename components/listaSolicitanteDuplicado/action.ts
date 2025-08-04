'use server'

import { getSolicitantesDuplicados } from '../../core/Solicitante'

export async function buscarDuplicados(token: string) {
  return getSolicitantesDuplicados(token)
}
