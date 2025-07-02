'use server'

import * as Demanda from '../../core/CadastrarDemanda'

export async function registrarDemanda(data: any, token: string, isAdmin: boolean) {
  if (data.id) {
    return await Demanda.editarDemanda(data, token)
  } else {
    return await Demanda.criarDemanda(data, token)
  }
}


export async function getProximoProtocolo(token: string) {
  return Demanda.getProximoProtocolo(token)
}

export async function getSetores(token: string) {
  return await Demanda.listarSetores(token)
}

export async function getUsuarios(token: string) {
  return await Demanda.listarUsuarios(token)
}
