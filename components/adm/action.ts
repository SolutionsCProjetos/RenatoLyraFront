// action.ts
'use server'

import * as UsuarioCore from '../../core/Adm'

export async function getTodosUsuarios(token:string) {
  return await UsuarioCore.getTodosUsuarios(token)
}

export async function criarOuAtualizarUsuario(data: any, token:string) {
  return await UsuarioCore.criarOuAtualizarUsuario(data, token)
}

export async function deletarUsuario(id: number, token:string) {
  return await UsuarioCore.deletarUsuario(id, token)
}
