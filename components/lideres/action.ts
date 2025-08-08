'use server'

import { getLideres } from "../../core/Liderers"

export async function buscarLideres(token: string) {
  return getLideres(token)
}
