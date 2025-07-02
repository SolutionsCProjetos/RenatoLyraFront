'use server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function verificarIdentidade(email: string, cpf: string) {
  const response = await fetch(`${BASE_URL}/solicitantes/verificar-identidade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, cpf })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || 'Erro ao verificar identidade');
  }

  return await response.json();
}

export async function redefinirSenha(email: string, cpf: string, novaSenha: string) {
  const response = await fetch(`${BASE_URL}/solicitantes/redefinir-senha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, cpf, novaSenha })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || 'Erro ao redefinir senha');
  }

  return await response.json();
}
