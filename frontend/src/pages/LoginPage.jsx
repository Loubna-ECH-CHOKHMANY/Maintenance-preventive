import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'ADMIN',          email: 'admin@gmpp.ma',         password: 'Admin@2024', color: '#ef4444' },
  { role: 'RESPONSABLE',    email: 'responsable@gmpp.ma',   password: 'Resp@2024',  color: '#f59e0b' },
  { role: 'CHEF ÉQUIPE',    email: 'chef@gmpp.ma',          password: 'Chef@2024',  color: '#3b82f6' },
  { role: 'TECHNICIEN',     email: 'tech1@gmpp.ma',         password: 'Tech@2024',  color: '#10b981' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: 'admin@gmpp.ma', motDePasse: 'Admin@2024' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.motDePasse);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, motDePasse: password });
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 20% 60%, rgba(59,130,246,.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,.06) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: 440, padding: 20 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 20, color: '#fff',
            boxShadow: '0 0 40px rgba(59,130,246,.3)'
          }}>⚙️</div>
          <h1 style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color: 'var(--white)' }}>GMPP Pro</h1>
          <p style={{ color: 'var(--muted2)', fontSize: 13, marginTop: 4 }}>Gestion de Maintenance Préventive Planifiée</p>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'Rajdhani', fontSize: 20, marginBottom: 22, textAlign: 'center', color: 'var(--white)' }}>
            Connexion
          </h2>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com" required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" value={form.motDePasse}
                onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,.1)', border: '1px solid var(--danger)',
                borderRadius: 8, padding: '9px 13px', color: 'var(--danger)', fontSize: 13
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14, marginTop: 4 }}>
              {loading ? '🔄 Connexion...' : '🔐 Se connecter'}
            </button>
          </form>

          <div style={{
            marginTop: 20, padding: 14,
            background: 'rgba(59,130,246,.04)', border: '1px solid rgba(59,130,246,.15)',
            borderRadius: 8
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 10, letterSpacing: 1 }}>
              COMPTES DE DÉMONSTRATION
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {DEMO_ACCOUNTS.map(({ role, email, password, color }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillDemo(email, password)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 6, padding: '7px 10px', cursor: 'pointer',
                    transition: 'background .15s', textAlign: 'left', width: '100%'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                >
                  <div>
                    <span style={{
                      display: 'inline-block', fontSize: 9, fontWeight: 700,
                      padding: '2px 6px', borderRadius: 10, marginRight: 8,
                      background: color + '22', color, letterSpacing: .5
                    }}>{role}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{email}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>{password}</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8, opacity: .7 }}>
              Cliquez pour remplir automatiquement • Données de démonstration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
