const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getTokens() {
  if (typeof window === 'undefined') return { accessToken: '', refreshToken: '' };
  return {
    accessToken: localStorage.getItem('tmh_access') || '',
    refreshToken: localStorage.getItem('tmh_refresh') || '',
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('tmh_access', accessToken);
  localStorage.setItem('tmh_refresh', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('tmh_access');
  localStorage.removeItem('tmh_refresh');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const { accessToken } = getTokens();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
      if (Array.isArray(data.message)) message = data.message.join(', ');
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function formatPkr(amount: number) {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}
