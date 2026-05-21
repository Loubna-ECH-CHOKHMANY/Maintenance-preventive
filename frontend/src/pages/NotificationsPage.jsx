import React, { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, BellOff, CheckCheck, RefreshCw, Filter, Clock } from 'lucide-react';

const TYPE_CFG = {
  INTERVENTION_PLANIFIEE: { icon: '📅', color: 'var(--accent)',   label: 'Planification' },
  INTERVENTION_EN_RETARD: { icon: '⏰', color: 'var(--danger)',   label: 'Retard' },
  STOCK_ALERTE_MIN:       { icon: '📦', color: 'var(--warning)',  label: 'Stock' },
  STOCK_ALERTE_MAX:       { icon: '📦', color: 'var(--accent2)',  label: 'Stock' },
  PANNE_DECLAREE:         { icon: '🚨', color: 'var(--danger)',   label: 'Panne' },
  PANNE_RESOLUE:          { icon: '✅', color: 'var(--success)',  label: 'Panne résolue' },
  VALIDATION_REQUISE:     { icon: '✔️', color: 'var(--accent3)',  label: 'Validation' },
  SYSTEME:                { icon: '⚙️', color: 'var(--muted2)',   label: 'Système' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | read
  const [filterType, setFilterType] = useState('');

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const res = await notificationsAPI.getMes(user.userId);
      setNotifs(res.data);
    } catch { }
    finally { setLoading(false); }
  }, [user?.userId]);

  useEffect(() => { load(); }, [load]);

  // Real-time polling every 15s
  useEffect(() => {
    const iv = setInterval(() => { if (user?.userId) load(); }, 15000);
    return () => clearInterval(iv);
  }, [load, user?.userId]);

  const handleMarquerLue = async id => {
    try {
      await notificationsAPI.marquerLue(id);
      setNotifs(n => n.map(x => x.id === id ? { ...x, lue: true } : x));
    } catch { }
  };

  const handleMarquerToutes = async () => {
    try {
      await notificationsAPI.marquerToutes(user.userId);
      setNotifs(n => n.map(x => ({ ...x, lue: true })));
    } catch { }
  };

  const filtered = notifs.filter(n => {
    const matchFilter = filter === 'all' ? true : filter === 'unread' ? !n.lue : n.lue;
    const matchType = !filterType || n.type === filterType;
    return matchFilter && matchType;
  });

  const unreadCount = notifs.filter(n => !n.lue).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            🔔 Notifications
            {unreadCount > 0 && <span style={{ marginLeft: 10, background: 'var(--danger)', color: '#fff', fontSize: 13, padding: '2px 10px', borderRadius: 20, fontFamily: 'DM Sans' }}>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>}
          </h1>
          <p className="page-subtitle">Centre de notifications en temps réel · Actualisation toutes les 15s</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} /></button>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarquerToutes}>
              <CheckCheck size={14} /> Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        {[
          { l: 'Total', v: notifs.length, c: 'var(--muted2)' },
          { l: 'Non lues', v: unreadCount, c: 'var(--danger)' },
          { l: 'Pannes', v: notifs.filter(n => n.type?.startsWith('PANNE')).length, c: 'var(--warning)' },
          { l: 'Stock', v: notifs.filter(n => n.type?.startsWith('STOCK')).length, c: 'var(--accent)' },
        ].map(({ l, v, c }) => (
          <div key={l} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="tabs" style={{ margin: 0, border: 'none' }}>
          {[['all','Toutes'], ['unread','Non lues'], ['read','Lues']].map(([k, l]) => (
            <button key={k} className={`tab-btn ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">Tous types</option>
          {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted2)', marginLeft: 'auto' }}>{filtered.length} notification(s)</span>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="loading"><div className="loading-spinner" /><div>Chargement...</div></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty">
            <BellOff size={36} style={{ color: 'var(--muted)', margin: '0 auto 12px', display: 'block' }} />
            <div>Aucune notification{filter !== 'all' ? ' dans cette catégorie' : ''}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(n => {
            const cfg = TYPE_CFG[n.type] || TYPE_CFG.SYSTEME;
            return (
              <div key={n.id}
                className="card"
                style={{
                  padding: '14px 18px',
                  borderLeft: `3px solid ${n.lue ? 'var(--border)' : cfg.color}`,
                  opacity: n.lue ? 0.7 : 1,
                  cursor: n.lue ? 'default' : 'pointer',
                  transition: 'all .2s',
                }}
                onClick={() => !n.lue && handleMarquerLue(n.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                  }}>{cfg.icon}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: n.lue ? 500 : 700, color: n.lue ? 'var(--text)' : 'var(--white)' }}>
                        {n.titre}
                      </span>
                      <span className="badge" style={{ background: `${cfg.color}20`, color: cfg.color, fontSize: 9 }}>{cfg.label}</span>
                      {!n.lue && <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`, flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <Clock size={11} style={{ color: 'var(--muted)' }} />
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(n.createdAt)}</span>
                      {n.lue && n.lueLe && <span style={{ fontSize: 11, color: 'var(--muted)' }}>· Lu {timeAgo(n.lueLe)}</span>}
                    </div>
                  </div>

                  {!n.lue && (
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ flexShrink: 0 }}
                      onClick={e => { e.stopPropagation(); handleMarquerLue(n.id); }}
                      title="Marquer comme lu">
                      <CheckCheck size={14} style={{ color: 'var(--success)' }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
