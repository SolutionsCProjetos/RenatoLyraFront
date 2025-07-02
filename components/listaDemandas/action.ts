'use server'

import * as Demanda from '../../core/Demandas'

// Agora usamos `userId` em vez de `cpf`
export async function getTodasDemandas(userId: number, isAdmin: boolean, token:string) {
  return await Demanda.getTodasDemandas(userId, isAdmin, token)
}

export async function criarDemanda(data: any, token:string) {
  return await Demanda.criarDemanda(data, token)
}

export async function excluirDemanda(id: number, token:string) {
  return await Demanda.excluirDemanda(id, token)
}