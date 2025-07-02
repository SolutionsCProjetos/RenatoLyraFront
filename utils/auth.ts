// utils/auth.ts
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
