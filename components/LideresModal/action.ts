'use server'

import { editarLider, registrarLider } from "../../core/Liderers";

export async function criarLider(data: { nome: string; bairro: string }, token: string) {
  return registrarLider(data, token)
}

export async function atualizarLider(id: number, data: { nome: string; bairro: string }, token: string) {
  return editarLider(id, data, token)
}
