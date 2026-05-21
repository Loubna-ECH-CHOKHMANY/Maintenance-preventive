import React, { useState, useEffect, useCallback } from 'react';
import { auditAPI } from '../services/api';
import { Shield, RefreshCw, Search, CheckCircle, XCircle } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const SIZE = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditAPI.getAll(page, SIZE);
      setLogs(res.data.content || []);
      setTotal(res.data.totalElements || 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.utilisateurEmail?.toLowerCase().includes(q) || l.action?.toLowerCase().includes(q) || l.entite?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛡️ Audit Logs</h1>
          <p className="page-subtitle">Traçabilité complète de toutes les actions — {total} entrées total</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 300 }}>
          <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input placeholder="Email, action, entité..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted2)', marginLeft: 'auto' }}>{filtered.length} résultat(s)</span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="loading-spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Horodatage</th><th>Utilisateur</th><th>Action</th><th>Entité</th><th>Détails</th><th>Statut</th></tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {l.timestamp ? new Date(l.timestamp).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span className="mono" style={{ color: 'var(--accent2)', fontSize: 11 }}>{l.utilisateurEmail || 'SYSTEM'}</span>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: 10, letterSpacing: '.3px' }}>{l.action}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted2)' }}>
                      {l.entite}{l.entiteId ? ` #${l.entiteId}` : ''}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--muted2)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.details || l.messageErreur || '—'}
                    </td>
                    <td>
                      {l.succes
                        ? <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                        : <XCircle size={14} style={{ color: 'var(--danger)' }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > SIZE && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Précédent</button>
          <span style={{ fontSize: 12, color: 'var(--muted2)' }}>Page {page + 1} / {Math.ceil(total / SIZE)}</span>
          <button className="btn btn-ghost btn-sm" disabled={(page + 1) * SIZE >= total} onClick={() => setPage(p => p + 1)}>Suivant →</button>
        </div>
      )}
    </div>
  );
}
