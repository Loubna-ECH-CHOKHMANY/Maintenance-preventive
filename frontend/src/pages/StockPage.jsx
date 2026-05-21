import React, { useState, useEffect, useCallback } from 'react';
import { stockAPI, downloadBlob, exportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Search, TrendingDown, TrendingUp, AlertTriangle, RefreshCw, Download, X, ArrowUp, ArrowDown, Edit, Trash2, BarChart2, ChevronRight } from 'lucide-react';

const CATS = ['MECANIQUE','ELECTRIQUE','HYDRAULIQUE','PNEUMATIQUE','ELECTRONIQUE','CONSOMMABLE','LUBRIFIANT','FILTRATION','COURROIE','ROULEMENT','JOINT','AUTRE'];
const MVT_TYPES = ['ENTREE','SORTIE','AJUSTEMENT','RETOUR','INVENTAIRE','PERTE'];
const MVT_COLORS = { ENTREE:'var(--success)', SORTIE:'var(--danger)', AJUSTEMENT:'var(--accent)', RETOUR:'var(--warning)', INVENTAIRE:'var(--accent2)', PERTE:'var(--danger)' };
const MVT_ICONS = { ENTREE:'↑', SORTIE:'↓', AJUSTEMENT:'⇄', RETOUR:'↩', INVENTAIRE:'≡', PERTE:'✕' };

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card" style={{ '--kpi-color': color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function PieceModal({ piece, onClose, onSave }) {
  const [f, setF] = useState(piece || {
    reference: '', designation: '', categorie: 'MECANIQUE', marque: '', fournisseur: '',
    unite: 'pièce', quantiteStock: 0, seuilAlerteMin: 2, seuilAlerteMax: 20,
    quantiteCommandeOptimale: 5, prixUnitaire: '', emplacement: '', description: ''
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...f, quantiteStock: +f.quantiteStock, seuilAlerteMin: +f.seuilAlerteMin, seuilAlerteMax: +f.seuilAlerteMax, quantiteCommandeOptimale: +f.quantiteCommandeOptimale, prixUnitaire: f.prixUnitaire ? +f.prixUnitaire : null };
      piece ? await stockAPI.updatePiece(piece.id, payload) : await stockAPI.createPiece(payload);
      onSave();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>{piece ? '✏️ Modifier pièce' : '➕ Nouvelle pièce de rechange'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 22 }}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            <div className="form-group"><label>Référence *</label><input value={f.reference} onChange={set('reference')} required placeholder="ex: ROUL-6205-2RS" disabled={!!piece} /></div>
            <div className="form-group"><label>Désignation *</label><input value={f.designation} onChange={set('designation')} required placeholder="ex: Roulement à billes SKF" /></div>
          </div>
          <div className="grid-3">
            <div className="form-group"><label>Catégorie</label>
              <select value={f.categorie} onChange={set('categorie')}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div className="form-group"><label>Marque</label><input value={f.marque} onChange={set('marque')} placeholder="SKF, Parker..." /></div>
            <div className="form-group"><label>Fournisseur</label><input value={f.fournisseur} onChange={set('fournisseur')} /></div>
          </div>
          <div className="grid-3">
            <div className="form-group"><label>Unité</label><input value={f.unite} onChange={set('unite')} placeholder="pièce, litre..." /></div>
            <div className="form-group"><label>Stock actuel</label><input type="number" min="0" value={f.quantiteStock} onChange={set('quantiteStock')} /></div>
            <div className="form-group"><label>Prix unitaire (MAD)</label><input type="number" step="0.01" min="0" value={f.prixUnitaire} onChange={set('prixUnitaire')} /></div>
          </div>
          <div className="grid-3">
            <div className="form-group"><label>Seuil min alerte</label><input type="number" min="0" value={f.seuilAlerteMin} onChange={set('seuilAlerteMin')} /></div>
            <div className="form-group"><label>Seuil max</label><input type="number" min="0" value={f.seuilAlerteMax} onChange={set('seuilAlerteMax')} /></div>
            <div className="form-group"><label>Qté commande optimale</label><input type="number" min="1" value={f.quantiteCommandeOptimale} onChange={set('quantiteCommandeOptimale')} /></div>
          </div>
          <div className="form-group"><label>Emplacement</label><input value={f.emplacement} onChange={set('emplacement')} placeholder="Rack A - Tiroir 3" /></div>
          <div className="form-group"><label>Description</label><textarea value={f.description} onChange={set('description')} rows={2} /></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '…' : '💾 Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MouvementModal({ piece, userId, onClose, onSave }) {
  const [f, setF] = useState({ type: 'ENTREE', quantite: 1, motif: '' });
  const [saving, setSaving] = useState(false);

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await stockAPI.mouvement(piece.id, f.type, f.quantite, f.motif, userId);
      onSave();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const isOut = ['SORTIE', 'PERTE'].includes(f.type);
  const qApres = isOut
    ? Math.max(0, (piece.quantiteStock || 0) - (+f.quantite || 0))
    : f.type === 'INVENTAIRE' ? (+f.quantite || 0) : (piece.quantiteStock || 0) + (+f.quantite || 0);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>📦 Mouvement de stock</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,.08)', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <strong>{piece.designation}</strong> — Stock actuel : <strong style={{ color: piece.quantiteStock === 0 ? 'var(--danger)' : piece.quantiteStock <= piece.seuilAlerteMin ? 'var(--warning)' : 'var(--success)' }}>{piece.quantiteStock} {piece.unite}</strong>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Type de mouvement</label>
            <select value={f.type} onChange={e => setF(x => ({ ...x, type: e.target.value }))}>
              {MVT_TYPES.map(t => <option key={t} value={t}>{MVT_ICONS[t]} {t}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Quantité</label>
            <input type="number" min="1" value={f.quantite} onChange={e => setF(x => ({ ...x, quantite: e.target.value }))} required />
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--surface)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--muted2)' }}>Stock après mouvement :</span>
            <strong style={{ fontSize: 18, color: qApres === 0 ? 'var(--danger)' : qApres <= piece.seuilAlerteMin ? 'var(--warning)' : 'var(--success)' }}>{qApres} {piece.unite}</strong>
          </div>
          <div className="form-group"><label>Motif / Référence</label><input value={f.motif} onChange={e => setF(x => ({ ...x, motif: e.target.value }))} placeholder="Numéro bon de commande, raison..." /></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '…' : '✅ Valider'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistoriqueModal({ piece, onClose }) {
  const [hist, setHist] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    stockAPI.getHistorique(piece.id).then(r => setHist(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [piece.id]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>📋 Historique — {piece.designation}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        {loading ? <div className="loading">Chargement...</div> : hist.length === 0 ? <div className="empty">Aucun mouvement enregistré</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Type</th><th>Qté</th><th>Avant</th><th>Après</th><th>Motif</th><th>Date</th></tr></thead>
              <tbody>
                {hist.map(m => (
                  <tr key={m.id}>
                    <td><span style={{ color: MVT_COLORS[m.typeMouvement], fontWeight: 600, fontSize: 12 }}>{MVT_ICONS[m.typeMouvement]} {m.typeMouvement}</span></td>
                    <td><strong>{m.typeMouvement === 'SORTIE' || m.typeMouvement === 'PERTE' ? '-' : '+'}{m.quantite}</strong></td>
                    <td style={{ color: 'var(--muted)' }}>{m.quantiteAvant}</td>
                    <td style={{ fontWeight: 600 }}>{m.quantiteApres}</td>
                    <td style={{ color: 'var(--muted2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.motif || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--muted)' }}>{m.createdAt ? new Date(m.createdAt).toLocaleString('fr-FR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StockPage() {
  const { user } = useAuth();
  const [pieces, setPieces] = useState([]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'mouvement' | 'historique'
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([stockAPI.getPieces(), stockAPI.getResume()]);
      setPieces(pRes.data);
      setResume(rRes.data);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async piece => {
    if (!confirm(`Supprimer "${piece.designation}" ?`)) return;
    try { await stockAPI.deletePiece(piece.id); load(); } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const handleExport = async type => {
    try {
      const res = type === 'csv' ? await exportAPI.stockCSV() : await exportAPI.stockExcel();
      downloadBlob(res.data, `stock.${type === 'csv' ? 'csv' : 'xlsx'}`);
    } catch { alert('Erreur export'); }
  };

  const filtered = pieces.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.designation?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q) || p.marque?.toLowerCase().includes(q);
    const matchCat = !filterCat || p.categorie === filterCat;
    const matchStatus = !filterStatus || (filterStatus === 'alerte' ? p.enAlerte : filterStatus === 'rupture' ? p.enRupture : filterStatus === 'ok' ? (!p.enAlerte && !p.enRupture) : true);
    const matchTab = activeTab === 'all' ? true : activeTab === 'alerte' ? p.enAlerte : p.enRupture;
    return matchSearch && matchCat && matchStatus && matchTab;
  });

  const pAlertes = pieces.filter(p => p.enAlerte).length;
  const pRuptures = pieces.filter(p => p.enRupture).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Stock Pièces de Rechange</h1>
          <p className="page-subtitle">Gestion du magasin — mouvements, alertes, historique</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => handleExport('csv')}><Download size={14} /> CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleExport('excel')}><Download size={14} /> Excel</button>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} /></button>
          {['ADMIN','RESPONSABLE_MAINTENANCE'].includes(user?.role) && (
            <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('create'); }}>
              <Plus size={15} /> Ajouter pièce
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {resume && (
        <div className="grid-4">
          <StatCard icon={Package} label="Total pièces" value={resume.totalPieces} color="var(--accent)" />
          <StatCard icon={AlertTriangle} label="En alerte" value={pAlertes} color="var(--warning)" sub="Stock bas" />
          <StatCard icon={TrendingDown} label="Ruptures" value={pRuptures} color="var(--danger)" sub="Stock = 0" />
          <StatCard icon={BarChart2} label="Valeur totale" value={`${(resume.valeurTotaleStock||0).toLocaleString('fr-FR')} MAD`} color="var(--success)" />
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[['all','Tout le stock'], ['alerte','⚠️ Alertes ' + (pAlertes > 0 ? `(${pAlertes})` : '')], ['rupture','🔴 Ruptures ' + (pRuptures > 0 ? `(${pRuptures})` : '')]].map(([k, l]) => (
          <button key={k} className={`tab-btn ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 260 }}>
          <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input placeholder="Référence, désignation, marque..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">Toutes catégories</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 140 }}>
          <option value="">Tous statuts</option>
          <option value="ok">✅ OK</option>
          <option value="alerte">⚠️ Alerte</option>
          <option value="rupture">🔴 Rupture</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted2)', marginLeft: 'auto' }}>{filtered.length} pièce(s)</span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="loading-spinner" /><div>Chargement du stock...</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon">📦</div><div>Aucune pièce trouvée</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Référence</th><th>Désignation</th><th>Catégorie</th><th>Marque</th>
                  <th>Stock</th><th>Seuil min</th><th>Prix unit.</th><th>Emplacement</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const statusColor = p.enRupture ? 'var(--danger)' : p.enAlerte ? 'var(--warning)' : 'var(--success)';
                  return (
                    <tr key={p.id}>
                      <td><span className="mono" style={{ fontSize: 12, color: 'var(--accent2)' }}>{p.reference}</span></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.designation}</div>
                        {p.fournisseur && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.fournisseur}</div>}
                      </td>
                      <td><span className="badge badge-secondary" style={{ fontSize: 10 }}>{p.categorie}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--muted2)' }}>{p.marque || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="status-dot" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                          <strong style={{ color: statusColor, fontSize: 14 }}>{p.quantiteStock ?? 0}</strong>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.unite}</span>
                          {p.enRupture && <span className="badge badge-danger" style={{ fontSize: 9 }}>RUPTURE</span>}
                          {!p.enRupture && p.enAlerte && <span className="badge badge-warning" style={{ fontSize: 9 }}>ALERTE</span>}
                        </div>
                        {p.seuilAlerteMin !== null && (
                          <div className="progress-bar" style={{ marginTop: 4, width: 80 }}>
                            <div className="progress-fill" style={{ background: statusColor, width: `${Math.min(100, ((p.quantiteStock || 0) / (p.seuilAlerteMax || 1)) * 100)}%` }} />
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted2)' }}>{p.seuilAlerteMin ?? '—'}</td>
                      <td style={{ fontSize: 12 }}>{p.prixUnitaire ? `${p.prixUnitaire.toLocaleString('fr-FR')} MAD` : '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--muted2)' }}>{p.emplacement || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" title="Entrée/Sortie" onClick={() => { setSelected(p); setModal('mouvement'); }}>
                            <ArrowUp size={13} style={{ color: 'var(--success)' }} />
                          </button>
                          <button className="btn btn-ghost btn-sm btn-icon" title="Historique" onClick={() => { setSelected(p); setModal('historique'); }}>
                            <BarChart2 size={13} style={{ color: 'var(--accent)' }} />
                          </button>
                          {['ADMIN','RESPONSABLE_MAINTENANCE'].includes(user?.role) && <>
                            <button className="btn btn-ghost btn-sm btn-icon" title="Modifier" onClick={() => { setSelected(p); setModal('edit'); }}>
                              <Edit size={13} style={{ color: 'var(--accent2)' }} />
                            </button>
                            <button className="btn btn-ghost btn-sm btn-icon" title="Supprimer" onClick={() => handleDelete(p)}>
                              <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                            </button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <PieceModal piece={modal === 'edit' ? selected : null} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />
      )}
      {modal === 'mouvement' && selected && (
        <MouvementModal piece={selected} userId={user?.userId} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />
      )}
      {modal === 'historique' && selected && (
        <HistoriqueModal piece={selected} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
