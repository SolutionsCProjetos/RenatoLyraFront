'use server'

import * as EsqueciSenha from '../../core/EsqueciSenha'

export async function verificarIdentidade(email: string, cpf: string) {
  return await EsqueciSenha.verificarIdentidade(email, cpf)
}

export async function redefinirSenha(email: string, cpf: string, novaSenha: string) {
  return await EsqueciSenha.redefinirSenha(email, cpf, novaSenha)
}
