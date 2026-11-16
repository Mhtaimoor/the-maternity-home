'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setTokens } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@thematernityhome.pk');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setTokens(data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tmh-login-wrap">
      <form className="tmh-login-card tmh-form" onSubmit={onSubmit}>
        <div className="tmh-brand fs-3 mb-1">The Maternity Home</div>
        <div className="tmh-meta mb-4">Operations portal · secure staff access</div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <div className="alert alert-danger py-2">{error}</div> : null}
        <button className="btn btn-tmh w-100" disabled={busy} type="submit">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="small text-secondary mt-3 mb-0">
          Seed owner: owner@thematernityhome.pk / Admin123!
        </p>
      </form>
    </div>
  );
}
