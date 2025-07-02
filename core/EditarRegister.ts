'use server'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function updateSolicitante(id: number, data: any, token: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/solicitantes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Erro ao atualizar solicitante');
    return json;
  } catch (err: any) {
    console.error('Erro ao atualizar solicitante:', err.message);
    throw err;
  }
}
