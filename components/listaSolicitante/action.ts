'use server'

import * as Solicitante from "../../core/Solicitante"

export async function getSolicitantesPorCpf(cpf: string, token:string) {
  return Solicitante.getSolicitantesPorCpf(cpf, token)
}

export async function getTodosSolicitantes(token:string) {
  return Solicitante.getTodosSolicitantes(token)
}
