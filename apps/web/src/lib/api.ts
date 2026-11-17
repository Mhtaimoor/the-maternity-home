const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function getCartId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('tmh_cart_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('tmh_cart_id', id);
  }
  return id;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const cartId = typeof window !== 'undefined' ? getCartId() : '';
  if (cartId) headers.set('x-cart-id', cartId);

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
