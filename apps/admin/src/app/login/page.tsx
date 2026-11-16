'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setTokens } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@thematernityhome.pk');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setTokens(data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tmh-login-wrap">
      <form className="tmh-login-card tmh-form" onSubmit={onSubmit}>
        <div className="d-flex align-items-center gap-3 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand-mark.png" alt="" width={52} height={52} className="tmh-brand-mark" />
          <div>
            <div className="tmh-brand fs-3 mb-0 text-white">The Maternity Home</div>
            <div className="tmh-meta">Staff Operations & Order Portal</div>
          </div>
        </div>

        <div className="border-top my-3" style={{ borderColor: 'var(--tmh-line-soft)' }} />

        <div className="mb-3">
          <label className="form-label">Staff Email</label>
          <input
            className="form-control"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@thematernityhome.pk"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            <span>Password</span>
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none small text-success"
              style={{ fontSize: '0.8rem' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} me-1`} />
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </label>
          <div className="position-relative">
            <input
              className="form-control"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-3">
            <i className="bi bi-exclamation-circle-fill me-2" />
            {error}
          </div>
        )}

        <button className="btn btn-tmh w-100 py-2 fs-6" disabled={busy} type="submit">
          {busy ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              <i className="bi bi-shield-lock me-2" />
              Sign In to Admin Portal
            </>
          )}
        </button>

        <div className="mt-3 p-2 rounded-3 text-center" style={{ background: 'rgba(0, 0, 0, 0.25)' }}>
          <div className="tmh-meta small">
            Default Owner: <code>owner@thematernityhome.pk</code>
          </div>
          <div className="tmh-meta small">
            Password: <code>Admin123!</code>
          </div>
        </div>
      </form>
    </div>
  );
}
