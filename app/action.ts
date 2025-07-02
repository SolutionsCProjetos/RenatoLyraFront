'use server'

import * as Register from '../core/Register'

interface LoginData {
  email: string
  senha: string
}

export async function loginSolicitante(data: LoginData) {
  const result = await Register.loginSolicitante(data)

  // Retorna diretamente, seja sucesso ou erro
  return result
}
