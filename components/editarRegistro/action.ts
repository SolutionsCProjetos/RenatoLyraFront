'use server'

import * as Register from '../../core/EditarRegister'

export async function updateSolicitante(id: number, data: any, token: string) {
  return Register.updateSolicitante(id, data, token)
}
